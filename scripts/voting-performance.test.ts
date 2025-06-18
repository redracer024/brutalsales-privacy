import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

// Initialize Supabase client for normal operations
const supabaseUrl = 'https://ujkyaakvirotkyfylpsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3lhYWt2aXJvdGt5ZnlscHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTYxOTQsImV4cCI6MjA2NTIzMjE5NH0.0sPjlzxwEYd2ifjuJrOdEp5zC_vOMagRBaQ_YoIJoBk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Service role key for admin deletes
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3lhYWt2aXJvdGt5ZnlscHN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY1NjE5NCwiZXhwIjoyMDY1MjMyMTk0fQ.g-vccsjALBRZim8S1AwlTUcJiGNf5UOSe2hJ3P237eQ';
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Test configuration
const NUM_USERS = 5;
const VOTES_PER_USER = 2;
const CONCURRENT_REQUESTS = 2;
const REQUEST_DELAY = 1000;

interface TestUser {
  id: string;
  email: string;
}

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createTestUser(index: number): Promise<TestUser> {
  await delay(REQUEST_DELAY); // Add delay before each request
  const email = `test${index}@example.com`;
  const password = 'test123456';

  // Try to sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error && error.status === 422 && error.code === 'user_already_exists') {
    // User exists, try to sign in
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) throw loginError;
    if (!loginData.user) throw new Error('Failed to log in existing test user');
    return {
      id: loginData.user.id,
      email: loginData.user.email!,
    };
  }

  if (error) throw error;
  if (!data.user) throw new Error('Failed to create test user');

  return {
    id: data.user.id,
    email: data.user.email!,
  };
}

interface Feature {
  id: string;
}

async function getAllFeatures(): Promise<Feature[]> {
  const { data: features, error } = await supabase
    .from('feature_ideas')
    .select('id')
    .is('deleted_at', null);
  if (error) throw error;
  if (!features || features.length === 0) throw new Error('No features found');
  return features;
}

async function voteOnFeature(userId: string, featureId: string) {
  const { error } = await supabase
    .from('feature_votes')
    .insert({
      feature_id: featureId,
      user_id: userId
    });

  if (error) throw error;
}

async function removeVote(userId: string, featureId: string) {
  const { data: vote, error: findError } = await supabase
    .from('feature_votes')
    .select('id')
    .eq('feature_id', featureId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (findError) throw findError;

  const { error: updateError } = await supabase
    .from('feature_votes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', vote.id);

  if (updateError) throw updateError;
}

async function clearVotesForUsers(userIds: string[]) {
  // Hard-delete all votes for these users using the service role
  const { data, error } = await supabaseAdmin
    .from('feature_votes')
    .delete()
    .in('user_id', userIds);
  if (error) throw error;
  console.log(`Deleted votes for test users:`, data);
}

async function runPerformanceTest() {
  console.log('Starting voting system performance test...');
  const startTime = performance.now();

  try {
    // Create test users
    console.log(`Creating ${NUM_USERS} test users...`);
    let users;
    try {
      users = await Promise.all(
        Array.from({ length: NUM_USERS }, (_, i) => createTestUser(i).catch(e => {
          console.error(`Error creating user ${i}:`, e);
          throw e;
        }))
      );
    } catch (e) {
      console.error('User creation failed:', e);
      throw e;
    }

    // Clean up all votes for test users
    await clearVotesForUsers(users.map(u => u.id));

    // Fetch all features
    const allFeatures = await getAllFeatures();
    if (allFeatures.length < VOTES_PER_USER) {
      throw new Error('Not enough features in the database for the test. Please add more.');
    }

    // Test voting performance
    console.log(`Testing voting performance with ${VOTES_PER_USER} votes per user...`);
    const votePromises = users.flatMap((user, userIdx) =>
      Array.from({ length: VOTES_PER_USER }, async (_, voteIdx) => {
        try {
          // Assign a unique feature to each vote
          const feature = allFeatures[(userIdx * VOTES_PER_USER + voteIdx) % allFeatures.length];
          await voteOnFeature(user.id, feature.id);
        } catch (e) {
          console.error(`Error voting for user ${user.email} (vote #${voteIdx}):`, e);
          throw e;
        }
      })
    );

    for (let i = 0; i < votePromises.length; i += CONCURRENT_REQUESTS) {
      const batch = votePromises.slice(i, i + CONCURRENT_REQUESTS);
      try {
        await Promise.all(batch);
      } catch (e) {
        console.error('Voting batch failed:', e);
        throw e;
      }
      console.log(`Processed batch ${i / CONCURRENT_REQUESTS + 1} of ${Math.ceil(votePromises.length / CONCURRENT_REQUESTS)}`);
    }

    // Test vote removal performance
    console.log('Testing vote removal performance...');
    const removePromises = users.flatMap((user, userIdx) =>
      Array.from({ length: VOTES_PER_USER }, async (_, voteIdx) => {
        try {
          // Remove the same votes as above
          const feature = allFeatures[(userIdx * VOTES_PER_USER + voteIdx) % allFeatures.length];
          await removeVote(user.id, feature.id);
        } catch (e) {
          console.error(`Error removing vote for user ${user.email} (removal #${voteIdx}):`, e);
          throw e;
        }
      })
    );

    for (let i = 0; i < removePromises.length; i += CONCURRENT_REQUESTS) {
      const batch = removePromises.slice(i, i + CONCURRENT_REQUESTS);
      try {
        await Promise.all(batch);
      } catch (e) {
        console.error('Removal batch failed:', e);
        throw e;
      }
      console.log(`Processed removal batch ${i / CONCURRENT_REQUESTS + 1} of ${Math.ceil(removePromises.length / CONCURRENT_REQUESTS)}`);
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    const totalOperations = NUM_USERS * VOTES_PER_USER * 2; // Votes + removals
    const operationsPerSecond = totalOperations / totalTime;

    console.log('\nPerformance Test Results:');
    console.log('------------------------');
    console.log(`Total Users: ${NUM_USERS}`);
    console.log(`Votes per User: ${VOTES_PER_USER}`);
    console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);
    console.log(`Total Operations: ${totalOperations}`);
    console.log(`Total Time: ${totalTime.toFixed(2)} seconds`);
    console.log(`Operations per Second: ${operationsPerSecond.toFixed(2)}`);
    console.log(`Average Response Time: ${(totalTime / totalOperations * 1000).toFixed(2)}ms`);

  } catch (error) {
    console.error('Performance test failed:', error);
  }
}

// Run the test
runPerformanceTest(); 
import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const NUM_USERS = 50;
const VOTES_PER_USER = 10;
const CONCURRENT_REQUESTS = 5;

async function createTestUser(index: number) {
  const email = `test-user-${index}@example.com`;
  const password = 'test-password-123';
  
  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return user;
}

async function getRandomFeature() {
  const { data: features, error } = await supabase
    .from('feature_ideas')
    .select('id')
    .is('deleted_at', null)
    .limit(1);

  if (error) throw error;
  return features[0];
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

async function runPerformanceTest() {
  console.log('Starting voting system performance test...');
  const startTime = performance.now();

  try {
    // Create test users
    console.log(`Creating ${NUM_USERS} test users...`);
    const users = await Promise.all(
      Array.from({ length: NUM_USERS }, (_, i) => createTestUser(i))
    );

    // Test voting performance
    console.log(`Testing voting performance with ${VOTES_PER_USER} votes per user...`);
    const votePromises = users.flatMap(async (user) => {
      const votes = [];
      for (let i = 0; i < VOTES_PER_USER; i++) {
        const feature = await getRandomFeature();
        votes.push(voteOnFeature(user.id, feature.id));
      }
      return Promise.all(votes);
    });

    // Process votes in batches to control concurrency
    for (let i = 0; i < votePromises.length; i += CONCURRENT_REQUESTS) {
      const batch = votePromises.slice(i, i + CONCURRENT_REQUESTS);
      await Promise.all(batch);
      console.log(`Processed batch ${i / CONCURRENT_REQUESTS + 1} of ${Math.ceil(votePromises.length / CONCURRENT_REQUESTS)}`);
    }

    // Test vote removal performance
    console.log('Testing vote removal performance...');
    const removePromises = users.flatMap(async (user) => {
      const removals = [];
      for (let i = 0; i < VOTES_PER_USER; i++) {
        const feature = await getRandomFeature();
        removals.push(removeVote(user.id, feature.id));
      }
      return Promise.all(removals);
    });

    // Process removals in batches
    for (let i = 0; i < removePromises.length; i += CONCURRENT_REQUESTS) {
      const batch = removePromises.slice(i, i + CONCURRENT_REQUESTS);
      await Promise.all(batch);
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
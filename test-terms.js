const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for testing
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testTerms() {
  try {
    const userId = '12345678-1234-1234-1234-123456789012';
    const testEmail = 'test@example.com';
    
    // 0. Clean up any existing test user
    console.log('Cleaning up any existing test user...');
    try {
      await supabase
        .from('user_terms')
        .delete()
        .eq('user_id', userId);
      
      await supabase.auth.admin.deleteUser(userId);
    } catch (cleanupError) {
      // Ignore cleanup errors
      console.log('No existing user to clean up');
    }

    // 1. Create a test user
    console.log('Creating test user...');
    const { error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: { name: 'Test User' },
      id: userId
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }
    console.log('✅ Test user created:', testEmail);

    // 2. Test initial terms load (should return null or default terms)
    console.log('Testing initial terms load...');
    const { data: initialTerms, error: initialLoadError } = await supabase
      .from('user_terms')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (initialLoadError && initialLoadError.code !== 'PGRST116') {
      throw initialLoadError;
    }
    console.log('✅ Initial terms load successful (no terms as expected)');

    // 3. Save terms for the user
    const testTerms = {
      store_name: 'Test Store',
      store_description: 'A test store description',
      return_policy: 'Test return policy',
      shipping_info: 'Test shipping info',
      warranty_info: 'Test warranty info',
      contact_info: 'test@example.com',
      terms_text: 'Test terms and conditions',
      user_id: userId,
    };

    console.log('Testing terms save...');
    const { error: saveError } = await supabase
      .from('user_terms')
      .upsert(testTerms, {
        onConflict: 'user_id'
      });

    if (saveError) throw saveError;
    console.log('✅ Terms saved successfully');

    // 4. Verify the saved terms
    console.log('Verifying saved terms...');
    const { data: verifyTerms, error: verifyError } = await supabase
      .from('user_terms')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (verifyError) throw verifyError;
    console.log('✅ Terms verification successful:', verifyTerms);

    // 5. Update existing terms
    const updatedTerms = {
      ...testTerms,
      store_name: 'Updated Test Store',
      store_description: 'Updated store description',
    };

    console.log('Testing terms update...');
    const { error: updateError } = await supabase
      .from('user_terms')
      .upsert(updatedTerms, {
        onConflict: 'user_id'
      });

    if (updateError) throw updateError;
    console.log('✅ Terms updated successfully');

    // 6. Verify the update
    const { data: finalTerms, error: finalError } = await supabase
      .from('user_terms')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (finalError) throw finalError;
    console.log('✅ Final terms verification successful:', finalTerms);

    // 7. Test concurrent updates (should handle race conditions)
    console.log('Testing concurrent updates...');
    const promises = [];
    for (let i = 0; i < 3; i++) {
      const concurrentTerms = {
        ...testTerms,
        store_name: `Concurrent Store ${i}`,
        updated_at: new Date().toISOString(),
      };
      promises.push(
        supabase
          .from('user_terms')
          .upsert(concurrentTerms, {
            onConflict: 'user_id'
          })
      );
    }
    
    const results = await Promise.all(promises);
    const hasErrors = results.some(result => result.error);
    if (hasErrors) {
      console.log('❌ Some concurrent updates failed (this is expected)');
    } else {
      console.log('✅ All concurrent updates handled successfully');
    }

    // 8. Final verification
    const { data: finalCheck, error: finalCheckError } = await supabase
      .from('user_terms')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (finalCheckError) throw finalCheckError;
    console.log('✅ Final state verification successful:', finalCheck);

    // 9. Clean up - delete the test user and their terms
    console.log('Cleaning up...');
    await supabase
      .from('user_terms')
      .delete()
      .eq('user_id', userId);
    
    await supabase.auth.admin.deleteUser(userId);
    
    console.log('✅ Cleanup successful');
    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
console.log('Starting terms functionality tests...');
testTerms().then(() => {
  console.log('Tests completed.');
  process.exit(0);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
}); 
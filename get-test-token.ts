import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ujkyaakvirotkyfylpsx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3lhYWt2aXJvdGt5ZnlscHN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY1NjE5NCwiZXhwIjoyMDY1MjMyMTk0fQ.g-vccsjALBRZim8S1AwlTUcJiGNf5UOSe2hJ3P237eQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getTestToken() {
  try {
    // Sign in with a test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (error) {
      // If user doesn't exist, create one
      if (error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'testpassword123'
        });

        if (signUpError) {
          console.error('Error creating test user:', signUpError);
          return;
        }

        console.log('Test user created. Please check your email to confirm the account.');
        return;
      }

      console.error('Error signing in:', error);
      return;
    }

    console.log('Successfully signed in!');
    console.log('Access Token:', data.session?.access_token);
    console.log('User ID:', data.user?.id);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getTestToken(); 
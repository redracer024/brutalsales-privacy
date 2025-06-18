const SUPABASE_URL = "https://ujkyaakvirotkyfylpsx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3lhYWt2aXJvdGt5ZnlscHN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY1NjE5NCwiZXhwIjoyMDY1MjMyMTk0fQ.g-vccsjALBRZim8S1AwlTUcJiGNf5UOSe2hJ3P237eQ";

async function testSupabase() {
  try {
    // Test a simple query to verify connectivity
    const response = await fetch(`${SUPABASE_URL}/rest/v1/google_play_purchases?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error:', errorText);
      throw new Error(`Failed to connect to Supabase: ${errorText}`);
    }

    const data = await response.json();
    console.log('Supabase connection successful:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSupabase(); 
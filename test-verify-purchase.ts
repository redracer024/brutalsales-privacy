import { serve } from "std/http/server.ts"

// Test cases for verify-purchase Edge Function
const TEST_JWT_TOKEN = Deno.env.get("TEST_JWT_TOKEN");
if (!TEST_JWT_TOKEN) {
  console.error("TEST_JWT_TOKEN environment variable not set. Please set it to your test JWT token.");
  Deno.exit(1);
}

async function runTest(name: string, body: any) {
  console.log(`\nRunning test: ${name}`);
  const response = await fetch("http://localhost:8001", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TEST_JWT_TOKEN}`,
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  console.log("Response:", data);
}

// Test cases
await runTest("Valid purchase", {
  purchaseToken: "test-purchase-token",
  productId: "test-product-id"
});

await runTest("Missing purchaseToken", {
  productId: "test-product-id"
});

await runTest("Missing productId", {
  purchaseToken: "test-purchase-token"
});

await runTest("Different product", {
  purchaseToken: "test-purchase-token",
  productId: "premium-subscription"
});

// Set environment variables for testing
Deno.env.set("SUPABASE_URL", "https://ujkyaakvirotkyfylpsx.supabase.com");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3lhYWt2aXJvdGt5ZnlscHN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY1NjE5NCwiZXhwIjoyMDY1MjMyMTk0fQ.g-vccsjALBRZim8S1AwlTUcJiGNf5UOSe2hJ3P237eQ");
Deno.env.set("GOOGLE_PLAY_API_KEY", "AIzaSyBp-teqLbNUiSP119MyuYSelebo_Bnhat youre tGMI");

// Import the Edge Function
const { serve: edgeFunction } = await import("./supabase/functions/verify-purchase/index.ts");

// Start the server
serve(edgeFunction, { port: 8001 });
console.log("Server running at http://localhost:8001/"); 
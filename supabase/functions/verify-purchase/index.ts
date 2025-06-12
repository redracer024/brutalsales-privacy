import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const API_KEY = Deno.env.get('GOOGLE_PLAY_API_KEY');

Deno.serve(async (req) => {
  try {
    const { purchaseToken, productId, userId } = await req.json();
    
    if (!purchaseToken || !productId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify purchase with Google Play API
    const response = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.brutalsales.app/purchases/subscriptions/${productId}/tokens/${purchaseToken}?key=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify purchase with Google Play');
    }

    const data = await response.json();

    if (data.paymentState === 1) { // Payment received
      // Store purchase in database
      const { error } = await supabase
        .from('google_play_purchases')
        .insert({
          user_id: userId,
          product_id: productId,
          purchase_token: purchaseToken,
          transaction_id: data.orderId,
          transaction_date: Date.now(),
          acknowledged: true
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          verified: true,
          expiryTimeMillis: data.expiryTimeMillis,
          startTimeMillis: data.startTimeMillis
        }), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ verified: false }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Purchase verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 
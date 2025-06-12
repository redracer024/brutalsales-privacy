-- Create table for Google Play purchases
CREATE TABLE IF NOT EXISTS google_play_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id text NOT NULL,
  purchase_token text NOT NULL,
  transaction_id text NOT NULL,
  transaction_date bigint NOT NULL,
  acknowledged boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS
ALTER TABLE google_play_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases"
  ON google_play_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own purchases"
  ON google_play_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_google_play_purchases_user_id ON google_play_purchases(user_id);
CREATE INDEX idx_google_play_purchases_product_id ON google_play_purchases(product_id); 
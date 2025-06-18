-- Create user_terms table
CREATE TABLE IF NOT EXISTS user_terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT,
    store_description TEXT,
    return_policy TEXT,
    shipping_info TEXT,
    warranty_info TEXT,
    contact_info TEXT,
    terms_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own terms" ON user_terms;
DROP POLICY IF EXISTS "Users can insert their own terms" ON user_terms;
DROP POLICY IF EXISTS "Users can update their own terms" ON user_terms;

-- Enable RLS
ALTER TABLE user_terms ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "Users can view their own terms"
    ON user_terms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own terms"
    ON user_terms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own terms"
    ON user_terms FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON user_terms;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_terms
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

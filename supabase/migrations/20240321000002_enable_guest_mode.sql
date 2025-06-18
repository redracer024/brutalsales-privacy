-- Create function to check if user is guest
CREATE OR REPLACE FUNCTION public.is_guest()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() = 'guest@brutalsales.app';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create policy to allow guest access to basic features
CREATE POLICY "Guest users can view basic features"
    ON public.user_terms
    FOR SELECT
    USING (true);

-- Create policy to allow guest users to create temporary terms
CREATE POLICY "Guest users can create temporary terms"
    ON public.user_terms
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant basic access to guest users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon; 
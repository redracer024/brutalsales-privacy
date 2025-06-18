-- Drop existing view if it exists
DROP VIEW IF EXISTS public.feature_ideas_with_votes;

-- Create the view without SECURITY DEFINER
CREATE VIEW public.feature_ideas_with_votes AS
SELECT 
    f.*,
    COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
    COALESCE(SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes
FROM public.feature_ideas f
LEFT JOIN public.feature_votes v ON f.id = v.feature_id
GROUP BY f.id;

-- Grant access to authenticated users
GRANT SELECT ON public.feature_ideas_with_votes TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own terms" ON public.user_terms;
DROP POLICY IF EXISTS "Users can insert their own terms" ON public.user_terms;
DROP POLICY IF EXISTS "Users can update their own terms" ON public.user_terms;

-- Enable RLS
ALTER TABLE public.user_terms ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "Users can view their own terms"
    ON public.user_terms
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own terms"
    ON public.user_terms
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own terms"
    ON public.user_terms
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.user_terms TO authenticated;

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.user_terms;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_terms
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
-- Create feature_ideas table
CREATE TABLE IF NOT EXISTS public.feature_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS public.feature_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID REFERENCES public.feature_ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(feature_id, user_id)
);

-- Enable RLS
ALTER TABLE public.feature_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is guest
CREATE OR REPLACE FUNCTION public.is_guest()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() = current_setting('app.guest_email', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Update policies for feature_ideas
DROP POLICY IF EXISTS "Anyone can view features" ON public.feature_ideas;
DROP POLICY IF EXISTS "Authenticated users can create features" ON public.feature_ideas;

CREATE POLICY "Anyone can view features"
    ON public.feature_ideas
    FOR SELECT
    USING (true);

CREATE POLICY "Non-guest users can create features"
    ON public.feature_ideas
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND NOT public.is_guest());

-- Update policies for feature_votes
DROP POLICY IF EXISTS "Anyone can view votes" ON public.feature_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.feature_votes;

CREATE POLICY "Anyone can view votes"
    ON public.feature_votes
    FOR SELECT
    USING (true);

CREATE POLICY "Non-guest users can vote"
    ON public.feature_votes
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND NOT public.is_guest());

CREATE POLICY "Users can update their own votes"
    ON public.feature_votes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON public.feature_votes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_feature_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_feature_updated_at ON public.feature_ideas;
CREATE TRIGGER set_feature_updated_at
    BEFORE UPDATE ON public.feature_ideas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_feature_updated_at();

-- Create view for features with vote counts
CREATE OR REPLACE VIEW public.feature_ideas_with_votes AS
SELECT 
    f.*,
    COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
    COALESCE(SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes
FROM public.feature_ideas f
LEFT JOIN public.feature_votes v ON f.id = v.feature_id
GROUP BY f.id;

-- Grant access to authenticated users
GRANT ALL ON public.feature_ideas TO authenticated;
GRANT ALL ON public.feature_votes TO authenticated;
GRANT SELECT ON public.feature_ideas_with_votes TO authenticated; 
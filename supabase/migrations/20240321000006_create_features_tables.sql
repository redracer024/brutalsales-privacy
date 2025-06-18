-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'planned', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create feature votes table
CREATE TABLE IF NOT EXISTS public.feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

-- Enable RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for features
CREATE POLICY "Everyone can view features"
    ON public.features
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create features"
    ON public.features
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own features"
    ON public.features
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own features"
    ON public.features
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for feature votes
CREATE POLICY "Everyone can view votes"
    ON public.feature_votes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can vote"
    ON public.feature_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their votes"
    ON public.feature_votes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
    ON public.feature_votes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER features_updated_at
    BEFORE UPDATE ON public.features
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER feature_votes_updated_at
    BEFORE UPDATE ON public.feature_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
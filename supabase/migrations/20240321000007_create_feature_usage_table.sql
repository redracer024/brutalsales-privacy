-- Create feature_usage table
CREATE TABLE IF NOT EXISTS public.feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage"
    ON public.feature_usage
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
    ON public.feature_usage
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
    ON public.feature_usage
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
    p_user_id UUID,
    p_feature_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.feature_usage (user_id, feature_name, usage_count)
    VALUES (p_user_id, p_feature_name, 1)
    ON CONFLICT (user_id, feature_name)
    DO UPDATE SET
        usage_count = feature_usage.usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW();
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER feature_usage_updated_at
    BEFORE UPDATE ON public.feature_usage
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
-- Add daily_usage column to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS daily_usage INTEGER DEFAULT 0;

-- Create function to increment daily usage
CREATE OR REPLACE FUNCTION public.increment_daily_usage(
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, daily_usage)
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        daily_usage = COALESCE(user_settings.daily_usage, 0) + 1,
        updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_daily_usage TO authenticated; 
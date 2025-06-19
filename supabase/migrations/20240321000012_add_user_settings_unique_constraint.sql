-- Add unique constraint on user_id in user_settings table
ALTER TABLE public.user_settings
ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id); 
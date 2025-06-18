-- Insert sample products
INSERT INTO public.products (user_id, name, description)
SELECT 
    id as user_id,
    'Sample Product ' || generate_series(1, 3) as name,
    'This is a sample product description ' || generate_series(1, 3) as description
FROM auth.users 
WHERE email = 'guest@brutalsales.app'
ON CONFLICT DO NOTHING; 
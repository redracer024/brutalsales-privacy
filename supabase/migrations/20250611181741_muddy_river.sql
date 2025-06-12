-- Update feature ideas to restore proper tier voting system
-- This restores the original tier assignments for realistic voting

UPDATE feature_ideas SET required_tier = 'premium' WHERE title = 'Description Templates';
UPDATE feature_ideas SET required_tier = 'premium' WHERE title = 'Description History';
UPDATE feature_ideas SET required_tier = 'premium' WHERE title = 'AI Style Personalities';
UPDATE feature_ideas SET required_tier = 'premium' WHERE title = 'Seasonal Optimization';
UPDATE feature_ideas SET required_tier = 'premium' WHERE title = 'Mobile App';

UPDATE feature_ideas SET required_tier = 'pro' WHERE title = 'Photo-to-Description AI';
UPDATE feature_ideas SET required_tier = 'pro' WHERE title = 'Social Media Integration';
UPDATE feature_ideas SET required_tier = 'pro' WHERE title = 'Competitor Analysis';

-- Keep these as free tier
UPDATE feature_ideas SET required_tier = 'free' WHERE title = 'Dark/Light Theme Toggle';
UPDATE feature_ideas SET required_tier = 'free' WHERE title = 'Export to Multiple Formats';
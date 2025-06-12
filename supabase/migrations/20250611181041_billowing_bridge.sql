/*
  # Feature Voting System - Additional Data

  1. Changes
    - Insert diverse feature ideas for voting
    - All features marked as free tier for now
    - Mix of easy wins and ambitious features
    - Realistic development timelines

  2. Security
    - Uses existing RLS policies from previous migration
    - No schema changes, only data inserts
*/

-- Insert diverse feature ideas for voting
INSERT INTO feature_ideas (
    title, 
    description, 
    category, 
    status, 
    required_tier, 
    estimated_development_time, 
    submitted_by_name
) VALUES 
-- Easy to implement features (1-2 weeks)
(
    'Dark/Light Theme Toggle',
    'Switch between dark and light themes for better user experience',
    'ui',
    'voting',
    'free',
    '1 week',
    'BrutalSales Team'
),
(
    'Description Templates',
    'Pre-made templates for different product categories (electronics, clothing, etc.)',
    'productivity',
    'voting',
    'free',
    '1-2 weeks',
    'BrutalSales Team'
),
(
    'Copy to Clipboard Button',
    'One-click copy button for generated descriptions',
    'ui',
    'voting',
    'free',
    '1 week',
    'BrutalSales Team'
),
(
    'Description History',
    'Save and view your previously generated descriptions',
    'productivity',
    'voting',
    'free',
    '2 weeks',
    'BrutalSales Team'
),

-- Medium difficulty features (2-4 weeks)
(
    'AI Style Personalities',
    'Choose from different AI personalities (Professional, Funny, Aggressive Salesperson, etc.)',
    'ai',
    'voting',
    'free',
    '2-3 weeks',
    'CreativeUser_Alex'
),
(
    'Seasonal Optimization',
    'Automatically adjust descriptions for holidays and seasonal trends',
    'ai',
    'voting',
    'free',
    '3-4 weeks',
    'SeasonalSeller_Kim'
),
(
    'Export to Multiple Formats',
    'Export descriptions to PDF, Word, or plain text files',
    'productivity',
    'voting',
    'free',
    '1-2 weeks',
    'ExportUser_Pat'
),

-- Complex features (4+ weeks) - moved to voting
(
    'Photo-to-Description AI',
    'Upload product photos and automatically generate descriptions from visual analysis',
    'ai',
    'voting',
    'free',
    '6-8 weeks',
    'BrutalSales Team'
),
(
    'Social Media Integration',
    'Generate optimized descriptions for Instagram, Facebook, TikTok Shop',
    'integration',
    'voting',
    'free',
    '4-5 weeks',
    'SocialSeller_Taylor'
),
(
    'Competitor Analysis',
    'Analyze competitor listings and suggest improvements to your descriptions',
    'business',
    'voting',
    'free',
    '5-6 weeks',
    'AnalyticsGuru_Sam'
),
(
    'Mobile App',
    'Native iOS and Android app for generating descriptions on the go',
    'productivity',
    'voting',
    'free',
    '8-12 weeks',
    'MobileSeller_Jordan'
);
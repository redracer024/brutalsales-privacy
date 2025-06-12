/*
  # Feature Voting System

  1. New Tables
    - `feature_ideas`: Stores user-submitted feature ideas
      - Includes title, description, category, status
      - Tracks submission details and development estimates
      - Implements soft delete

    - `feature_votes`: Tracks user votes on features
      - Links users to feature ideas
      - Prevents duplicate voting
      - Implements soft delete

  2. Views
    - `feature_ideas_with_votes`: Aggregates vote counts for features
      - Joins feature ideas with vote counts
      - Includes user vote status for authenticated users

  3. Security
    - Enables Row Level Security (RLS) on all tables
    - Implements policies for authenticated users to vote and submit
*/

-- Feature categories enum
CREATE TYPE feature_category AS ENUM (
    'ai',
    'productivity', 
    'integration',
    'ui',
    'business'
);

-- Feature status enum
CREATE TYPE feature_status AS ENUM (
    'voting',
    'planned',
    'in_progress',
    'completed'
);

-- Required tier enum
CREATE TYPE required_tier AS ENUM (
    'free',
    'premium',
    'pro',
    'enterprise'
);

-- Feature ideas table
CREATE TABLE IF NOT EXISTS feature_ideas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    category feature_category NOT NULL DEFAULT 'productivity',
    status feature_status NOT NULL DEFAULT 'voting',
    required_tier required_tier NOT NULL DEFAULT 'premium',
    estimated_development_time text DEFAULT 'TBD',
    submitted_by_user_id uuid REFERENCES auth.users(id),
    submitted_by_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone DEFAULT NULL
);

ALTER TABLE feature_ideas ENABLE ROW LEVEL SECURITY;

-- Feature votes table
CREATE TABLE IF NOT EXISTS feature_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id uuid REFERENCES feature_ideas(id) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone DEFAULT NULL,
    UNIQUE(feature_id, user_id)
);

ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;

-- Policies for feature_ideas
CREATE POLICY "Anyone can view feature ideas"
    ON feature_ideas
    FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can submit feature ideas"
    ON feature_ideas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own feature ideas"
    ON feature_ideas
    FOR UPDATE
    TO authenticated
    USING (submitted_by_user_id = auth.uid() AND deleted_at IS NULL);

-- Policies for feature_votes
CREATE POLICY "Anyone can view feature votes"
    ON feature_votes
    FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can vote on features"
    ON feature_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can delete their own votes"
    ON feature_votes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

-- View for feature ideas with vote counts
CREATE VIEW feature_ideas_with_votes AS
SELECT 
    fi.*,
    COALESCE(vote_counts.vote_count, 0) as vote_count,
    CASE 
        WHEN auth.uid() IS NOT NULL AND user_votes.user_id IS NOT NULL 
        THEN true 
        ELSE false 
    END as user_voted
FROM feature_ideas fi
LEFT JOIN (
    SELECT 
        feature_id, 
        COUNT(*) as vote_count
    FROM feature_votes 
    WHERE deleted_at IS NULL
    GROUP BY feature_id
) vote_counts ON fi.id = vote_counts.feature_id
LEFT JOIN (
    SELECT DISTINCT feature_id, user_id
    FROM feature_votes 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
) user_votes ON fi.id = user_votes.feature_id
WHERE fi.deleted_at IS NULL;

-- Grant permissions
GRANT SELECT ON feature_ideas_with_votes TO authenticated;
GRANT SELECT ON feature_ideas_with_votes TO anon;

-- Insert some initial feature ideas
INSERT INTO feature_ideas (
    title, 
    description, 
    category, 
    status, 
    required_tier, 
    estimated_development_time, 
    submitted_by_name
) VALUES 
(
    'Photo-to-Description AI',
    'Upload product photos and automatically generate descriptions from visual analysis',
    'ai',
    'planned',
    'premium',
    '2-3 weeks',
    'BrutalSales Team'
),
(
    'Browser Extension',
    'Generate descriptions directly on eBay, Facebook Marketplace, and other selling platforms',
    'productivity',
    'in_progress',
    'premium',
    '3-4 weeks',
    'BrutalSales Team'
),
(
    'Bulk Operations',
    'Upload CSV files and generate descriptions for hundreds of products at once',
    'productivity',
    'planned',
    'pro',
    '1-2 weeks',
    'BrutalSales Team'
),
(
    'Marketplace Auto-Posting',
    'Automatically post generated descriptions to multiple selling platforms simultaneously',
    'integration',
    'voting',
    'pro',
    '4-6 weeks',
    'PowerSeller_Mike'
),
(
    'Voice Input',
    'Speak product details instead of typing them for hands-free description generation',
    'ui',
    'voting',
    'premium',
    '2-3 weeks',
    'VoiceUser_Sarah'
),
(
    'Team Collaboration',
    'Share templates and descriptions with team members, approval workflows',
    'business',
    'voting',
    'enterprise',
    '6-8 weeks',
    'TeamLead_Alex'
),
(
    'Multi-Language Support',
    'Generate descriptions in Spanish, French, German, and other languages',
    'ai',
    'voting',
    'pro',
    '3-4 weeks',
    'GlobalSeller_Maria'
),
(
    'Performance Analytics',
    'Track which descriptions perform best and get optimization suggestions',
    'business',
    'voting',
    'pro',
    '4-5 weeks',
    'DataDriven_John'
);
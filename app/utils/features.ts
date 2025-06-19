import { supabase } from "@/lib/supabase";

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  upvotes: number;
  downvotes: number;
  user_vote?: 'up' | 'down' | null;
}

export interface FeatureVote {
  feature_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
}

export const loadFeatures = async (): Promise<Feature[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Auth error:', userError);
      return [];
    }
    if (!user) {
      return [];
    }

    // Get features with vote counts
    const { data: features, error: featuresError } = await supabase
      .from('feature_ideas_with_votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (featuresError) {
      console.error('Error loading features:', featuresError);
      return [];
    }

    // Get user's votes
    const { data: userVotes, error: votesError } = await supabase
      .from('feature_votes')
      .select('feature_id, vote_type')
      .eq('user_id', user.id);

    if (votesError) {
      console.error('Error loading user votes:', votesError);
      return features || [];
    }

    // Map user votes to features
    return (features || []).map(feature => ({
      ...feature,
      upvotes: parseInt(feature.upvotes) || 0,
      downvotes: parseInt(feature.downvotes) || 0,
      user_vote: userVotes?.find(vote => vote.feature_id === feature.id)?.vote_type || null
    }));
  } catch (error) {
    console.error('Error in loadFeatures:', error);
    return [];
  }
};

export const voteOnFeature = async (featureId: string, voteType: 'up' | 'down'): Promise<boolean> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Auth error:', userError);
      return false;
    }
    if (!user) {
      console.error('No user found');
      return false;
    }

    // Start a transaction by getting the existing vote
    const { data: existingVote, error: checkError } = await supabase
      .from('feature_votes')
      .select('*')
      .eq('feature_id', featureId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return false;
    }

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        const { error: deleteError } = await supabase
          .from('feature_votes')
          .delete()
          .eq('feature_id', featureId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error removing vote:', deleteError);
          return false;
        }
      } else {
        // Update vote if changing vote type
        const { error: updateError } = await supabase
          .from('feature_votes')
          .update({ 
            vote_type: voteType,
            updated_at: new Date().toISOString()
          })
          .eq('feature_id', featureId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          return false;
        }
      }
    } else {
      // Insert new vote
      const { error: insertError } = await supabase
        .from('feature_votes')
        .insert({
          feature_id: featureId,
          user_id: user.id,
          vote_type: voteType,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting vote:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in voteOnFeature:', error);
    return false;
  }
};

export const suggestFeature = async (title: string, description: string, category: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return false;
    }

    const { error } = await supabase
      .from('feature_ideas')
      .insert({
        title,
        description,
        category,
        icon: '💡', // Default icon
        created_by: user.id
      });

    if (error) {
      console.error('Error suggesting feature:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in suggestFeature:', error);
    return false;
  }
};

export const checkUserFeature = async (featureName: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    return { hasAccess: false, usageCount: 0, limit: 0, error: 'User not authenticated' };
  }

  const { data: featureData, error: featureError } = await supabase
    .from('feature_ideas')
    .select('*')
    .eq('title', featureName)
    .maybeSingle();

  if (featureError) {
    console.error('Error checking feature:', featureError);
    return { hasAccess: false, usageCount: 0, limit: 0, error: 'Error checking feature' };
  }

  if (!featureData) {
    return { hasAccess: false, usageCount: 0, limit: 0, error: 'Feature not found' };
  }

  const { data: usageData, error: usageError } = await supabase
    .from('feature_usage')
    .select('*')
    .eq('feature_id', featureData.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (usageError) {
    console.error('Error checking feature usage:', usageError);
    return { hasAccess: false, usageCount: 0, limit: 0, error: 'Error checking feature usage' };
  }

  const usageCount = usageData?.usage_count || 0;
  const limit = featureData.usage_limit || 0;

  return { hasAccess: usageCount < limit, usageCount, limit, error: null };
};

export default {};

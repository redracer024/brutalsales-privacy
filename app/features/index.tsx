import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ThumbsUp, ThumbsDown, Plus, Settings, Home, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import AdBanner from '@/components/AdBanner';
import { Feature } from '../utils/features';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface FeatureVote {
  vote_type: 'up' | 'down';
  user_id: string;
}

interface FeatureWithVotes extends Feature {
  votes: FeatureVote[];
}

export default function FeaturesScreen() {
  const { user, loading } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [suggestionCategory, setSuggestionCategory] = useState('Productivity');

  useEffect(() => {
    if (!loading) {
      loadFeaturesData();
    }
  }, [loading]);

  const loadFeaturesData = async () => {
    setIsLoading(true);
    try {
      const { data: features, error } = await supabase
        .from('features')
        .select(`
          *,
          votes:feature_votes(vote_type, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedFeatures = (features as FeatureWithVotes[]).map(feature => ({
        ...feature,
        upvotes: feature.votes.filter(v => v.vote_type === 'up').length,
        downvotes: feature.votes.filter(v => v.vote_type === 'down').length,
        user_vote: user ? feature.votes.find(v => v.user_id === user.id)?.vote_type : null
      }));

      setFeatures(processedFeatures);
    } catch (error) {
      console.error('Error loading features:', error);
      Alert.alert('Error', 'Failed to load features. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (featureId: string, voteType: 'up' | 'down') => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to vote on features.',
        [
          { text: 'Cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    try {
      // First, remove any existing vote
      await supabase
        .from('feature_votes')
        .delete()
        .match({ feature_id: featureId, user_id: user.id });

      // Then add the new vote
      const { error } = await supabase
        .from('feature_votes')
        .insert({
          feature_id: featureId,
          user_id: user.id,
          vote_type: voteType
        });

      if (error) throw error;
      await loadFeaturesData();
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to register vote. Please try again.');
    }
  };

  const handleSuggestFeature = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to suggest features.',
        [
          { text: 'Cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (!suggestionTitle.trim() || !suggestionDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('features')
        .insert({
          title: suggestionTitle.trim(),
          description: suggestionDescription.trim(),
          category: suggestionCategory,
          user_id: user.id,
          status: 'suggested'
        });

      if (error) throw error;

      Alert.alert('Success', 'Your feature suggestion has been submitted!');
      setShowSuggestionForm(false);
      setSuggestionTitle('');
      setSuggestionDescription('');
      setSuggestionCategory('Productivity');
      await loadFeaturesData();
    } catch (error) {
      console.error('Error suggesting feature:', error);
      Alert.alert('Error', 'Failed to submit suggestion. Please try again.');
    }
  };

  const renderFeatureCard = (feature: Feature) => (
    <View key={feature.id} style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureIcon}>{feature.icon}</Text>
        <Text style={styles.featureTitle}>{feature.title}</Text>
      </View>
      <Text style={styles.featureDescription}>{feature.description}</Text>
      <View style={styles.voteContainer}>
        <TouchableOpacity
          style={[
            styles.voteButton,
            feature.user_vote === 'up' && styles.votedButton
          ]}
          onPress={() => handleVote(feature.id, 'up')}
        >
          <ThumbsUp size={20} color={feature.user_vote === 'up' ? '#D97706' : '#9CA3AF'} />
          <Text style={[
            styles.voteCount,
            feature.user_vote === 'up' && styles.votedCount
          ]}>
            {feature.upvotes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.voteButton,
            feature.user_vote === 'down' && styles.votedButton
          ]}
          onPress={() => handleVote(feature.id, 'down')}
        >
          <ThumbsDown size={20} color={feature.user_vote === 'down' ? '#D97706' : '#9CA3AF'} />
          <Text style={[
            styles.voteCount,
            feature.user_vote === 'down' && styles.votedCount
          ]}>
            {feature.downvotes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feature Roadmap</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.description}>
              Vote on upcoming features and suggest new ones
            </Text>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.suggestButton}
                onPress={() => setShowSuggestionForm(true)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.suggestButtonText}>Suggest Feature</Text>
              </TouchableOpacity>
            </View>

            {/* Suggestion Form */}
            {showSuggestionForm && (
              <View style={styles.suggestionForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Feature Title"
                  placeholderTextColor="#6B7280"
                  value={suggestionTitle}
                  onChangeText={setSuggestionTitle}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Feature Description"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  value={suggestionDescription}
                  onChangeText={setSuggestionDescription}
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowSuggestionForm(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSuggestFeature}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Features List */}
            <View style={styles.featuresList}>
              {features.map(renderFeatureCard)}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/')}
          >
            <Home size={24} color="#FFFFFF" />
            <Text style={styles.navButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/premium')}
          >
            <Star size={24} color="#FFFFFF" />
            <Text style={styles.navButtonText}>Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color="#FFFFFF" />
            <Text style={styles.navButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Banner */}
        <AdBanner />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A19',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D97706',
    fontFamily: 'EagleLake-Regular',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  suggestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionForm: {
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(49, 46, 129, 0.5)',
  },
  input: {
    backgroundColor: 'rgba(15, 10, 25, 0.8)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(49, 46, 129, 0.5)',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(49, 46, 129, 0.5)',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  voteContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 10, 25, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  votedButton: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  voteCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  votedCount: {
    color: '#D97706',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(15, 10, 25, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    alignItems: 'center',
    gap: 4,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

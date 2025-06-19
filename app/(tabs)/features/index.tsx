import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  ChevronUp, 
  ChevronDown,
  Crown,
  Zap,
  Star,
  Camera,
  Globe,
  Layers,
  MessageSquare,
  X,
  Send,
  Plus,
  ArrowLeft
} from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface FeatureIdea {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'productivity' | 'integration' | 'ui' | 'business';
  votes: number;
  userVoted: boolean;
  status: 'voting' | 'planned' | 'in_progress' | 'completed';
  requiredTier: 'free' | 'premium' | 'pro' | 'enterprise';
  estimatedDevelopmentTime: string;
  submittedBy: string;
  submittedAt: string;
}

export default function FeaturesScreen() {
  const [features, setFeatures] = useState<FeatureIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isPremium] = useState(false);
  const [user, setUser] = useState<any>(null);

  // New feature submission form
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    category: 'productivity' as const,
  });

  useEffect(() => {
    checkUser();
    loadFeatures();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadFeatures = () => {
    // Mock data - in production, this would come from Supabase
    const mockFeatures: FeatureIdea[] = [
      {
        id: '1',
        title: 'Dark/Light Theme Toggle',
        description: 'Switch between dark and light themes for better user experience',
        category: 'ui',
        votes: 0,
        userVoted: false,
        status: 'voting',
        requiredTier: 'free',
        estimatedDevelopmentTime: '1 week',
        submittedBy: 'BrutalSales Team',
        submittedAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Description Templates',
        description: 'Pre-made templates for different product categories (electronics, clothing, etc.)',
        category: 'productivity',
        votes: 0,
        userVoted: false,
        status: 'voting',
        requiredTier: 'premium',
        estimatedDevelopmentTime: '1-2 weeks',
        submittedBy: 'BrutalSales Team',
        submittedAt: '2024-01-10'
      },
      // ... more features
    ];

    setFeatures(mockFeatures);
  };

  const handleVote = async (featureId: string) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to vote on features.');
      router.push('/login');
      return;
    }

    setFeatures(features.map(feature => {
      if (feature.id === featureId) {
        return {
          ...feature,
          votes: feature.userVoted ? feature.votes - 1 : feature.votes + 1,
          userVoted: !feature.userVoted,
        };
      }
      return feature;
    }));
  };

  const handleSubmitFeature = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to submit feature ideas.');
      router.push('/login');
      return;
    }

    if (!newFeature.title || !newFeature.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // In production, this would be sent to Supabase
    const newFeatureIdea: FeatureIdea = {
      id: Math.random().toString(),
      ...newFeature,
      votes: 0,
      userVoted: false,
      status: 'voting',
      requiredTier: 'free',
      estimatedDevelopmentTime: 'TBD',
      submittedBy: user?.email || 'Anonymous',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    setFeatures([...features, newFeatureIdea]);
    setNewFeature({
      title: '',
      description: '',
      category: 'productivity',
    });
    setShowSubmitModal(false);
  };

  const filteredFeatures = features
    .filter(feature => selectedCategory === 'all' || feature.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Feature Requests</Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setShowSubmitModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit Idea</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'ai' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory('ai')}
            >
              <Lightbulb size={16} color="#FFFFFF" />
              <Text style={styles.filterButtonText}>AI Features</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'productivity' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory('productivity')}
            >
              <TrendingUp size={16} color="#FFFFFF" />
              <Text style={styles.filterButtonText}>Productivity</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === 'integration' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory('integration')}
            >
              <Globe size={16} color="#FFFFFF" />
              <Text style={styles.filterButtonText}>Integrations</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'votes' ? 'recent' : 'votes')}
          >
            <Text style={styles.sortButtonText}>
              Sort by: {sortBy === 'votes' ? 'Most Votes' : 'Most Recent'}
            </Text>
            {sortBy === 'votes' ? (
              <ChevronUp size={16} color="#FFFFFF" />
            ) : (
              <ChevronDown size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {filteredFeatures.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={styles.featureTitle}>
                <Text style={styles.featureName}>{feature.title}</Text>
                <View style={styles.featureMeta}>
                  <Text style={styles.featureCategory}>{feature.category}</Text>
                  <Text style={styles.featureStatus}>{feature.status}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.voteButton, feature.userVoted && styles.votedButton]}
                onPress={() => handleVote(feature.id)}
              >
                <ChevronUp size={20} color={feature.userVoted ? '#FFFFFF' : '#6366F1'} />
                <Text
                  style={[
                    styles.voteCount,
                    feature.userVoted && styles.votedCount,
                  ]}
                >
                  {feature.votes}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.featureDescription}>{feature.description}</Text>
            <View style={styles.featureFooter}>
              <Text style={styles.featureSubmitter}>
                Submitted by {feature.submittedBy}
              </Text>
              <Text style={styles.featureDate}>{feature.submittedAt}</Text>
            </View>
          </View>
        ))}

        <AdBanner />
      </ScrollView>

      <Modal
        visible={showSubmitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Feature Idea</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSubmitModal(false)}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Feature title"
              placeholderTextColor="#666666"
              value={newFeature.title}
              onChangeText={(text) => setNewFeature({ ...newFeature, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Feature description"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
              value={newFeature.description}
              onChangeText={(text) =>
                setNewFeature({ ...newFeature, description: text })
              }
            />

            <TouchableOpacity
              style={styles.submitModalButton}
              onPress={handleSubmitFeature}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.submitModalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A19',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  filters: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    color: '#FFFFFF',
    marginRight: 8,
  },
  featureCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureTitle: {
    flex: 1,
    marginRight: 16,
  },
  featureName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCategory: {
    fontSize: 12,
    color: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  featureStatus: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  voteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  votedButton: {
    backgroundColor: '#6366F1',
  },
  voteCount: {
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 4,
  },
  votedCount: {
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  featureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureSubmitter: {
    fontSize: 12,
    color: '#666666',
  },
  featureDate: {
    fontSize: 12,
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 8,
  },
  submitModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 
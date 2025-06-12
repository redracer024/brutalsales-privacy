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
import { router } from 'expo-router';
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
        votes: 342,
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
        votes: 289,
        userVoted: true,
        status: 'voting',
        requiredTier: 'premium',
        estimatedDevelopmentTime: '1-2 weeks',
        submittedBy: 'BrutalSales Team',
        submittedAt: '2024-01-10'
      },
      {
        id: '3',
        title: 'Description History',
        description: 'Save and view your previously generated descriptions',
        category: 'productivity',
        votes: 234,
        userVoted: false,
        status: 'voting',
        requiredTier: 'premium',
        estimatedDevelopmentTime: '2 weeks',
        submittedBy: 'BrutalSales Team',
        submittedAt: '2024-01-25'
      },
      {
        id: '4',
        title: 'AI Style Personalities',
        description: 'Choose from different AI personalities (Professional, Funny, Aggressive Salesperson, etc.)',
        category: 'ai',
        votes: 198,
        userVoted: false,
        status: 'voting',
        requiredTier: 'premium',
        estimatedDevelopmentTime: '2-3 weeks',
        submittedBy: 'CreativeUser_Alex',
        submittedAt: '2024-01-20'
      },
      {
        id: '5',
        title: 'Seasonal Optimization',
        description: 'Automatically adjust descriptions for holidays and seasonal trends',
        category: 'ai',
        votes: 176,
        userVoted: false,
        status: 'voting',
        requiredTier: 'premium',
        estimatedDevelopmentTime: '3-4 weeks',
        submittedBy: 'SeasonalSeller_Kim',
        submittedAt: '2024-01-08'
      },
      {
        id: '6',
        title: 'Photo-to-Description AI',
        description: 'Upload product photos and automatically generate descriptions from visual analysis',
        category: 'ai',
        votes: 167,
        userVoted: false,
        status: 'voting',
        requiredTier: 'pro',
        estimatedDevelopmentTime: '6-8 weeks',
        submittedBy: 'BrutalSales Team',
        submittedAt: '2024-01-15'
      },
      {
        id: '7',
        title: 'Social Media Integration',
        description: 'Generate optimized descriptions for Instagram, Facebook, TikTok Shop',
        category: 'integration',
        votes: 145,
        userVoted: false,
        status: 'voting',
        requiredTier: 'pro',
        estimatedDevelopmentTime: '4-5 weeks',
        submittedBy: 'SocialSeller_Taylor',
        submittedAt: '2024-01-22'
      },
      {
        id: '8',
        title: 'Competitor Analysis',
        description: 'Analyze competitor listings and suggest improvements to your descriptions',
        category: 'business',
        votes: 134,
        userVoted: false,
        status: 'voting',
        requiredTier: 'pro',
        estimatedDevelopmentTime: '5-6 weeks',
        submittedBy: 'AnalyticsGuru_Sam',
        submittedAt: '2024-01-18'
      },
      {
        id: '9',
        title: 'Mobile App',
        description: 'Native iOS and Android app for generating descriptions on the go',
        category: 'productivity',
        votes: 123,
        userVoted: false,
        status: 'voting',
        requiredTier: 'premium',
        estimatedDevelopmentTime: '8-12 weeks',
        submittedBy: 'MobileSeller_Jordan',
        submittedAt: '2024-01-20'
      },
      {
        id: '10',
        title: 'Export to Multiple Formats',
        description: 'Export descriptions to PDF, Word, or plain text files',
        category: 'productivity',
        votes: 112,
        userVoted: false,
        status: 'voting',
        requiredTier: 'free',
        estimatedDevelopmentTime: '1-2 weeks',
        submittedBy: 'ExportUser_Pat',
        submittedAt: '2024-01-12'
      }
    ];

    setFeatures(mockFeatures);
  };

  const categories = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'ai', label: 'AI', icon: Zap },
    { id: 'productivity', label: 'Productivity', icon: TrendingUp },
    { id: 'integration', label: 'Integrations', icon: Globe },
    { id: 'ui', label: 'UI/UX', icon: Star },
    { id: 'business', label: 'Business', icon: Users },
  ];

  const tierColors = {
    free: '#10B981',
    premium: '#D97706',
    pro: '#8B5CF6',
    enterprise: '#EF4444'
  };

  const tierLabels = {
    free: 'Free',
    premium: 'Premium',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };

  const statusColors = {
    voting: '#6B7280',
    planned: '#3B82F6',
    in_progress: '#F59E0B',
    completed: '#10B981'
  };

  const statusLabels = {
    voting: 'Voting',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  const handleVote = async (featureId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to vote on features.');
      return;
    }

    setFeatures(prev => prev.map(feature => {
      if (feature.id === featureId) {
        return {
          ...feature,
          votes: feature.userVoted ? feature.votes - 1 : feature.votes + 1,
          userVoted: !feature.userVoted
        };
      }
      return feature;
    }));

    // In production, save vote to Supabase
  };

  const handleSubmitFeature = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to submit feature ideas.');
      return;
    }

    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description.');
      return;
    }

    // In production, save to Supabase
    const submittedFeature: FeatureIdea = {
      id: Date.now().toString(),
      title: newFeature.title,
      description: newFeature.description,
      category: newFeature.category,
      votes: 1,
      userVoted: true,
      status: 'voting',
      requiredTier: 'premium',
      estimatedDevelopmentTime: 'TBD',
      submittedBy: user.user_metadata?.full_name || user.email || 'Anonymous',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setFeatures(prev => [submittedFeature, ...prev]);
    setNewFeature({ title: '', description: '', category: 'productivity' });
    setShowSubmitModal(false);

    Alert.alert('Feature Submitted!', 'Thank you for your suggestion. Other users can now vote on it!');
  };

  const filteredFeatures = features
    .filter(feature => selectedCategory === 'all' || feature.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  const renderFeatureCard = (feature: FeatureIdea) => (
    <View key={feature.id} style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <View style={styles.featureMeta}>
            <View style={[styles.tierBadge, { backgroundColor: tierColors[feature.requiredTier] }]}>
              <Text style={styles.tierBadgeText}>{tierLabels[feature.requiredTier]}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[feature.status] }]}>
              <Text style={styles.statusBadgeText}>{statusLabels[feature.status]}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.voteButton, feature.userVoted && styles.voteButtonActive]}
          onPress={() => handleVote(feature.id)}
        >
          <ChevronUp size={20} color={feature.userVoted ? '#FFFFFF' : '#D97706'} />
          <Text style={[styles.voteCount, feature.userVoted && styles.voteCountActive]}>
            {feature.votes}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.featureDescription}>{feature.description}</Text>

      <View style={styles.featureFooter}>
        <Text style={styles.featureDetails}>
          Est. Development: {feature.estimatedDevelopmentTime}
        </Text>
        <Text style={styles.featureSubmitter}>
          by {feature.submittedBy}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <AdBanner isPremium={isPremium} />

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Lightbulb size={32} color="#D97706" />
            <Text style={styles.title}>Feature Roadmap</Text>
            <Text style={styles.subtitle}>Vote on features you want to see next!</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setShowSubmitModal(true)}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <IconComponent size={16} color={isSelected ? '#FFFFFF' : '#D97706'} />
                  <Text style={[styles.categoryButtonText, isSelected && styles.categoryButtonTextActive]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'votes' && styles.sortButtonActive]}
            onPress={() => setSortBy('votes')}
          >
            <TrendingUp size={16} color={sortBy === 'votes' ? '#FFFFFF' : '#D97706'} />
            <Text style={[styles.sortButtonText, sortBy === 'votes' && styles.sortButtonTextActive]}>
              Most Voted
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
            onPress={() => setSortBy('recent')}
          >
            <Star size={16} color={sortBy === 'recent' ? '#FFFFFF' : '#D97706'} />
            <Text style={[styles.sortButtonText, sortBy === 'recent' && styles.sortButtonTextActive]}>
              Most Recent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredFeatures.map(renderFeatureCard)}
        </ScrollView>

        {/* Submit Feature Modal */}
        <Modal
          visible={showSubmitModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSubmitModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#0F0A19', '#1E1B4B', '#312E81']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Suggest a Feature</Text>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setShowSubmitModal(false)}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalContent}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Feature Title *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newFeature.title}
                      onChangeText={(text) => setNewFeature({ ...newFeature, title: text })}
                      placeholder="e.g., Voice Input for Product Details"
                      placeholderTextColor="#6B7280"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description *</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={newFeature.description}
                      onChangeText={(text) => setNewFeature({ ...newFeature, description: text })}
                      placeholder="Describe how this feature would work and why it would be valuable..."
                      placeholderTextColor="#6B7280"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.categoryGrid}>
                      {categories.slice(1).map((category) => {
                        const IconComponent = category.icon;
                        const isSelected = newFeature.category === category.id;
                        
                        return (
                          <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryOption, isSelected && styles.categoryOptionSelected]}
                            onPress={() => setNewFeature({ ...newFeature, category: category.id as any })}
                          >
                            <IconComponent size={20} color={isSelected ? '#FFFFFF' : '#D97706'} />
                            <Text style={[styles.categoryOptionText, isSelected && styles.categoryOptionTextSelected]}>
                              {category.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.submitFeatureButton}
                    onPress={handleSubmitFeature}
                  >
                    <LinearGradient
                      colors={['#D97706', '#F59E0B']}
                      style={styles.submitFeatureGradient}
                    >
                      <Send size={20} color="#FFFFFF" />
                      <Text style={styles.submitFeatureButtonText}>Submit Feature Idea</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#A78BFA',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  categoryContainer: {
    marginBottom: 16,
    paddingLeft: 20,
  },
  categoryScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  categoryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureInfo: {
    flex: 1,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  voteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    minWidth: 60,
  },
  voteButtonActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  voteCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginTop: 4,
  },
  voteCountActive: {
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  featureSubmitter: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#C4B5FD',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    gap: 6,
    width: '48%',
  },
  categoryOptionSelected: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  categoryOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    flex: 1,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  submitFeatureButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitFeatureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  submitFeatureButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
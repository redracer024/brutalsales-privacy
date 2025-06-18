import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Wand as Wand2, Copy, Smile, Briefcase, Zap, Laugh } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import InterstitialAd from '@/components/InterstitialAd';
import { useAdManager } from '@/hooks/useAdManager';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function RewriteScreen() {
  const { user, loading } = useAuth();
  const [originalText, setOriginalText] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPremium] = useState(false);
  const [acceptOffers, setAcceptOffers] = useState(true);
  const [userTerms, setUserTerms] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adManager = useAdManager({
    isPremium,
    showInterstitialAfter: 1, // Show interstitial before rewriting
  });

  useEffect(() => {
    if (!loading) {
      fetchUserTerms();
    }
  }, [loading]);

  const fetchUserTerms = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUserTerms('Thank you for using our service. As a guest user, you have access to basic features.');
        return;
      }

      if (!session?.user) {
        // Guest mode - use default terms
        setUserTerms('Thank you for using our service. As a guest user, you have access to basic features.');
        return;
      }

      const { data: termsData, error } = await supabase
        .from('user_terms')
        .select('terms_text')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No terms found for user
          setUserTerms('Thank you for using our service.');
        } else {
          console.error('Error fetching terms:', error);
          setUserTerms('Thank you for using our service. If you experience any issues, please contact support.');
        }
        return;
      }

      if (termsData?.terms_text) {
        setUserTerms(termsData.terms_text);
      } else {
        setUserTerms('Thank you for using our service.');
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      setUserTerms('Thank you for using our service. If you experience any issues, please contact support.');
    }
  };

  const toneOptions = [
    { id: 'professional', label: 'Professional', icon: Briefcase, color: '#3B82F6' },
    { id: 'friendly', label: 'Friendly', icon: Smile, color: '#10B981' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: '#F59E0B' },
    { id: 'humor', label: 'Humor', icon: Laugh, color: '#EC4899' },
  ];

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      Alert.alert('Error', 'Please enter some text to rewrite');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if user is guest
      if (session?.user?.email === 'guest@brutalsales.app') {
        Alert.alert(
          'Premium Feature',
          'Rewriting descriptions is a premium feature. Please sign up to access this feature.',
          [
            { text: 'Sign Up', onPress: () => router.push('/(auth)/signup') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      setIsRewriting(true);
      setError(null);

      // Show interstitial ad if needed
      if (!isPremium) {
        adManager.incrementActionCount();
        if (adManager.showInterstitial) {
          return; // Let the interstitial ad handle the rewrite
        }
      }

      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          tone: selectedTone,
          acceptOffers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite description');
      }

      // Append terms if they exist
      const finalText = userTerms 
        ? `${data.generatedText}\n\n---\n\n${userTerms}`
        : data.generatedText;

      setRewrittenText(finalText);

      // Show success message if using DeepSeek API
      if (data.source === 'deepseek') {
        console.log('✅ Rewritten using DeepSeek AI');
      } else {
        console.log('⚠️ Using fallback rewrite (check API key)');
      }

    } catch (error: any) {
      console.error('Rewrite error:', error);
      Alert.alert(
        'Rewrite Failed',
        error.message || 'We encountered an issue rewriting your text. Please try again.'
      );
    }
    setIsRewriting(false);
  };

  const copyToClipboard = () => {
    try {
      Clipboard.setString(rewrittenText);
      Alert.alert('Success', 'Description copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy description');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/(tabs)/premium');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#0F0A19', '#1E1B4B', '#312E81']}
          style={styles.gradient}
        >
          <ActivityIndicator size="large" color="#D97706" />
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        {/* Ad Banner */}
        <AdBanner isPremium={isPremium} />

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewrite Description</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Original Text Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Paste Your Original Text</Text>
            <TextInput
              style={styles.textArea}
              value={originalText}
              onChangeText={setOriginalText}
              placeholder="Paste your existing description here to transform it with AI magic..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {originalText.length} characters
            </Text>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Accept Offers</Text>
            <Switch
              value={acceptOffers}
              onValueChange={setAcceptOffers}
              trackColor={{ false: '#4B5563', true: '#D97706' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Tone Selection */}
          <View style={styles.toneContainer}>
            <Text style={styles.sectionTitle}>Choose Your Tone</Text>
            <View style={styles.toneGrid}>
              {toneOptions.map((tone) => {
                const IconComponent = tone.icon;
                const isSelected = selectedTone === tone.id;
                
                return (
                  <TouchableOpacity
                    key={tone.id}
                    style={[
                      styles.toneOption,
                      isSelected && { borderColor: tone.color }
                    ]}
                    onPress={() => setSelectedTone(tone.id)}
                  >
                    <IconComponent
                      size={24}
                      color={isSelected ? tone.color : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        styles.toneLabel,
                        isSelected && { color: tone.color }
                      ]}
                    >
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.rewriteButton, isRewriting && styles.buttonDisabled]}
              onPress={handleRewrite}
              disabled={isRewriting}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.buttonGradient}
              >
                <Wand2 size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  {isRewriting ? 'Rewriting...' : 'Rewrite Description'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Results Section */}
          {rewrittenText && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Rewritten Description</Text>
                <View style={styles.resultsActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={copyToClipboard}
                  >
                    <Copy size={20} color="#D97706" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.rewrittenText}>{rewrittenText}</Text>
            </View>
          )}

          {/* Premium Upgrade Banner */}
          {!isPremium && (
            <TouchableOpacity
              style={styles.upgradeBanner}
              onPress={handleUpgradeToPremium}
            >
              <Text style={styles.upgradeText}>
                Upgrade to Premium for unlimited rewrites!
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Interstitial Ad */}
        <InterstitialAd
          visible={adManager.showInterstitial}
          onClose={adManager.hideInterstitial}
          onUpgrade={handleUpgradeToPremium}
          onAdDismissedAction={handleRewrite}
          isPremium={isPremium}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
  },
  toneContainer: {
    marginBottom: 24,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toneOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneLabel: {
    fontSize: 14,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginTop: 8,
  },
  actionButtons: {
    marginBottom: 24,
  },
  rewriteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  resultsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  rewrittenText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  upgradeBanner: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  upgradeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
  },
});
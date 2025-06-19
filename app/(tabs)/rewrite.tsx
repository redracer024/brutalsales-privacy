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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Wand as Wand2, Copy, Smile, Briefcase, Zap, Laugh } from 'lucide-react-native';
import Constants from 'expo-constants';
import AdBanner from '@/components/AdBanner';
import { useAdManager } from '@/hooks/useAdManager';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const AD_UNIT_ID = 'ca-app-pub-8865921274070980/4413010386';

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

  const { showAd, isAdLoaded } = useAdManager(AD_UNIT_ID, () => {
    performRewrite();
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

      // Show interstitial ad before generation for free users
      if (!isPremium && isAdLoaded) {
        showAd();
      } else {
        // If ad is not loaded or user is premium, generate directly
        await performRewrite();
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

  const performRewrite = async () => {
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

      const baseUrl = (Constants.expoConfig?.extra?.apiUrl as string) || '';
      const endpoint = `${baseUrl}/api/rewrite`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          tone: selectedTone,
          acceptOffers,
          userId: session?.user?.id
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

  const copyToClipboard = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(rewrittenText);
      } else {
        const Clipboard = require('@react-native-clipboard/clipboard').default;
        Clipboard.setString(rewrittenText);
      }
      Alert.alert('Success', 'Description copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy description');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/premium');
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
        style={StyleSheet.absoluteFill}
      >
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rewrite Description</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
            {/* Original Text Input */}
            <Text style={styles.inputLabel}>Original Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={originalText}
              onChangeText={setOriginalText}
              placeholder="Paste or type the description you want to improve"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={6}
              editable={!isRewriting}
            />

            {/* Tone Picker Grid */}
            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Tone</Text>
            <View style={styles.toneGrid}>
              {toneOptions.map(({ id, label, icon: Icon, color }) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.toneOption,
                    selectedTone === id && styles.toneOptionSelected,
                  ]}
                  onPress={() => setSelectedTone(id)}
                  disabled={isRewriting}
                >
                  <Icon size={24} color={selectedTone === id ? '#FFFFFF' : color} />
                  <Text
                    style={[
                      styles.toneLabel,
                      selectedTone === id && styles.toneLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Accept offers toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Mention that offers are welcome</Text>
              <Switch
                value={acceptOffers}
                onValueChange={setAcceptOffers}
                thumbColor={acceptOffers ? '#D97706' : '#6B7280'}
                trackColor={{ false: '#6B7280', true: '#FBBF24' }}
                disabled={isRewriting}
              />
            </View>

            {/* Rewrite Button */}
            <TouchableOpacity
              style={[styles.generateButton, isRewriting && styles.buttonDisabled]}
              onPress={handleRewrite}
              disabled={isRewriting}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.buttonGradient}
              >
                <Wand2 size={20} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>
                  {isRewriting ? 'Rewriting...' : 'Rewrite'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Output */}
          {rewrittenText ? (
            <View style={styles.outputContainer}>
              <Text style={styles.outputLabel}>✨ Rewritten Description</Text>
              <View style={styles.outputBox}>
                <Text style={styles.outputText}>{rewrittenText}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Copy size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
        {isRewriting && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#D97706" />
          </View>
        )}
        {!isRewriting && <AdBanner />}
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
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    color: '#FBBF24',
  },
  textArea: {
    height: 120,
  },
  toneGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toneOption: {
    padding: 12,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    alignItems: 'center',
  },
  toneOptionSelected: {
    backgroundColor: '#374151',
  },
  toneLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 8,
  },
  toneLabelSelected: {
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginRight: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FBBF24',
    marginLeft: 8,
  },
  outputContainer: {
    padding: 16,
  },
  outputLabel: {
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginBottom: 12,
  },
  outputBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  outputText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
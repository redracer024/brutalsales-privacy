import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import AdBanner from '@/components/AdBanner';
import { useAdManager } from '@/hooks/useAdManager';
import { supabase } from '@/lib/supabase';

const AD_UNIT_ID = 'ca-app-pub-8865921274070980/7852727793';

export default function CreateScreen() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    condition: 'new',
    itemDetails: '',
  });
  const [selectedTone, setSelectedTone] = useState('professional');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPremium] = useState(false);
  const [acceptOffers, setAcceptOffers] = useState(true);
  const [userTerms, setUserTerms] = useState<string | null>(null);

  const { showAd, isAdLoaded } = useAdManager(AD_UNIT_ID, () => {
    performGeneration();
  });

  useEffect(() => {
    fetchUserTerms();
  }, []);

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

  const conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Used - Excellent', value: 'used_excellent' },
    { label: 'Used - Good', value: 'used_good' },
    { label: 'Used - Fair', value: 'used_fair' },
    { label: 'For Parts', value: 'for_parts' },
  ];

  const toneOptions = [
    { id: 'professional', label: 'Professional', icon: Briefcase, color: '#3B82F6' },
    { id: 'friendly', label: 'Friendly', icon: Smile, color: '#10B981' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: '#F59E0B' },
    { id: 'humor', label: 'Humor', icon: Laugh, color: '#EC4899' },
  ];

  const generateDescription = async () => {
    if (!formData.make || !formData.model) {
      Alert.alert('Missing Information', 'Please fill in the make and model fields.');
      return;
    }

    // Show interstitial ad before generation for free users
    if (!isPremium && isAdLoaded) {
      showAd();
    } else {
      // If ad is not loaded or user is premium, generate directly
      await performGeneration();
    }
  };

  const performGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch latest terms before generation
      const { data: { user } } = await supabase.auth.getUser();
      let currentTerms = null;
      
      if (user) {
        const { data: termsData } = await supabase
          .from('user_terms')
          .select('terms_text')
          .eq('user_id', user.id)
          .single();
        
        if (termsData?.terms_text) {
          currentTerms = termsData.terms_text;
          console.log('📝 Found user terms:', currentTerms);
        } else {
          console.log('⚠️ No terms found for user');
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          make: formData.make,
          model: formData.model,
          condition: formData.condition,
          itemDetails: formData.itemDetails,
          tone: selectedTone,
          acceptOffers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate description');
      }

      // Append terms if they exist
      const finalDescription = currentTerms 
        ? `${data.generatedText}\n\n---\n\n${currentTerms}`
        : data.generatedText;

      setGeneratedDescription(finalDescription);
      
      // Show success message if using DeepSeek API
      if (data.source === 'deepseek') {
        console.log('✅ Generated using DeepSeek AI');
      } else {
        console.log('⚠️ Using fallback generation (check API key)');
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'We encountered an issue generating your description. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(generatedDescription);
      } else {
        const Clipboard = require('@react-native-clipboard/clipboard').default;
        Clipboard.setString(generatedDescription);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Description</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Input Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Make *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.make}
                onChangeText={(text) => setFormData({ ...formData, make: text })}
                placeholder="e.g., Apple, Samsung, Ford..."
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Model *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholder="e.g., iPhone 15, Galaxy S24, F-150..."
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Condition</Text>
              <View style={[styles.pickerContainer]} accessible={true}>
                <Picker
                  selectedValue={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  style={styles.picker}
                  dropdownIconColor="#D97706"
                  accessibilityLabel="Select item condition"
                >
                  {conditionOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color="#FFFFFF"
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Additional Details</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.itemDetails}
                onChangeText={(text) => setFormData({ ...formData, itemDetails: text })}
                placeholder="Add any additional details about your item..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
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
              <Text style={styles.inputLabel}>Choose Your Tone</Text>
              <View style={styles.toneGrid}>
                {toneOptions.map((tone) => {
                  const IconComponent = tone.icon;
                  const isSelected = selectedTone === tone.id;
                  
                  return (
                    <TouchableOpacity
                      key={tone.id}
                      style={[
                        styles.toneOption,
                        isSelected && styles.toneOptionSelected,
                      ]}
                      onPress={() => setSelectedTone(tone.id)}
                    >
                      <IconComponent 
                        size={24} 
                        color={isSelected ? '#FFFFFF' : tone.color} 
                      />
                      <Text style={[
                        styles.toneLabel,
                        isSelected && styles.toneLabelSelected,
                      ]}>
                        {tone.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.buttonDisabled]}
              onPress={generateDescription}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.buttonGradient}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Wand2 size={20} color="#FFFFFF" />
                )}
                <Text style={styles.generateButtonText}>
                  {isGenerating ? 'Forging Magic...' : 'Generate Description'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Generated Description */}
          {generatedDescription && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Your Legendary Description</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                    <Copy size={20} color="#D97706" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.generatedText}>{generatedDescription}</Text>
              </View>
            </View>
          )}
        </ScrollView>
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
  headerTitle: {
    fontSize: 28,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
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
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    height: 50,
  },
  pickerItem: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  toneContainer: {
    marginBottom: 20,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toneOption: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toneOptionSelected: {
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
    borderColor: '#D97706',
  },
  toneLabel: {
    fontSize: 14,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginTop: 8,
  },
  toneLabelSelected: {
    color: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  resultContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.5)',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  generatedText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});
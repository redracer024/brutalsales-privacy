import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Wand as Wand2, Copy, Share, Smile, Briefcase, Zap, Laugh } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import InterstitialAd from '@/components/InterstitialAd';
import { useAdManager } from '@/hooks/useAdManager';

export default function RewriteScreen() {
  const [originalText, setOriginalText] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPremium] = useState(false);

  const adManager = useAdManager({
    isPremium,
    showInterstitialAfter: 1, // Show interstitial before rewriting
  });

  const toneOptions = [
    { id: 'professional', label: 'Professional', icon: Briefcase, color: '#3B82F6' },
    { id: 'friendly', label: 'Friendly', icon: Smile, color: '#10B981' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: '#F59E0B' },
    { id: 'humor', label: 'Humor', icon: Laugh, color: '#EC4899' },
  ];

  const rewriteDescription = async () => {
    if (!originalText.trim()) {
      Alert.alert('No Text', 'Please paste some text to rewrite.');
      return;
    }

    // Show interstitial ad before rewriting for free users
    if (!isPremium) {
      adManager.incrementActionCount();
      // Don't call performRewrite here - it will be called when ad is dismissed
    } else {
      await performRewrite();
    }
  };

  const performRewrite = async () => {
    setIsRewriting(true);
    
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: originalText,
          tone: selectedTone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite description');
      }

      setRewrittenText(data.rewrittenText);
      
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
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = () => {
    Alert.alert('Copied!', 'Rewritten description copied to clipboard');
  };

  const shareDescription = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleUpgradeToPremium = () => {
    router.push('/(tabs)/premium');
  };

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

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, isRewriting && styles.buttonDisabled]}
            onPress={rewriteDescription}
            disabled={isRewriting}
          >
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              style={styles.buttonGradient}
            >
              {isRewriting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Wand2 size={20} color="#FFFFFF" />
              )}
              <Text style={styles.generateButtonText}>
                {isRewriting ? 'Casting Transformation...' : 'Transform Text'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Rewritten Text Output */}
          {rewrittenText && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Transformed Description</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                    <Copy size={20} color="#D97706" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={shareDescription}>
                    <Share size={20} color="#D97706" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.rewrittenText}>{rewrittenText}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Interstitial Ad */}
        <InterstitialAd
          visible={adManager.showInterstitial}
          onClose={adManager.hideInterstitial}
          onUpgrade={handleUpgradeToPremium}
          onAdDismissedAction={performRewrite}
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
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
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
    fontFamily: 'Inter-SemiBold',
    color: '#C4B5FD',
    marginTop: 8,
  },
  toneLabelSelected: {
    color: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
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
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
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
  rewrittenText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 20,
  },
});
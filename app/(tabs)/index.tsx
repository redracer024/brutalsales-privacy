/// <reference types="node" />

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  Switch,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown, CreditCard as Edit3, FileText, Settings, Zap, Shield, TrendingUp, Star, MessageCircle, CircleHelp as HelpCircle, Lightbulb, X } from 'lucide-react-native';
import AdBanner from '../../components/AdBanner';
import InterstitialAd from '../../components/InterstitialAd';
import SupportModal from '../../components/SupportModal';
import { useAdManager } from '../../hooks/useAdManager';
import { useGooglePlayBilling } from '../../hooks/useGooglePlayBilling';
import { supabase } from '../../lib/supabase';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import crashlytics from '@react-native-firebase/crashlytics';

declare const require: (moduleId: string) => any;

const HEADER_IMAGE = require('../../assets/images/header.png');

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'RockSalt-Regular': require('../../assets/fonts/RockSalt-Regular.ttf'),
  });

  const [isPremium, setIsPremium] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [maxDaily, setMaxDaily] = useState(3);
  const [user, setUser] = useState<any>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Google Play Billing integration
  const { 
    isPremiumActive, 
    isInitialized, 
    error: billingError 
  } = useGooglePlayBilling();

  const adManager = useAdManager({
    isPremium,
    showInterstitialAfter: 2, // Show interstitial after 2 actions
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }

        // Handle guest mode or no session
        if (!session?.user) {
          console.log('No active session - using guest mode settings');
          setIsPremium(false);
          setDailyUsage(0);
          setMaxDaily(3);
          return;
        }

        // Load user data if session exists
        const { data: userData, error: userError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 means no data found
          console.error('Error getting user data:', userError);
          return;
        }

        if (userData) {
          setIsPremium(userData.is_premium || false);
          setDailyUsage(userData.daily_usage || 0);
          setMaxDaily(userData.is_premium ? 999 : 3);
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsPremium(false);
        setDailyUsage(0);
        setMaxDaily(3);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateDescription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Show dialog to either sign in or continue as guest
        Alert.alert(
          'Sign In Required',
          'Would you like to sign in or continue as guest?',
          [
            {
              text: 'Sign In',
              onPress: () => router.push('/login')
            },
            {
              text: 'Continue as Guest',
              onPress: () => {
                // Set guest mode and navigate
                setIsPremium(false);
                setDailyUsage(0);
                setMaxDaily(3);
                router.push('/create');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      // User is logged in, proceed to create page
      router.push('/create');
    } catch (error) {
      console.error('Error in handleCreateDescription:', error);
      Alert.alert('Error', 'Failed to check session status. Please try again.');
    }
  };

  const handleRewriteDescription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to rewrite descriptions. You can also continue in guest mode with limited features.',
          [
            { text: 'Sign In', onPress: () => router.push('/login') },
            { text: 'Continue as Guest', onPress: () => router.push('/rewrite') },
          ]
        );
        return;
      }
      
      router.push('/rewrite');
    } catch (error) {
      console.error('Error in handleRewriteDescription:', error);
      Alert.alert('Error', 'Failed to check session. Please try again.');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/(tabs)/premium');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Ad Banner */}
          <AdBanner isPremium={isPremium} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>BrutalSales</Text>
            <Text style={styles.subtitle}>AI-Powered Product Descriptions</Text>
            {!user && (
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={() => router.push('/(auth)/signup')}
              >
                <LinearGradient
                  colors={['#D97706', '#F59E0B']}
                  style={styles.signUpButtonGradient}
                >
                  <Text style={styles.signUpButtonText}>Sign Up Free</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Usage Card */}
          <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Daily Usage</Text>
              <Text style={styles.usageCount}>{dailyUsage} / {maxDaily}</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={[
                  styles.progressFill,
                  { width: `${(dailyUsage / maxDaily) * 100}%` }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Main Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={handleCreateDescription}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Edit3 size={32} color="#FFFFFF" />
                <Text style={styles.primaryActionTitle}>Create Description</Text>
                <Text style={styles.primaryActionSubtitle}>
                  Generate powerful sales copy from scratch
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={handleRewriteDescription}
            >
              <LinearGradient
                colors={['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.1)']}
                style={styles.secondaryActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FileText size={28} color="#DC2626" />
                <Text style={styles.secondaryActionTitle}>Rewrite Description</Text>
                <Text style={styles.secondaryActionSubtitle}>
                  Transform existing text with AI magic
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity 
                style={styles.helpButton}
                onPress={() => setShowHelpModal(true)}
              >
                <LinearGradient
                  colors={['rgba(167, 139, 250, 0.2)', 'rgba(167, 139, 250, 0.1)']}
                  style={styles.helpButtonGradient}
                >
                  <HelpCircle size={20} color="#A78BFA" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/terms')}
              >
                <LinearGradient
                  colors={['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.1)']}
                  style={styles.quickActionGradient}
                >
                  <FileText size={24} color="#D97706" />
                  <Text style={styles.quickActionText}>Terms of Sale</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/premium')}
              >
                <LinearGradient
                  colors={['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.1)']}
                  style={styles.quickActionGradient}
                >
                  <Crown size={24} color="#DC2626" />
                  <Text style={[styles.quickActionText, { color: '#DC2626' }]}>Go Premium</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/features')}
              >
                <LinearGradient
                  colors={['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.1)']}
                  style={styles.quickActionGradient}
                >
                  <Lightbulb size={24} color="#D97706" />
                  <Text style={styles.quickActionText}>Feature Roadmap</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setShowSupportModal(true)}
              >
                <LinearGradient
                  colors={['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.1)']}
                  style={styles.quickActionGradient}
                >
                  <MessageCircle size={24} color="#D97706" />
                  <Text style={styles.quickActionText}>Support</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Mystical Features</Text>
            
            <View style={styles.featureCard}>
              <Zap size={24} color="#D97706" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI-Powered Generation</Text>
                <Text style={styles.featureDescription}>
                  Harness the power of advanced AI to create compelling, conversion-focused descriptions
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Shield size={24} color="#D97706" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Professional Quality</Text>
                <Text style={styles.featureDescription}>
                  Every description is crafted to maximize engagement and drive sales
                </Text>
              </View>
            </View>
          </View>

          {/* Test Crashlytics Button (DEV ONLY) */}
          {__DEV__ && (
            <TouchableOpacity
              style={{ marginTop: 40, backgroundColor: '#EF4444', padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={() => crashlytics().crash()}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Test Crashlytics Crash</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Interstitial Ad */}
        <InterstitialAd
          visible={adManager.showInterstitial}
          onClose={adManager.hideInterstitial}
          onUpgrade={handleUpgradeToPremium}
          onAdDismissedAction={() => {}}
          isPremium={isPremium}
        />

        {/* Support Modal */}
        <SupportModal
          visible={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />

        {/* Help Modal */}
        <Modal
          visible={showHelpModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>How to Use Quick Actions</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowHelpModal(false)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>Terms of Sale</Text>
                  <Text style={styles.helpText}>
                    Set up your standard terms that will be automatically added to all your product descriptions. This includes return policies, shipping information, and warranty details.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>Go Premium</Text>
                  <Text style={styles.helpText}>
                    Upgrade to Premium for unlimited descriptions, advanced AI models, and priority support. Choose between monthly or yearly plans.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>Vote Features</Text>
                  <Text style={styles.helpText}>
                    Help shape the future of BrutalSales by voting on upcoming features. Your input helps us prioritize what to build next.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>Support</Text>
                  <Text style={styles.helpText}>
                    Get help with any questions or issues. Our support team is here to assist you with using BrutalSales effectively.
                  </Text>
                </View>
              </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    width: '100%',
  },
  title: {
    fontSize: 84,
    fontFamily: 'RockSalt-Regular',
    color: '#D97706',
    textAlign: 'center',
    textShadowColor: 'rgba(217, 119, 6, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 28,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(217, 119, 6, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  usageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#D97706',
    fontFamily: 'Inter-SemiBold',
  },
  usageCount: {
    fontSize: 22,
    fontWeight: '600',
    color: '#D97706',
    fontFamily: 'Inter-SemiBold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  upgradeButton: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  primaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  actionGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryActionTitle: {
    fontSize: 24,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  primaryActionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryActionGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  secondaryActionTitle: {
    fontSize: 22,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondaryActionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Cinzel-SemiBold',
    color: '#D97706',
    textShadowColor: 'rgba(217, 119, 6, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  helpButton: {
    padding: 8,
  },
  helpButtonGradient: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1.5,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickActionGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#D97706',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  toggleLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 119, 6, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#D97706',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    lineHeight: 24,
  },
  signUpButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signUpButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
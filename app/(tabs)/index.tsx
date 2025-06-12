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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown, CreditCard as Edit3, FileText, Settings, Zap, Shield, TrendingUp, Star, MessageCircle, CircleHelp as HelpCircle, Lightbulb } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import InterstitialAd from '@/components/InterstitialAd';
import SupportModal from '@/components/SupportModal';
import { useAdManager } from '@/hooks/useAdManager';
import { useGooglePlayBilling } from '@/hooks/useGooglePlayBilling';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const [dailyUsage, setDailyUsage] = useState(1); // Current usage
  const [maxDaily] = useState(3); // Free tier limit
  const [user, setUser] = useState<any>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Google Play Billing integration
  const { 
    isPremiumActive, 
    isInitialized, 
    error: billingError 
  } = useGooglePlayBilling();

  // Check if user is premium (Google Play Billing OR Supabase subscription)
  const [supabasePremium, setSupabasePremium] = useState(false);
  const isPremium = isPremiumActive() || supabasePremium;

  const adManager = useAdManager({
    isPremium,
    showInterstitialAfter: 2, // Show interstitial after 2 actions
  });

  useEffect(() => {
    checkAuthAndSubscription();
  }, []);

  const checkAuthAndSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: subscriptionData } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        setSupabasePremium(subscriptionData?.subscription_status === 'active');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleCreateDescription = () => {
    if (!isPremium && dailyUsage >= maxDaily) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve reached your daily limit of 3 descriptions. Upgrade to Premium for unlimited access!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => router.push('/(tabs)/premium') }
        ]
      );
      return;
    }
    
    adManager.incrementActionCount();
    router.push('/(tabs)/create');
  };

  const handleRewriteDescription = () => {
    if (!isPremium && dailyUsage >= maxDaily) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve reached your daily limit of 3 descriptions. Upgrade to Premium for unlimited access!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => router.push('/(tabs)/premium') }
        ]
      );
      return;
    }
    
    adManager.incrementActionCount();
    router.push('/(tabs)/rewrite');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Ad Banner */}
          <AdBanner isPremium={isPremium} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>BrutalSales</Text>
            <Text style={styles.subtitle}>Forge Legendary Descriptions</Text>
            {user && (
              <Text style={styles.welcomeText}>Welcome back, {user.user_metadata?.full_name || user.email}!</Text>
            )}
            
            {/* Billing Status for Android */}
            {Platform.OS === 'android' && (
              <View style={styles.billingStatusContainer}>
                {!isInitialized ? (
                  <Text style={styles.billingStatus}>🔄 Initializing Google Play Billing...</Text>
                ) : (
                  <Text style={styles.billingStatusSuccess}>✅ Google Play Billing Ready</Text>
                )}
                
                {billingError && (
                  <Text style={styles.errorText}>⚠️ Billing Error: {billingError}</Text>
                )}
              </View>
            )}
          </View>

          {/* Usage Card */}
          <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <View style={styles.usageInfo}>
                <Text style={styles.usageTitle}>
                  {isPremium ? 'Premium Active' : 'Daily Usage'}
                </Text>
                <Text style={styles.usageCount}>
                  {isPremium ? 'Unlimited' : `${dailyUsage}/${maxDaily}`}
                </Text>
              </View>
              {isPremium && <Crown size={24} color="#D97706" />}
            </View>
            
            {!isPremium && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(dailyUsage / maxDaily) * 100}%` }
                    ]} 
                  />
                </View>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => router.push('/(tabs)/premium')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            )}
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
              <FileText size={28} color="#D97706" />
              <Text style={styles.secondaryActionTitle}>Rewrite Description</Text>
              <Text style={styles.secondaryActionSubtitle}>
                Transform existing text with AI magic
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/terms')}
              >
                <Settings size={24} color="#A78BFA" />
                <Text style={styles.quickActionText}>Terms of Sale</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/features')}
              >
                <Lightbulb size={24} color="#A78BFA" />
                <Text style={styles.quickActionText}>Vote Features</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/premium')}
              >
                <Crown size={24} color="#A78BFA" />
                <Text style={styles.quickActionText}>Go Premium</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setShowSupportModal(true)}
              >
                <MessageCircle size={24} color="#A78BFA" />
                <Text style={styles.quickActionText}>Support</Text>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#A78BFA',
    marginTop: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    marginTop: 8,
    textAlign: 'center',
  },
  billingStatusContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  billingStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  billingStatusSuccess: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#22C55E',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
    textAlign: 'center',
  },
  usageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageInfo: {
    flex: 1,
  },
  usageTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#C4B5FD',
  },
  usageCount: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  upgradeButton: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
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
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  primaryActionTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  secondaryActionTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  secondaryActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#C4B5FD',
    marginTop: 8,
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
    fontSize: 16,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    lineHeight: 18,
  },
});
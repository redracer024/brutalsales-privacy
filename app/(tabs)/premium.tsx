import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  Crown, 
  Check, 
  Zap, 
  Shield, 
  TrendingUp, 
  Star,
  Infinity,
  X,
  Rocket
} from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import { supabase } from '@/lib/supabase';
import { products } from '@/src/stripe-config';
import { useGooglePlayBilling } from '@/hooks/useGooglePlayBilling';

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Google Play Billing integration
  const { 
    isInitialized,
    isPremiumActive,
    getPremiumProduct,
    getYearlyProduct,
    purchaseProduct,
    error: billingError,
    retryInitialization
  } = useGooglePlayBilling();

  // Check if user is premium (Google Play Billing OR Supabase subscription)
  const [supabasePremium, setSupabasePremium] = useState(false);
  const isPremium = isPremiumActive || supabasePremium;

  const monthlyProduct = getPremiumProduct();
  const yearlyProduct = getYearlyProduct();

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

        setSubscription(subscriptionData);
        setSupabasePremium(subscriptionData?.subscription_status === 'active');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: monthlyProduct?.localizedPrice || '$9.99',
      period: 'per month',
      description: 'Perfect for individual sellers',
      icon: Crown,
      color: '#D97706',
      productId: monthlyProduct?.productId,
      features: [
        'Unlimited descriptions',
        'Ad-free experience',
        'Advanced AI models',
        'Priority support'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: yearlyProduct?.localizedPrice || '$19.99',
      period: 'per month',
      description: 'For power sellers who need advanced tools',
      icon: Rocket,
      color: '#8B5CF6',
      productId: yearlyProduct?.productId,
      features: [
        'Everything in Premium',
        'Browser extension access',
        'Voice input',
        'Bulk operations (CSV upload)',
        'Marketplace auto-posting',
        'Multi-language support',
        'Performance analytics'
      ],
      popular: true,
      comingSoon: true
    }
  ];

  const handleUpgrade = async (planId: string) => {
    // Handle Google Play Billing for Android
    if (Platform.OS === 'android') {
      if (!isInitialized) {
        Alert.alert('Error', 'Google Play Billing is not initialized. Please try again.');
        return;
      }

      const plan = plans.find(p => p.id === planId);
      if (!plan?.productId) {
        Alert.alert('Error', 'Product not available. Please try again later.');
        return;
      }

      setIsProcessing(true);
      
      try {
        const purchase = await purchaseProduct(plan.productId);
        
        if (purchase) {
          Alert.alert(
            'Purchase Successful!',
            'Welcome to BrutalSales Premium! You now have unlimited access.',
            [{ text: 'OK' }]
          );
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Purchase failed';
        Alert.alert('Purchase Failed', errorMessage);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Handle Stripe for web/other platforms
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to upgrade to premium.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    setIsProcessing(true);
    
    try {
      const product = products[0]; // Get the upgrade product
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: 'brutalsales://success',
          cancel_url: 'brutalsales://cancel',
          mode: product.mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        await Linking.openURL(data.url);
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      Alert.alert('Error', error.message || 'Failed to start upgrade process');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPlanButton = (plan: any) => {
    if (plan.comingSoon) {
      return (
        <View style={styles.planButtonContainer}>
          <View style={[styles.planButton, styles.comingSoonButton]}>
            <LinearGradient
              colors={[plan.color, plan.color]}
              style={styles.buttonGradient}
            >
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </LinearGradient>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.planButtonContainer}
        onPress={() => handleUpgrade(plan.id)}
        disabled={isProcessing}
      >
        <View style={[styles.planButton, isProcessing && styles.buttonDisabled]}>
          <LinearGradient
            colors={[plan.color, plan.color]}
            style={styles.buttonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.upgradeButtonText}>
                Upgrade Now
              </Text>
            )}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F0A19', '#1E1B4B', '#312E81']}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.premiumActiveContainer}>
              <Crown size={64} color="#D97706" />
              <Text style={styles.premiumActiveTitle}>Premium Active!</Text>
              <Text style={styles.premiumActiveDescription}>
                You're enjoying all premium features. Thank you for supporting BrutalSales!
              </Text>
              
              {subscription && (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionTitle}>Subscription Details</Text>
                  <Text style={styles.subscriptionDetail}>
                    Status: {subscription.subscription_status}
                  </Text>
                  {subscription.current_period_end && (
                    <Text style={styles.subscriptionDetail}>
                      Next billing: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              {Platform.OS === 'android' && isPremiumActive && (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionTitle}>Google Play Subscription</Text>
                  <Text style={styles.subscriptionDetail}>
                    ✅ Active via Google Play Store
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        {/* Ad Banner - only show for free users */}
        <AdBanner isPremium={isPremium} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.crownContainer}>
              <Crown size={48} color="#D97706" />
            </View>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>
              Unlock the full potential of AI-powered sales descriptions
            </Text>
          </View>

          {/* Billing Status for Android */}
          {Platform.OS === 'android' && (
            <View style={styles.billingStatus}>
              {!isInitialized ? (
                <View style={styles.statusRow}>
                  <ActivityIndicator size="small" color="#D97706" />
                  <Text style={styles.statusText}>Initializing Google Play Billing...</Text>
                </View>
              ) : (
                <Text style={styles.statusTextSuccess}>✅ Google Play Billing Ready</Text>
              )}
              
              {billingError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error: {billingError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={retryInitialization}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Pricing Cards */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <View style={[styles.planIconContainer, { backgroundColor: `${plan.color}20` }]}>
                      <IconComponent size={32} color={plan.color} />
                    </View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>

                  <View style={styles.planPricing}>
                    <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                    {plan.period && <Text style={styles.planPeriod}>{plan.period}</Text>}
                  </View>

                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Check size={16} color={plan.color} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {renderPlanButton(plan)}
                </View>
              );
            })}
          </View>

          {/* Platform Notice */}
          {Platform.OS !== 'android' && (
            <View style={styles.platformNotice}>
              <Text style={styles.platformNoticeText}>
                💡 On non-Android devices, payments are processed via Stripe. 
                Android users get native Google Play Billing integration.
              </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  crownContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 22,
  },
  billingStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
  },
  statusTextSuccess: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#22C55E',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  plansContainer: {
    marginBottom: 32,
    gap: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  planCardPopular: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  planCardComingSoon: {
    opacity: 0.8,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    right: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  popularBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  planIconContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#A78BFA',
    textAlign: 'center',
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planPrice: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  planPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    marginTop: 4,
  },
  planFeatures: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    flex: 1,
  },
  planButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  planButtonSelected: {
    // Additional styling for selected button
  },
  planButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#C4B5FD',
  },
  planButtonTextSelected: {
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  platformNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  platformNoticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#60A5FA',
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumActiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 60,
  },
  premiumActiveTitle: {
    fontSize: 32,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  premiumActiveDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  subscriptionInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    width: '100%',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subscriptionDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    marginBottom: 4,
  },
  comingSoonButton: {
    opacity: 0.7,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  planButtonContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
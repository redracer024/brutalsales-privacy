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
import { router, useRouter } from 'expo-router';
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
import { useAuth } from '@/hooks/useAuth';
import { GooglePlayBilling } from '@/lib/googlePlayBilling';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  type: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  icon?: any; // For Lucide icons
  color?: string;
  comingSoon?: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
}

const plans: Plan[] = [
  {
    id: 'premium-monthly',
    name: 'Premium',
    price: '9.99',
    period: 'per month',
    description: 'Perfect for individual sellers',
    type: 'monthly',
    features: [
      'Unlimited descriptions',
      'Ad-free experience',
      'Advanced AI models',
      'Priority support'
    ],
    icon: Crown,
    color: '#D97706'
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: '19.99',
    period: 'per month',
    description: 'For professional sellers',
    type: 'monthly',
    features: [
      'Everything in Premium',
      'Custom branding',
      'Team collaboration',
      'API access',
      'Advanced analytics'
    ],
    icon: Shield,
    color: '#EC4899',
    comingSoon: true
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    price: '99.99',
    period: 'per year',
    description: 'Best value for power sellers',
    type: 'yearly',
    features: [
      'Everything in monthly plan',
      'Save 17% compared to monthly',
      'Early access to new features',
      'Premium support'
    ],
    popular: true,
    icon: Rocket,
    color: '#8B5CF6'
  }
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { padding: 20 },
  header: {
    alignItems: 'center',
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
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    marginBottom: 16,
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planPrice: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#D97706',
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    marginBottom: 12,
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
    color: '#D97706',
    marginLeft: 8,
  },
  planButtonContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  planButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    width: '100%',
    opacity: 1,
  },
  comingSoonButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  comingSoonText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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
    color: '#D97706',
    marginTop: 24,
    marginBottom: 16,
  },
  premiumActiveDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
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
    fontFamily: 'EagleLake-Regular',
    color: '#D97706',
    marginBottom: 12,
  },
  subscriptionDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D97706',
    marginBottom: 4,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    width: '100%',
    opacity: 1,
  },
  upgradeButtonSelected: {
    borderColor: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  upgradeButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
  },
});

export default function PremiumScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { user, loading } = useAuth();
  const {
    isInitialized: isBillingInitialized,
    isLoading: isBillingLoading,
    error: billingError,
    products: googlePlayProducts,
    purchaseProduct,
    retryInitialization,
  } = useGooglePlayBilling();
  const router = useRouter();

  const checkAuthAndSubscription = async () => {
    try {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      console.log('Checking subscription for user:', user.id);

      // Check subscription status
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to check subscription status');
        return;
      }

      // Set subscription state - will be null if no active subscription found
      setSubscription(subscriptionData || null);

      // If on Android, also check Google Play subscription
      if (Platform.OS === 'android') {
        try {
          await retryInitialization();
        } catch (err) {
          console.error('Error initializing billing:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize billing');
        }
      }
    } catch (err) {
      console.error('Error in checkAuthAndSubscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription status');
    }
  };

  useEffect(() => {
    if (!loading) {
      checkAuthAndSubscription();
    }
  }, [user, loading]);

  const handleUpgrade = async (planId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'android') {
        if (!isBillingInitialized) {
          Alert.alert('Error', 'Google Play Billing is not initialized. Please try again.');
          return;
        }

        try {
          const purchase = await purchaseProduct(planId);
          console.log('Purchase successful:', purchase);
          
          // Verify purchase with backend
          const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-purchase', {
            body: {
              purchaseToken: purchase.purchaseToken,
              productId: purchase.productId,
              userId: user?.id
            }
          });

          if (verificationError) {
            throw new Error('Purchase verification failed');
          }

          Alert.alert('Success', 'Thank you for upgrading to premium!');
          router.replace('/(tabs)');
        } catch (purchaseError) {
          console.error('Purchase error:', purchaseError);
          Alert.alert('Error', 'Failed to complete purchase. Please try again.');
        }
      } else if (Platform.OS === 'web') {
        // Use Stripe for web
        const response = await fetch('/api/stripe-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: planId,
            userId: user?.id,
          }),
        });

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        // For iOS, we'll implement Apple's In-App Purchase later
        Alert.alert('Coming Soon', 'iOS in-app purchases will be available soon!');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanButton = (plan: Plan) => {
    // Show Coming Soon for Pro plan
    if (plan.comingSoon) {
      return (
        <TouchableOpacity
          style={[styles.upgradeButton, styles.upgradeButtonDisabled]}
          onPress={() => Alert.alert('Coming Soon', 'This plan will be available soon!')}
        >
          <Text style={styles.upgradeButtonText}>Coming Soon</Text>
        </TouchableOpacity>
      );
    }

    // For Android, use Google Play Billing
    if (Platform.OS === 'android') {
      const googlePlayProduct = isBillingInitialized ? googlePlayProducts.find(p => p.productId === plan.id) : null;

      return (
        <TouchableOpacity
          style={[
            styles.upgradeButton,
            selectedPlan === plan.id && styles.upgradeButtonSelected,
            isLoading && styles.upgradeButtonDisabled,
          ]}
          onPress={() => handleUpgrade(plan.id)}
          disabled={isLoading || !isBillingInitialized}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              {isBillingInitialized ? `Upgrade Now - ${googlePlayProduct?.localizedPrice || plan.price}` : 'Loading...'}
            </Text>
          )}
        </TouchableOpacity>
      );
    } else if (Platform.OS === 'web') {
      // Use Stripe pricing for web
      return (
        <TouchableOpacity
          style={[
            styles.upgradeButton,
            selectedPlan === plan.id && styles.upgradeButtonSelected,
            isLoading && styles.upgradeButtonDisabled,
          ]}
          onPress={() => handleUpgrade(plan.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              {`Upgrade Now - $${plan.price}`}
            </Text>
          )}
        </TouchableOpacity>
      );
    } else {
      // For iOS, show coming soon
      return (
        <TouchableOpacity
          style={[styles.upgradeButton, styles.upgradeButtonDisabled]}
          onPress={() => Alert.alert('Coming Soon', 'iOS in-app purchases will be available soon!')}
        >
          <Text style={styles.upgradeButtonText}>Coming Soon to iOS</Text>
        </TouchableOpacity>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F0A19', '#1E1B4B', '#312E81']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D97706" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Show premium active only if user has an active subscription
  if (user && subscription?.status === 'active') {
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
                    Status: {subscription.status}
                  </Text>
                  {subscription.current_period_end && (
                    <Text style={styles.subscriptionDetail}>
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              {Platform.OS === 'android' && isBillingInitialized && (
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

  // Show upgrade options for non-premium users
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        {/* Ad Banner - only show for free users */}
        <AdBanner isPremium={false} />

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
              {!isBillingInitialized ? (
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
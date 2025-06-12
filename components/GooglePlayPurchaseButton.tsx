import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Smartphone } from 'lucide-react-native';
import { useGooglePlayBilling } from '@/hooks/useGooglePlayBilling';
import { GOOGLE_PLAY_PRODUCTS } from '@/lib/googlePlayBilling';

interface GooglePlayPurchaseButtonProps {
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
}

export default function GooglePlayPurchaseButton({ 
  onPurchaseSuccess, 
  onPurchaseError 
}: GooglePlayPurchaseButtonProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { 
    isInitialized, 
    purchaseProduct, 
    getPremiumProduct, 
    error: billingError 
  } = useGooglePlayBilling();

  const premiumProduct = getPremiumProduct();

  const handlePurchase = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Google Play Billing is not initialized');
      return;
    }

    if (Platform.OS !== 'android') {
      Alert.alert(
        'Android Only',
        'Google Play Billing is only available on Android devices. Please use the web version for other platforms.'
      );
      return;
    }

    setIsPurchasing(true);

    try {
      const purchase = await purchaseProduct(GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY);
      
      if (purchase) {
        Alert.alert(
          'Purchase Successful!',
          'Welcome to BrutalSales Premium! You now have unlimited access.',
          [{ text: 'OK', onPress: onPurchaseSuccess }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Purchase failed';
      Alert.alert('Purchase Failed', errorMessage);
      onPurchaseError?.(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleWebFallback = () => {
    Alert.alert(
      'Web Version',
      'For non-Android devices, please use our web version at brutalsales.com to upgrade to Premium.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Web', onPress: () => {
          // In a real app, you'd open the web browser
          console.log('Open web version');
        }}
      ]
    );
  };

  if (billingError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Billing Error: {billingError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleWebFallback}>
          <Text style={styles.retryButtonText}>Use Web Version</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#D97706" />
        <Text style={styles.loadingText}>Initializing billing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' ? (
        <TouchableOpacity
          style={[styles.purchaseButton, isPurchasing && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={isPurchasing}
        >
          <LinearGradient
            colors={['#D97706', '#F59E0B']}
            style={styles.buttonGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Crown size={20} color="#FFFFFF" />
            )}
            <Text style={styles.purchaseButtonText}>
              {isPurchasing 
                ? 'Processing...' 
                : `Upgrade to Premium ${premiumProduct?.price || '$9.99'}/month`
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.webButton} onPress={handleWebFallback}>
          <Smartphone size={20} color="#D97706" />
          <Text style={styles.webButtonText}>
            Use Web Version for Premium
          </Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.disclaimer}>
        {Platform.OS === 'android' 
          ? 'Billed through Google Play Store'
          : 'Premium features available on web version'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
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
  purchaseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  webButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});
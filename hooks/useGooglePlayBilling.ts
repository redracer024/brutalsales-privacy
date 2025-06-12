import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { GooglePlayBilling } from '../lib/googlePlayBilling';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useGooglePlayBilling() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<GooglePlayBilling.Product[]>([]);
  const [purchases, setPurchases] = useState<GooglePlayBilling.Purchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeBilling();
    return () => {
      // Cleanup subscriptions
      GooglePlayBilling.GooglePlayBilling.endConnection();
    };
  }, []);

  const initializeBilling = async () => {
    try {
      if (Platform.OS !== 'android') {
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      await GooglePlayBilling.GooglePlayBilling.initConnection();
      await loadProducts();
      await loadPurchases();
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize billing');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productIds = Object.values(GooglePlayBilling.GOOGLE_PLAY_PRODUCTS);
      const products = await GooglePlayBilling.GooglePlayBilling.getProducts(productIds);
      setProducts(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }
  };

  const loadPurchases = async () => {
    try {
      const purchases = await GooglePlayBilling.GooglePlayBilling.getPurchases();
      setPurchases(purchases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
    }
  };

  const purchaseProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const purchase = await GooglePlayBilling.GooglePlayBilling.purchaseProduct(productId);
      
      // Verify purchase with backend
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-purchase', {
        body: {
          purchaseToken: purchase.purchaseToken,
          productId: purchase.productId,
          userId: user?.id
        }
      });

      if (verificationError || !verificationData.verified) {
        throw new Error('Purchase verification failed');
      }

      // Update local state
      setPurchases(prev => [...prev, purchase]);
      return purchase;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const purchases = await GooglePlayBilling.GooglePlayBilling.getPurchases();
      const hasActiveSubscription = purchases.some(purchase => 
        purchase.productId === GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY ||
        purchase.productId === GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY
      );
      return hasActiveSubscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check premium status');
      return false;
    }
  };

  const isPremiumActive = purchases.some(purchase => 
    purchase.productId === GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY ||
    purchase.productId === GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY
  );

  const getPremiumProduct = () => {
    return products.find(product => product.productId === GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY);
  };

  const getYearlyProduct = () => {
    return products.find(product => product.productId === GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY);
  };

  const retryInitialization = async () => {
    setError(null);
    setIsLoading(true);
    await initializeBilling();
  };

  return {
    isInitialized,
    isLoading,
    products,
    purchases,
    error,
    purchaseProduct,
    checkPremiumStatus,
    refreshProducts: loadProducts,
    refreshPurchases: loadPurchases,
    isPremiumActive,
    getPremiumProduct,
    getYearlyProduct,
    retryInitialization
  };
}
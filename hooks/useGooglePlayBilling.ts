import { useState, useEffect } from 'react';
import * as InAppPurchases from 'react-native-iap';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { analyticsService, ANALYTICS_EVENTS, AnalyticsEventName } from '../lib/analytics';

interface Purchase {
  productId: string;
  purchaseToken: string;
  transactionId: string;
  transactionDate: number;
  isAcknowledged: boolean;
}

interface GooglePlayBillingHook {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  products: InAppPurchases.Product[];
  purchases: Purchase[];
  purchaseProduct: (productId: string) => Promise<Purchase>;
  refreshPurchases: () => Promise<void>;
}

export function useGooglePlayBilling(): GooglePlayBillingHook {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<InAppPurchases.Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const initBilling = async () => {
      try {
        await InAppPurchases.initConnection();
        setIsInitialized(true);

        // Get available products
        const availableProducts = await InAppPurchases.getProducts({
          skus: ['premium_monthly', 'premium_yearly']
        });
        setProducts(availableProducts);

        // Get existing purchases
        const existingPurchases = await InAppPurchases.getPurchaseHistory();
        setPurchases(existingPurchases.map(p => ({
          productId: p.productId,
          purchaseToken: p.purchaseToken || '',
          transactionId: p.transactionId || '',
          transactionDate: p.transactionDate || Date.now(),
          isAcknowledged: false
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize billing');
      }
    };

    initBilling();

    return () => {
      if (isInitialized) {
        InAppPurchases.endConnection();
      }
    };
  }, [isInitialized]);

  const purchaseProduct = async (productId: string): Promise<Purchase> => {
    if (!isInitialized) {
      throw new Error('Billing not initialized');
    }

    try {
      setIsLoading(true);
      
      // Track purchase initiated
      await analyticsService.logEvent(ANALYTICS_EVENTS.PURCHASE_INITIATED as AnalyticsEventName, {
        productId,
        timestamp: Date.now()
      });

      const result = await InAppPurchases.requestSubscription({
        sku: productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false
      });

      if (!result || Array.isArray(result)) {
        throw new Error('Purchase failed');
      }

      const purchase: Purchase = {
        productId: result.productId,
        purchaseToken: result.purchaseToken || '',
        transactionId: result.transactionId || '',
        transactionDate: result.transactionDate || Date.now(),
        isAcknowledged: false
      };

      // Track successful purchase
      await analyticsService.logEvent(ANALYTICS_EVENTS.PURCHASE_COMPLETED as AnalyticsEventName, {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        timestamp: purchase.transactionDate
      });

      // Verify purchase with backend
      const { error: verificationError } = await supabase.functions.invoke('verify-purchase', {
        body: {
          purchaseToken: purchase.purchaseToken,
          productId: purchase.productId,
          userId: user?.id
        }
      });

      if (verificationError) {
        throw new Error(`Purchase verification failed: ${verificationError.message}`);
      }

      // Update local state
      setPurchases(prev => [...prev, purchase]);
      return purchase;
    } catch (err) {
      // Track purchase error
      await analyticsService.logEvent(ANALYTICS_EVENTS.PURCHASE_ERROR as AnalyticsEventName, {
        productId,
        error_message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now(),
        success: false
      });
      
      setError(err instanceof Error ? err.message : 'Failed to purchase product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPurchases = async () => {
    try {
      setIsLoading(true);
      const refreshedPurchases = await InAppPurchases.getPurchaseHistory();
      setPurchases(refreshedPurchases.map(p => ({
        productId: p.productId,
        purchaseToken: p.purchaseToken || '',
        transactionId: p.transactionId || '',
        transactionDate: p.transactionDate || Date.now(),
        isAcknowledged: false
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh purchases');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInitialized,
    isLoading,
    error,
    products,
    purchases,
    purchaseProduct,
    refreshPurchases
  };
}
import { Platform } from 'react-native';
import * as InAppPurchases from 'react-native-iap';

export namespace GooglePlayBilling {
  export interface Product {
    productId: string;
    title: string;
    description: string;
    price: string;
    localizedPrice: string;
    currency: string;
  }

  export interface Purchase {
    productId: string;
    purchaseToken: string;
    transactionId: string;
    transactionDate: number;
    acknowledged: boolean;
  }

  export const GOOGLE_PLAY_PRODUCTS = {
    PREMIUM_MONTHLY: 'premium_monthly_999',
    PREMIUM_YEARLY: 'premium_yearly_1999'
  } as const;

  class GooglePlayBillingReal {
    private initialized = false;

    async initConnection(): Promise<boolean> {
      if (this.initialized) return true;
      
      try {
        await InAppPurchases.initConnection();
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize billing:', error);
        return false;
      }
    }

    async endConnection(): Promise<void> {
      if (!this.initialized) return;
      
      try {
        await InAppPurchases.endConnection();
        this.initialized = false;
      } catch (error) {
        console.error('Failed to end billing connection:', error);
      }
    }

    async getProducts(productIds: string[]): Promise<Product[]> {
      if (!this.initialized) {
        throw new Error('Billing not initialized');
      }

      try {
        const products = await InAppPurchases.getSubscriptions(productIds);
        return products.map(product => ({
          productId: product.productId,
          title: product.title,
          description: product.description,
          price: product.price,
          localizedPrice: product.localizedPrice,
          currency: product.currency
        }));
      } catch (error) {
        console.error('Failed to get products:', error);
        throw error;
      }
    }

    async getPurchases(): Promise<Purchase[]> {
      if (!this.initialized) {
        throw new Error('Billing not initialized');
      }

      try {
        const purchases = await InAppPurchases.getAvailablePurchases();
        return purchases.map(purchase => ({
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          transactionId: purchase.transactionId,
          transactionDate: purchase.transactionDate,
          acknowledged: purchase.isAcknowledged
        }));
      } catch (error) {
        console.error('Failed to get purchases:', error);
        throw error;
      }
    }

    async purchaseProduct(productId: string): Promise<Purchase> {
      if (!this.initialized) {
        throw new Error('Billing not initialized');
      }

      try {
        const purchase = await InAppPurchases.requestSubscription({
          sku: productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false
        });

        return {
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          transactionId: purchase.transactionId,
          transactionDate: purchase.transactionDate,
          acknowledged: purchase.isAcknowledged
        };
      } catch (error) {
        console.error('Failed to purchase product:', error);
        throw error;
      }
    }
  }

  class GooglePlayBillingMock {
    async initConnection(): Promise<boolean> {
      return true;
    }

    async endConnection(): Promise<void> {
      // No-op
    }

    async getProducts(productIds: string[]): Promise<Product[]> {
      return productIds.map(id => ({
        productId: id,
        title: id === GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY ? 'Premium Monthly' : 'Premium Yearly',
        description: 'Premium subscription',
        price: id === GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY ? '$9.99' : '$19.99',
        localizedPrice: id === GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY ? '$9.99' : '$19.99',
        currency: 'USD'
      }));
    }

    async getPurchases(): Promise<Purchase[]> {
      return [];
    }

    async purchaseProduct(productId: string): Promise<Purchase> {
      return {
        productId,
        purchaseToken: 'mock-purchase-token',
        transactionId: 'mock-transaction-id',
        transactionDate: Date.now(),
        acknowledged: true
      };
    }
  }

  export const GooglePlayBilling = Platform.OS === 'android' 
    ? new GooglePlayBillingReal()
    : new GooglePlayBillingMock();
}

// Helper functions
export const formatPrice = (price: string): string => {
  return price || '$9.99';
};

export const isValidPurchase = (purchase: GooglePlayBilling.Purchase): boolean => {
  return !!(purchase.productId && purchase.transactionId);
};

export const getPremiumProductId = (): string => {
  return GooglePlayBilling.GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY;
};
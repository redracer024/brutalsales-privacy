import { Platform } from 'react-native';
import * as InAppPurchases from 'react-native-iap';
import type { 
  Subscription,
  SubscriptionPurchase,
  ProductPurchase
} from 'react-native-iap';

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
    PRO_MONTHLY: 'pro_monthly_1999',
    PREMIUM_YEARLY: 'premium_yearly_9999'
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
        const products = await InAppPurchases.getSubscriptions({ skus: productIds });
        return products.map((product: Subscription) => ({
          productId: product.productId,
          title: product.title || '',
          description: product.description || '',
          price: this.getProductPrice(product.productId),
          localizedPrice: this.getProductPrice(product.productId),
          currency: 'USD'
        }));
      } catch (error) {
        console.error('Failed to get products:', error);
        throw error;
      }
    }

    private getProductPrice(productId: string): string {
      switch (productId) {
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY:
          return '$9.99';
        case GOOGLE_PLAY_PRODUCTS.PRO_MONTHLY:
          return '$19.99';
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY:
          return '$99.99';
        default:
          return '$0.00';
      }
    }

    async getPurchases(): Promise<Purchase[]> {
      if (!this.initialized) {
        throw new Error('Billing not initialized');
      }

      try {
        const purchases = await InAppPurchases.getAvailablePurchases();
        return purchases.map((purchase: ProductPurchase) => ({
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken || '',
          transactionId: purchase.transactionId || '',
          transactionDate: purchase.transactionDate || Date.now(),
          acknowledged: false // We'll handle acknowledgment separately
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
        const result = await InAppPurchases.requestSubscription({
          sku: productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false
        });

        if (!result || Array.isArray(result)) {
          throw new Error('Purchase failed');
        }

        return {
          productId: result.productId,
          purchaseToken: result.purchaseToken || '',
          transactionId: result.transactionId || '',
          transactionDate: result.transactionDate || Date.now(),
          acknowledged: false // We'll handle acknowledgment separately
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
        title: this.getProductTitle(id),
        description: this.getProductDescription(id),
        price: this.getProductPrice(id),
        localizedPrice: this.getProductPrice(id),
        currency: 'USD'
      }));
    }

    private getProductTitle(id: string): string {
      switch (id) {
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY:
          return 'Premium Monthly';
        case GOOGLE_PLAY_PRODUCTS.PRO_MONTHLY:
          return 'Pro Monthly';
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY:
          return 'Premium Yearly';
        default:
          return 'Unknown Product';
      }
    }

    private getProductDescription(id: string): string {
      switch (id) {
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY:
          return 'Premium monthly subscription';
        case GOOGLE_PLAY_PRODUCTS.PRO_MONTHLY:
          return 'Pro monthly subscription';
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY:
          return 'Premium yearly subscription';
        default:
          return 'Unknown subscription';
      }
    }

    private getProductPrice(id: string): string {
      switch (id) {
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_MONTHLY:
          return '$9.99';
        case GOOGLE_PLAY_PRODUCTS.PRO_MONTHLY:
          return '$19.99';
        case GOOGLE_PLAY_PRODUCTS.PREMIUM_YEARLY:
          return '$99.99';
        default:
          return '$0.00';
      }
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
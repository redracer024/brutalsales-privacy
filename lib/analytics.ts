import { Platform } from 'react-native';
import { analytics } from './firebase';
import { analyticsEventBus } from '../components/AnalyticsDashboard';

// Event names
export const ANALYTICS_EVENTS = {
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
  GENERATE_DESCRIPTION: 'generate_description',
  PURCHASE_INITIATED: 'purchase_initiated',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_ERROR: 'purchase_error',
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  ERROR_OCCURRED: 'error_occurred',
  FEATURE_USED: 'feature_used'
} as const;

// Event parameters interfaces
interface BaseEventParams {
  timestamp?: number;
  platform?: string;
  app_version?: string;
}

interface ButtonClickParams extends BaseEventParams {
  button_name: string;
  screen_name?: string;
  action_result?: 'success' | 'failure';
}

interface GenerateDescriptionParams extends BaseEventParams {
  prompt: string;
  length?: number;
  success: boolean;
  error_message?: string;
  duration_ms?: number;
}

interface PurchaseParams extends BaseEventParams {
  productId: string;
  price?: number;
  currency?: string;
  payment_method?: string;
}

interface PurchaseCompletedParams extends PurchaseParams {
  transactionId: string;
  success: boolean;
}

interface ErrorParams extends BaseEventParams {
  error_message: string;
  success: boolean;
}

interface FeatureUsedParams extends BaseEventParams {
  feature_name: string;
  duration_ms?: number;
  success: boolean;
  error_message?: string;
  // Performance metrics
  component_name?: string;
  fps?: number;
  memory_usage?: number;
  // Experiment data
  variant?: string;
  user_id?: string;
  experiment_id?: string;
  conversion_value?: number;
}

interface UserParams extends BaseEventParams {
  method?: 'email' | 'google' | 'apple';
  success: boolean;
  error_message?: string;
}

// Event parameters type mapping
export interface EventParamsMap {
  [ANALYTICS_EVENTS.BUTTON_CLICK]: ButtonClickParams;
  [ANALYTICS_EVENTS.GENERATE_DESCRIPTION]: GenerateDescriptionParams;
  [ANALYTICS_EVENTS.PURCHASE_INITIATED]: PurchaseParams;
  [ANALYTICS_EVENTS.PURCHASE_COMPLETED]: PurchaseCompletedParams;
  [ANALYTICS_EVENTS.PURCHASE_ERROR]: PurchaseParams & ErrorParams;
  [ANALYTICS_EVENTS.USER_SIGNUP]: UserParams;
  [ANALYTICS_EVENTS.USER_LOGIN]: UserParams;
  [ANALYTICS_EVENTS.USER_LOGOUT]: UserParams;
  [ANALYTICS_EVENTS.ERROR_OCCURRED]: ErrorParams;
  [ANALYTICS_EVENTS.FEATURE_USED]: FeatureUsedParams;
  [ANALYTICS_EVENTS.APP_OPEN]: BaseEventParams;
  [ANALYTICS_EVENTS.SCREEN_VIEW]: BaseEventParams & { screen_name: string; screen_class?: string };
}

// Event name type
export type AnalyticsEventName = keyof EventParamsMap;

// Analytics service
class AnalyticsService {
  private isEnabled = !__DEV__;

  constructor() {
    // Enable analytics collection
    if (Platform.OS !== 'web') {
      analytics.setAnalyticsCollectionEnabled(this.isEnabled);
    }
  }

  // Enable/disable analytics collection
  async setAnalyticsCollectionEnabled(enabled: boolean) {
    if (Platform.OS === 'web') return;
    
    try {
      this.isEnabled = enabled;
      await analytics.setAnalyticsCollectionEnabled(enabled);
      
      // Emit to dashboard
      analyticsEventBus.emit({
        timestamp: Date.now(),
        eventName: 'analytics_collection_enabled',
        params: { enabled }
      });
    } catch (error) {
      console.error('Failed to set analytics collection enabled:', error);
    }
  }

  // Log screen view
  async logScreenView(screenName: string, screenClass?: string) {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      const params = {
        screen_name: screenName,
        screen_class: screenClass || screenName,
      };
      
      await analytics.logScreenView(params);
      
      // Emit to dashboard
      analyticsEventBus.emit({
        timestamp: Date.now(),
        eventName: ANALYTICS_EVENTS.SCREEN_VIEW,
        params
      });
    } catch (error) {
      console.error('Failed to log screen view:', error);
    }
  }

  // Log event with type-safe parameters
  async logEvent<T extends AnalyticsEventName>(
    eventName: T,
    params?: EventParamsMap[T]
  ) {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      const baseParams = {
        timestamp: Date.now(),
        platform: Platform.OS,
        ...params,
      };

      await analytics.logEvent(eventName, baseParams);
      
      // Emit to dashboard
      analyticsEventBus.emit({
        timestamp: Date.now(),
        eventName,
        params: baseParams
      });
    } catch (error) {
      console.error(`Failed to log event ${eventName}:`, error);
    }
  }

  // Set user properties
  async setUserProperties(properties: { [key: string]: string }) {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      Object.entries(properties).forEach(([key, value]) => {
        analytics.setUserProperty(key, value);
      });
      
      // Emit to dashboard
      analyticsEventBus.emit({
        timestamp: Date.now(),
        eventName: 'set_user_properties',
        params: properties
      });
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  // Set user ID
  async setUserId(userId: string | null) {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      await analytics.setUserId(userId);
      
      // Emit to dashboard
      analyticsEventBus.emit({
        timestamp: Date.now(),
        eventName: 'set_user_id',
        params: { userId }
      });
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  // Reset analytics data
  async resetAnalyticsData() {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      await analytics.resetAnalyticsData();
      
      // Emit to dashboard
      analyticsEventBus.emit({
        timestamp: Date.now(),
        eventName: 'reset_analytics_data',
        params: null
      });
    } catch (error) {
      console.error('Failed to reset analytics data:', error);
    }
  }
}

export const analyticsService = new AnalyticsService(); 
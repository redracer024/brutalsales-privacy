import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

interface ErrorContext {
  [key: string]: any;
}

export const logError = (error: Error, context?: ErrorContext) => {
  try {
    // Log to Crashlytics only on native platforms
    if (Platform.OS !== 'web') {
      // Pass error message as the second parameter
      crashlytics().recordError(error, JSON.stringify(context) || 'No context available');
    }
  } catch (loggingError) {
    // Fallback if crashlytics fails
    console.error('Failed to log to crashlytics:', loggingError);
  }

  // Log to console in development
  if (__DEV__) {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }
};

export const logEvent = (name: string, params?: { [key: string]: any }) => {
  try {
    // Log to Crashlytics only on native platforms
    if (Platform.OS !== 'web') {
      crashlytics().log(`${name}: ${JSON.stringify(params || {})}`);
    }
  } catch (loggingError) {
    console.error('Failed to log event to crashlytics:', loggingError);
  }

  // Log to console in development
  if (__DEV__) {
    console.log('Event:', name, params);
  }
};

export const setUserIdentifier = (userId: string) => {
  try {
    if (Platform.OS !== 'web') {
      crashlytics().setUserId(userId);
    }
  } catch (error) {
    console.error('Failed to set user identifier in crashlytics:', error);
  }
};

export const setCustomKey = (key: string, value: string | number | boolean) => {
  try {
    if (Platform.OS !== 'web') {
      if (typeof value === 'string') {
        crashlytics().setAttribute(key, value);
      } else if (typeof value === 'number') {
        crashlytics().setAttributes({ [key]: value.toString() });
      } else if (typeof value === 'boolean') {
        crashlytics().setAttributes({ [key]: value.toString() });
      }
    }
  } catch (error) {
    console.error('Failed to set custom key in crashlytics:', error);
  }
}; 
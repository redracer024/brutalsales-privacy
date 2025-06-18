import { Platform } from 'react-native';

// Initialize a dummy Firebase instance for web development
const app = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'AIzaSyBEJU1kQ_mw-DDJYBtsyB0EIay1U96OwO4',
    authDomain: 'brutal-sales-app.firebaseapp.com',
    projectId: 'brutal-sales-app',
    storageBucket: 'gs://brutal-sales-app.firebasestorage.app',
    messagingSenderId: '1086197989974',
    appId: '1:1086197989974:android:0da818e33d81714d17b1f7',
    measurementId: 'G-V36G0ER5E8',
    databaseURL: 'https://brutal-sales-app.firebaseio.com'
  }
};

// Create a mock analytics object for development
const analytics = {
  logEvent: (eventName: string, params?: Record<string, any>) => {
    if (__DEV__) {
      console.log('Analytics Event:', eventName, params);
    }
    return Promise.resolve();
  },
  setAnalyticsCollectionEnabled: (enabled: boolean) => {
    if (__DEV__) {
      console.log('Analytics Collection Enabled:', enabled);
    }
    return Promise.resolve();
  },
  logScreenView: (screenView: { screen_name: string; screen_class?: string }) => {
    if (__DEV__) {
      console.log('Screen View:', screenView);
    }
    return Promise.resolve();
  },
  setUserProperty: (name: string, value: string) => {
    if (__DEV__) {
      console.log('User Property:', name, value);
    }
    return Promise.resolve();
  },
  setUserId: (userId: string | null) => {
    if (__DEV__) {
      console.log('User ID:', userId);
    }
    return Promise.resolve();
  },
  resetAnalyticsData: () => {
    if (__DEV__) {
      console.log('Analytics Data Reset');
    }
    return Promise.resolve();
  }
};

// Create a mock crashlytics object for development
const crashlytics = {
  log: (message: string) => {
    if (__DEV__) {
      console.log('Crashlytics Log:', message);
    }
    return Promise.resolve();
  },
  setAttribute: (name: string, value: string) => {
    if (__DEV__) {
      console.log('Crashlytics Attribute:', name, value);
    }
    return Promise.resolve();
  },
  recordError: (error: Error) => {
    if (__DEV__) {
      console.log('Crashlytics Error:', error);
    }
    return Promise.resolve();
  }
};

export { app, analytics, crashlytics }; 
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase.appId,
  measurementId: Constants.expoConfig?.extra?.firebase.measurementId,
};

let app: FirebaseApp | undefined;
// Check if we are in the browser
if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
}

let analytics: Analytics | undefined;
// Check if running in a browser environment and analytics is supported
if (app && typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Mock crashlytics for web since it's mobile-only
const crashlytics = {
  recordError: (error: Error, jsErrorName?: string) => {
    if (__DEV__) {
      console.error(jsErrorName || 'Crashlytics-Web-Mock', error);
    }
  },
  setAttributes: (attributes: { [key: string]: string }) => {
    if (__DEV__) {
      console.log('Crashlytics-Web-Mock: setAttributes', attributes);
    }
  },
};

export { app, analytics, crashlytics };
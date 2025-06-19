import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'BrutalSales',
  slug: 'brutal-sales-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'brutalsales',
  assetBundlePatterns: ['**/*'],
  
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F0A19',
  },

  plugins: [
    'expo-router',
    'expo-font',
    '@react-native-google-signin/google-signin',
    [
      'react-native-google-mobile-ads',
      {
        android_app_id: 'ca-app-pub-8865921274070980~7438698780',
        // ios_app_id: "ca-app-pub-xxxxxxxx~xxxxxxxx"
      },
    ],
  ],

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.brutalsales.app',
    googleServicesFile: './GoogleService-Info.plist',
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F0A19',
    },
    package: 'com.brutalsales.app',
    googleServicesFile: './google-services.json',
    config: {
      googleMobileAdsAppId: 'ca-app-pub-8865921274070980~7438698780',
    },
  },

  web: {
    favicon: './assets/images/favicon.png',
    bundler: 'metro',
    output: 'static',
  },

  extra: {
    ...config.extra,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googleAuth: {
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
  },
}); 
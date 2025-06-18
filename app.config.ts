import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'BrutalSales',
  slug: 'brutal-sales-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F0A19'
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.brutalsales.app',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0A19',
      dark: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0F0A19'
      }
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F0A19'
    },
    package: 'com.brutalsales.app',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0A19',
      dark: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0F0A19'
      }
    }
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        backgroundColor: '#0F0A19',
        imageResizeMode: 'contain'
      }
    ],
    'expo-router'
  ],
  scheme: 'brutalsales',
  extra: {
    supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
    googleClientId: '1086197989974-ukknjt4bc0ucb9dbtuoo7fo3chfo48ha.apps.googleusercontent.com'
  }
}); 
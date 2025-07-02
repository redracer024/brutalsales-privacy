import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

let supabase: any;

// Check if the values are actually configured (not just placeholder values)
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your_') && 
  !supabaseAnonKey.includes('your_') &&
  supabaseUrl.startsWith('http');

// Development fallback warning
if (!isConfigured) {
  if (__DEV__) {
    console.error(
      '⚠️ Missing Supabase configuration!\n' +
      'Please set up your .env file with:\n' +
      '- EXPO_PUBLIC_SUPABASE_URL\n' +
      '- EXPO_PUBLIC_SUPABASE_ANON_KEY\n\n' +
      'Using dummy values for development...'
    );
    
    // Create a mock client that logs warnings
    const mockSupabase = {
      auth: {
        signUp: async () => {
          console.warn('🚫 Supabase auth.signUp called with dummy config');
          return { data: null, error: new Error('Supabase not configured') };
        },
        signInWithPassword: async () => {
          console.warn('🚫 Supabase auth.signInWithPassword called with dummy config');
          return { data: null, error: new Error('Supabase not configured') };
        },
        signOut: async () => {
          console.warn('🚫 Supabase auth.signOut called with dummy config');
          return { error: null };
        },
        getSession: async () => {
          return { data: { session: null }, error: null };
        },
        onAuthStateChange: (callback: any) => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getUser: async () => {
          return { data: { user: null }, error: null };
        },
      },
      from: (table: string) => ({
        select: async () => ({
          data: [],
          error: new Error('Supabase not configured'),
        }),
        insert: async () => ({
          data: null,
          error: new Error('Supabase not configured'),
        }),
        update: async () => ({
          data: null,
          error: new Error('Supabase not configured'),
        }),
        delete: async () => ({
          data: null,
          error: new Error('Supabase not configured'),
        }),
        upsert: async () => ({
          data: null,
          error: new Error('Supabase not configured'),
        }),
      }),
      storage: {
        from: (bucket: string) => ({
          upload: async () => ({
            data: null,
            error: new Error('Supabase not configured'),
          }),
          download: async () => ({
            data: null,
            error: new Error('Supabase not configured'),
          }),
        }),
      },
    };
    
    // Use mock for development
    supabase = mockSupabase;
  } else {
    // In production, throw error
    throw new Error('Missing Supabase URL or Anon Key in app config');
  }
} else {
  // Cross-platform storage adapter
  const customStorage = {
    getItem: async (key: string) => {
      try {
        if (Platform.OS === 'web') {
          return window.localStorage.getItem(key);
        }
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        if (Platform.OS === 'web') {
          window.localStorage.setItem(key, value);
          return;
        }
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error writing to storage:', error);
      }
    },
    removeItem: async (key: string) => {
      try {
        if (Platform.OS === 'web') {
          window.localStorage.removeItem(key);
          return;
        }
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from storage:', error);
      }
    },
  };

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
      storage: customStorage,
      storageKey: 'brutal-sales-auth-token',
      flowType: 'pkce',
      debug: __DEV__,
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  });
}

export { supabase };
export default supabase;
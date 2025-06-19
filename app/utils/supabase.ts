import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

// Create a custom storage adapter that handles SSR
const customStorage = {
  getItem: async (key: string) => {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },
};

export const googleSignIn = async () => {
  if (Platform.OS === 'web') {
    // Web: Use Expo AuthSession
    const webClientId = Constants.expoConfig?.extra?.googleAuth?.webClientId;
    if (!webClientId) throw new Error('Google Web Client ID is not configured in app.config.ts');

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const result = await AuthSession.startAsync({
      authUrl:
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${webClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token id_token` +
        `&scope=openid%20profile%20email` +
        `&nonce=${Math.random().toString(36).substring(2, 15)}`,
    });

    if (result.type !== 'success' || !result.params.id_token) {
      throw new Error('Google Sign-In failed or was cancelled.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.params.id_token,
    });

    if (error) throw error;
    return data;
  } else {
    // Native: Use GoogleSignin
    const webClientId = Constants.expoConfig?.extra?.googleAuth?.webClientId;
    if (!webClientId) throw new Error('Google Web Client ID is not configured in app.config.ts');

    GoogleSignin.configure({ webClientId });
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.idToken) {
      throw new Error('Google Sign-In failed to return an ID token.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });

    if (error) throw error;
    return data;
  }
};

export default supabase; 
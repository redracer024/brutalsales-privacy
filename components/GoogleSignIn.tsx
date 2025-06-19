import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

interface GoogleSignInProps {
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function GoogleSignIn({ onError, isLoading }: GoogleSignInProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const webClientId = Constants.expoConfig?.extra?.googleAuth?.webClientId;
      if (!webClientId) {
        setConfigError('Google webClientId is missing in app config.');
        return;
      }

      GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
        forceCodeForRefreshToken: false,
      });
    } catch (e) {
      setConfigError('Failed to configure Google Sign-In.');
    }
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error('Could not get ID token from Google.');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        onError(error.message);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        onError('No session returned from Supabase.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError('Google Play Services is not available or outdated.');
      } else {
        console.error('Google Sign-In Error:', error);
        onError(error.message || 'An unknown error occurred during sign in.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (configError) {
    // Show a visible error if config is broken
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{configError}</Text>
      </View>
    );
  }

  if (isLoading || isSigningIn) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        style={{ width: '100%', height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleSignIn}
        disabled={isSigningIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
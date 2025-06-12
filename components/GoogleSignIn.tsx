import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery document
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

interface GoogleSignInProps {
  onSuccess: (userInfo: any) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function GoogleSignIn({ onSuccess, onError, isLoading }: GoogleSignInProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({
        scheme: 'brutalsales',
        path: 'auth',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response.params.code);
    } else if (response?.type === 'error') {
      onError('Authentication failed');
      setIsSigningIn(false);
    }
  }, [response]);

  const handleAuthSuccess = async (code: string) => {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: makeRedirectUri({
            scheme: 'brutalsales',
            path: 'auth',
          }),
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.access_token) {
        // Get user info
        const userResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
        );
        const userInfo = await userResponse.json();
        
        onSuccess(userInfo);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Auth error:', error);
      onError('Failed to complete authentication');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Sign in error:', error);
      onError('Failed to start authentication');
      setIsSigningIn(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, (isLoading || isSigningIn) && styles.buttonDisabled]}
      onPress={handleSignIn}
      disabled={isLoading || isSigningIn || !request}
    >
      <LinearGradient
        colors={['#D97706', '#F59E0B']}
        style={styles.gradient}
      >
        <Text style={styles.buttonText}>
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
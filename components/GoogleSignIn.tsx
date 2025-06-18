import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInProps {
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function GoogleSignIn({ onError, isLoading }: GoogleSignInProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '1086197989974-ukknjt4bc0ucb9dbtuoo7fo3chfo48ha.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'error') {
      onError('Authentication failed');
      setIsSigningIn(false);
    }
  }, [response]);

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

  // Don't render on web platform
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, (isLoading || isSigningIn) && styles.buttonDisabled]}
      onPress={handleSignIn}
      disabled={isLoading || isSigningIn || !request}
    >
      <LinearGradient
        colors={['#4285F4', '#34A853', '#FBBC05', '#EA4335']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Image
          source={require('../assets/images/google-logo.png')}
          style={styles.googleIcon}
        />
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
    marginHorizontal: 16,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  }
});
import React from 'react';
import { Platform, TouchableOpacity, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { googleSignIn } from '../utils/supabase';
import { supabase } from '../lib/supabase';

let GoogleLogin: any = null;
if (Platform.OS === 'web') {
  // Dynamically require to avoid breaking native builds
  GoogleLogin = require('react-google-login').GoogleLogin;
}

export default function GoogleSignInButton({ onSuccess, onError }: { onSuccess?: (data: any) => void, onError?: (err: any) => void }) {
  const [loading, setLoading] = React.useState(false);

  const handleNativeSignIn = async () => {
    try {
      setLoading(true);
      const data = await googleSignIn();
      onSuccess?.(data);
    } catch (error) {
      onError?.(error);
      console.error('Google sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === 'web' && GoogleLogin) {
    // Use react-google-login for web
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    return (
      <GoogleLogin
        clientId={webClientId}
        buttonText="Sign in with Google"
        onSuccess={async (response: any) => {
          try {
            // response.tokenId is the id_token
            const { data, error } = await googleSignInWeb(response.tokenId);
            if (error) throw error;
            onSuccess?.(data);
          } catch (err) {
            onError?.(err);
          }
        }}
        onFailure={onError}
        cookiePolicy={'single_host_origin'}
        render={(renderProps: any) => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: 12,
              margin: 8,
              boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
              cursor: 'pointer'
            }}
          >
            <img src="/assets/images/google-logo.png" alt="Google" style={{ width: 24, height: 24, marginRight: 12 }} />
            {loading ? <span>Loading...</span> : <span>Sign in with Google</span>}
          </button>
        )}
      />
    );
  }

  // Native button
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleNativeSignIn}
      disabled={loading}
    >
      <Image
        source={require('../../assets/images/google-logo.png')}
        style={styles.logo}
      />
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <Text style={styles.text}>Sign in with Google</Text>
      )}
    </TouchableOpacity>
  );
}

// Helper for web sign-in with Supabase
async function googleSignInWeb(idToken: string) {
  return supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
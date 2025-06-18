import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { googleSignIn } from '../utils/supabase';

export const GoogleSignInButton = () => {
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await googleSignIn();
    } catch (error) {
      console.error('Google sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
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
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
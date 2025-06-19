import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        if (params.error) {
          throw new Error(params.error as string);
        }

        // The session will be automatically saved by the Supabase client
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        // Redirect to the home page
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0A19',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
}); 
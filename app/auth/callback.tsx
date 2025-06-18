import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { API_URL } from '@/constants';

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle Google OAuth code flow
        if (params.code) {
          const response = await fetch(`${API_URL}/auth/google/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: params.code,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to exchange code for token');
          }

          // Sign in with Supabase using the session data
          const { error } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (error) throw error;

          router.replace('/(tabs)');
          return;
        }

        // If no code in params, try to get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          router.replace('/(auth)/login');
          return;
        }

        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params]);

  if (params.error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0A19' }}>
        <Text style={{ color: 'red', textAlign: 'center', padding: 20 }}>
          Error: {params.error_description || params.error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0A19' }}>
      <Text style={{ color: '#fff' }}>Completing sign in...</Text>
    </View>
  );
} 
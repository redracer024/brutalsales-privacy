import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { router } from 'expo-router';
import { Alert, View, ActivityIndicator } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  initialized: boolean;
  isPremium: boolean;
  isPremiumLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  initialized: false,
  isPremium: false,
  isPremiumLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(true);

  const checkPremiumStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsPremium(false);
      setIsPremiumLoading(false);
      return;
    }
    try {
      setIsPremiumLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('is_premium')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // 'PGRST116' means no rows found, which is not an error here.
      
      setIsPremium(data?.is_premium || false);
    } catch (e) {
      setIsPremium(false); // Default to not premium on error
    } finally {
      setIsPremiumLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await checkPremiumStatus(currentSession.user.id);
      } else {
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          if (refreshError.message.includes('no current session')) {
            setSession(null);
            setUser(null);
            setIsPremium(false);
          } else {
            throw refreshError;
          }
        } else if (refreshedSession) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
          await checkPremiumStatus(refreshedSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setIsPremium(false);
        }
      }
    } catch (error) {
      setSession(null);
      setUser(null);
      setIsPremium(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      await checkPremiumStatus(session?.user?.id);

      switch (event) {
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          // Wait a bit before navigation to ensure state is updated
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 100);
          break;
          
        case 'SIGNED_IN':
          setSession(session);
          setUser(session?.user ?? null);
          // Wait a bit before navigation to ensure state is updated
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
          break;
          
        case 'TOKEN_REFRESHED':
          setSession(session);
          setUser(session?.user ?? null);
          break;
          
        case 'USER_UPDATED':
          setSession(session);
          setUser(session?.user ?? null);
          break;
          
        case 'INITIAL_SESSION':
          setSession(session);
          setUser(session?.user ?? null);
          // If we have a session on initial load, navigate to tabs
          if (session) {
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 100);
          }
          break;
          
        case 'PASSWORD_RECOVERY':
          break;
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      // Wait a bit before navigation to ensure state is updated
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    refreshSession,
    initialized,
    isPremium,
    isPremiumLoading,
  };

  // Don't render children until we've initialized auth
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0A19' }}>
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
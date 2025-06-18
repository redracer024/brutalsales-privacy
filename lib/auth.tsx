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
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  initialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshSession = async () => {
    try {
      setLoading(true);
      console.log('Refreshing session...');
      
      // Get the current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (currentSession) {
        console.log('Setting session from current session:', currentSession.user.id);
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        // Try to refresh the session
        console.log('No current session, attempting refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          if (refreshError.message.includes('no current session')) {
            console.log('No session to refresh');
            setSession(null);
            setUser(null);
          } else {
            console.error('Refresh error:', refreshError);
            throw refreshError;
          }
        } else if (refreshedSession) {
          console.log('Setting session from refreshed session:', refreshedSession.user.id);
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        } else {
          console.log('No session after refresh');
          setSession(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    console.log('Auth provider mounted');
    
    // Initial session check
    refreshSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      switch (event) {
        case 'SIGNED_OUT':
          console.log('User signed out');
          setSession(null);
          setUser(null);
          router.replace('/(auth)/login');
          break;
          
        case 'SIGNED_IN':
          console.log('User signed in:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed for user:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          break;
          
        case 'USER_UPDATED':
          console.log('User updated:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          break;
          
        case 'INITIAL_SESSION':
          console.log('Initial session:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          break;
          
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery for user:', session?.user?.id);
          break;
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => {
      console.log('Cleaning up auth subscription');
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
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
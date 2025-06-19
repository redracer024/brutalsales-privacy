import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Constants from 'expo-constants';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function LoginScreen() {
  const { user, loading: authLoading, refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/(tabs)');
    }
  }, [user, authLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Error', 'Invalid email or password. Please try again.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }

      if (data.session) {
        await refreshSession();
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to start session. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGuestMode = async () => {
    setIsLoading(true);
    try {
      const guestEmail = Constants.expoConfig?.extra?.guestEmail || 'guest@brutalsales.app';
      const guestPassword = Constants.expoConfig?.extra?.guestPassword || 'guestmode123!';

      // First try to sign in with guest credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword
      });

      // If guest account doesn't exist, create it
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: guestPassword,
          options: {
            emailRedirectTo: getRedirectUrl(),
            data: {
              role: 'guest'
            }
          }
        });

        if (signUpError) {
          Alert.alert('Error', signUpError.message || 'Unable to create guest account');
          return;
        }

        if (signUpData.session) {
          await refreshSession();
          router.replace('/(tabs)');
        } else {
          Alert.alert('Success', 'Guest account created. Please check your email to verify your account.');
        }
      } else if (error) {
        Alert.alert('Error', error.message || 'Unable to enter guest mode');
      } else if (data.session) {
        await refreshSession();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Guest mode error:', error);
      Alert.alert('Error', error.message || 'Unable to enter guest mode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectUrl = () => {
    if (Platform.OS === 'web') {
      return `${window.location.origin}/auth/callback`;
    }
    return Constants.expoConfig?.web?.auth?.redirectUrl || process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
  };

  const handleGoogleError = (msg: string) => {
    Alert.alert('Google Sign-In Error', msg);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#0F0A19', '#1E1B4B', '#312E81']}
          style={styles.gradient}
        >
          <ActivityIndicator size="large" color="#D97706" />
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Crown size={48} color="#D97706" />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue forging legendary descriptions</Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Mail color="#6B7280" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock color="#6B7280" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.buttonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <GoogleSignIn
              onError={handleGoogleError}
              isLoading={isLoading}
            />

            {!isLoading && <Text style={{color: 'white', textAlign: 'center'}}>GoogleSignIn should be visible below ↑</Text>}

            <TouchableOpacity 
              style={[styles.guestButton, isLoading && styles.buttonDisabled]} 
              onPress={onGuestMode}
              disabled={isLoading}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#A78BFA',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#C4B5FD',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});
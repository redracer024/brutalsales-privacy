import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold
} from '@expo-google-fonts/cinzel';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { GooglePlayBilling } from '../lib/googlePlayBilling';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/lib/auth';
import { usePathname } from 'expo-router';
import { analyticsService, ANALYTICS_EVENTS } from '../lib/analytics';
import DevMenu from '@/components/DevMenu';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AnalyticsReport from '@/components/AnalyticsReport';
import { Video, ResizeMode } from 'expo-av';
import '@/lib/firebase'; // Initialize Firebase for web

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const pathname = usePathname();

  const [fontsLoaded, fontError] = useFonts({
    'Cinzel-Regular': Cinzel_400Regular,
    'Cinzel-SemiBold': Cinzel_600SemiBold,
    'Cinzel-Bold': Cinzel_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'EagleLake-Regular': require('../assets/fonts/EagleLake-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize services
        if (Platform.OS === 'android') {
          await GooglePlayBilling.GooglePlayBilling.initConnection();
        }

        // Pre-fetch any data or assets here
        await Promise.all([
          // Add any other initialization promises here
        ]);
      } catch (error) {
        console.error('Error preparing app:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isReady) {
      // Hide splash screen once everything is ready
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isReady]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (Platform.OS === 'android') {
        GooglePlayBilling.GooglePlayBilling.endConnection().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    // Track app open
    analyticsService.logEvent(ANALYTICS_EVENTS.APP_OPEN, {
      timestamp: Date.now()
    });
  }, []);

  useEffect(() => {
    // Track screen views
    analyticsService.logScreenView(pathname);
  }, [pathname]);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0A19' }}>
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  if (!videoFinished) {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={require('../assets/splash-video.mp4')}
          rate={1.0}
          volume={0.0}
          isMuted
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          style={StyleSheet.absoluteFill}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              setVideoFinished(true);
            }
          }}
        />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="success" 
            options={{ 
              headerShown: false,
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="terms" 
            options={{ 
              headerShown: false,
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="+not-found" 
            options={{
              presentation: 'modal',
              animation: 'fade',
            }}
          />
        </Stack>
        {__DEV__ && (
          <>
            <AnalyticsDashboard />
            {showReport && (
              <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'white' 
              }}>
                <AnalyticsReport />
              </View>
            )}
            <DevMenu 
              extraButtons={[
                {
                  title: 'Analytics Report',
                  onPress: () => setShowReport(!showReport)
                }
              ]}
            />
          </>
        )}
        <StatusBar style="light" />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: '#0F0A19',
  },
});
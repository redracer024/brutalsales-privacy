import './lib/firebase';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Video, ResizeMode } from 'expo-av';
import { useFonts } from 'expo-font';
// Only import mobileAds on native
const mobileAds = Platform.OS !== 'web' ? require('react-native-google-mobile-ads').default : null;
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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const [fontsLoaded] = useFonts({
    'Cinzel-Regular': Cinzel_400Regular,
    'Cinzel-SemiBold': Cinzel_600SemiBold,
    'Cinzel-Bold': Cinzel_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'EagleLake-Regular': require('./assets/fonts/EagleLake-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize the Google Mobile Ads SDK only on native
        if (Platform.OS !== 'web' && mobileAds) {
          await mobileAds().initialize();
        }
        // Pre-load fonts and other assets
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {showVideo && (
        <Video
          source={require('./assets/splash-video.mp4')}
          rate={1.0}
          volume={0.0}
          isMuted={true}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          style={StyleSheet.absoluteFill}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              setShowVideo(false);
            }
          }}
        />
      )}
      {!showVideo && (
        <View style={styles.content}>
          {/* Main app content */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A19',
  },
  content: {
    flex: 1,
  },
}); 
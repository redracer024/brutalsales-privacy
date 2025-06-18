import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && videoFinished) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, videoFinished]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {showVideo && (
        <Video
          source={require('./assets/splash-video.mp4')}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          style={StyleSheet.absoluteFill}
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (status.isLoaded && status.didJustFinish) {
              setShowVideo(false);
              setVideoFinished(true);
            }
          }}
        />
      )}
      {!showVideo && (
        // Your main app content here
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
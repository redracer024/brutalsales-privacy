export default {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "BrutalSales",
    slug: "brutalsales",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "brutalsales",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.brutalsales.app",
      buildNumber: "1",
      deploymentTarget: "15.1",
      config: {
        googleMobileAdsAppId: "ca-app-pub-8865921274070980~8025951759"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0F0A19"
      },
      package: "com.brutalsales.app",
      versionCode: 1,
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      buildToolsVersion: "34.0.0",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "com.android.vending.BILLING"
      ],
      googleServicesFile: "./google-services.json",
      config: {
        googleMobileAdsAppId: "ca-app-pub-8865921274070980~8025951759"
      }
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
      port: 3000,
      auth: {
        redirectUrl: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || "http://localhost:3000/auth/callback"
      }
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          "web": {
            "cors": {
              "origin": ["http://localhost:3000", "https://brutalsales.app"]
            }
          },
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0",
            "extraMavenRepos": [
              "https://maven.google.com"
            ]
          },
          "ios": {
            "deploymentTarget": "15.1"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "79c998fc-a597-4dca-a9ca-ff63d9483766"
      },
      guestEmail: "guest@brutalsales.app",
      guestPassword: "guestmode123!",
      supabaseUrl: process.env.NODE_ENV === 'development' 
        ? "http://127.0.0.1:54321"
        : "https://ujkyaakvirotkyfylpsx.supabase.co",
      supabaseAnonKey: process.env.NODE_ENV === 'development'
        ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
        : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3lhYWt2aXJvdGt5ZnlscHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTYxOTQsImV4cCI6MjA2NTIzMjE5NH0.0sPjlzxwEYd2ifjuJrOdEp5zC_vOMagRBaQ_YoIJoBk",
      firebase: process.env.NODE_ENV === 'development' 
        ? {
            apiKey: 'AIzaSyBEJU1kQ_mw-DDJYBtsyB0EIay1U96OwO4',
            authDomain: 'brutal-sales-app.firebaseapp.com',
            projectId: 'brutal-sales-app',
            storageBucket: 'gs://brutal-sales-app.firebasestorage.app',
            messagingSenderId: '1086197989974',
            appId: '1:1086197989974:android:0da818e33d81714d17b1f7',
            measurementId: 'G-V36G0ER5E8',
            databaseURL: 'https://brutal-sales-app.firebaseio.com'
          }
        : {
            apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
            measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
            databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL
          }
    }
  }
};
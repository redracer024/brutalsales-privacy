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
      deploymentTarget: "13.4",
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
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    }
  }
};
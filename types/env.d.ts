declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_EAS_PROJECT_ID: string;
      EXPO_PUBLIC_APP_NAME: string;
    }
  }
}

export {};
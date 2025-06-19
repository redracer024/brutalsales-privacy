# Brutal Sales App

Brutal Sales is a mobile application built with React Native and Expo that helps users generate compelling, high-impact product descriptions using AI.

## Features

- **AI-Powered Generation**: Create unique product descriptions from scratch.
- **AI-Powered Rewriting**: Refine and improve existing descriptions with different tones.
- **Google AdMob Integration**: Monetization through banner and interstitial ads.
- **Supabase Backend**: Secure user authentication and data storage.
- **Google Sign-In**: Easy and secure authentication for users.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Yarn or npm
- Expo CLI
- An Android or iOS simulator, or a physical device with the Expo Go app.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd brutal-sales-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Setup

This project uses environment variables to handle sensitive keys for services like Supabase and Google Cloud.

1.  Create a `.env` file in the root of the project:
    ```bash
    touch .env
    ```

2.  Add the following variables to your `.env` file, replacing the placeholder values with your actual keys:

    ```env
    # Supabase Credentials
    EXPO_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
    EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

    # Google OAuth Client IDs
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID="your-google-android-client-id.apps.googleusercontent.com"
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="your-google-web-client-id.apps.googleusercontent.com"
    # EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID="your-google-ios-client-id.apps.googleusercontent.com" # Uncomment and add if you have an iOS client ID
    ```

### Running the App

1.  Start the Expo development server:
    ```bash
    npx expo start
    ```

2.  Follow the instructions in the terminal to open the app on your preferred platform (Android, iOS, or web).

## Supabase Backend

This project is configured to work with a Supabase backend. Make sure your local Supabase instance is running or that you have configured the production Supabase URLs in your `.env` file.

To run the local backend:
```bash
npx supabase start
```

# BrutalSales - AI-Powered Sales Description Generator

Transform your product listings with AI-generated descriptions that drive sales and engagement.

## Features

- 🤖 AI-powered description generation using DeepSeek
- ✨ Text rewriting with multiple tone options
- 📱 Cross-platform mobile app (iOS & Android)
- 🔐 Google OAuth authentication
- 💰 Freemium model with premium subscriptions
- 📊 Ad-supported free tier
- 🎯 Professional sales copy optimization

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- EAS CLI (for building and deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Fill in your API keys and configuration in `.env`

5. Start the development server:
   ```bash
   npm start
   ```

## Environment Setup

### Required API Keys

1. **DeepSeek API**: Get your API key from [DeepSeek](https://platform.deepseek.com)
2. **Google OAuth**: Set up OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
3. **EAS Project**: Create a project at [Expo Application Services](https://expo.dev)

### Google OAuth Setup

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your bundle identifier: `com.brutalsales.app`
6. Add redirect URIs for your app scheme

## Building for Production

### Android

```bash
npm run build:android
```

### iOS

```bash
npm run build:ios
```

## Deployment

### App Stores

```bash
# Android
npm run submit:android

# iOS  
npm run submit:ios
```

### Web

```bash
npm run build:web
```

## Monetization

- **Free Tier**: 3 descriptions per day with ads
- **Premium**: $9.99/month for unlimited descriptions and ad-free experience
- **Revenue Streams**: Subscriptions, sponsored content, affiliate partnerships

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **AI**: DeepSeek API
- **Authentication**: Google OAuth
- **Payments**: RevenueCat (recommended for production)
- **Analytics**: Firebase Analytics (recommended)
- **Crash Reporting**: Firebase Crashlytics (recommended)

## Pre-Launch Checklist

- [ ] Set up Google OAuth credentials
- [ ] Configure DeepSeek API
- [ ] Set up EAS project
- [ ] Configure app store metadata
- [ ] Set up analytics and crash reporting
- [ ] Test payment flows
- [ ] Prepare marketing materials
- [ ] Set up customer support system
- [ ] Configure privacy policy and terms of service
- [ ] Test on real devices

## Support

For support, email support@brutalsales.com or use the in-app support feature.

## License

Proprietary - All rights reserved# brutalsales-project

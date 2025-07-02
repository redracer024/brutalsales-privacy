# Brutal Sales App - Debug Report

## Issues Found and Solutions

### 1. **CRITICAL: Missing Environment Variables**
The app crashes immediately because required environment variables are not configured.

**Issue:** `lib/supabase.ts` throws an error when Supabase credentials are missing:
```
Error: Missing Supabase URL or Anon Key in app config
```

**Solution:** 
1. Copy the `.env` file I created and fill in actual values:
   - Get Supabase credentials from your Supabase project dashboard
   - Get Firebase credentials from Firebase console
   - Get Google OAuth credentials from Google Cloud Console
   - Get Stripe keys from Stripe dashboard
   - Get DeepSeek API key from their platform

### 2. **Google Mobile Ads Configuration**
The app shows warnings about missing AdMob App IDs:
- Android App ID is configured but iOS is commented out in `app.config.ts`

**Solution:**
1. Uncomment line 28 in `app.config.ts` and add your iOS AdMob App ID
2. Or remove the Google Mobile Ads plugin if not using ads

### 3. **Deprecated Dependencies**
Several packages are deprecated:
- `react-google-login` - No longer supported
- `@testing-library/jest-native` - Deprecated
- Various internal dependencies

**Solution:**
1. Replace `react-google-login` with `@react-native-google-signin/google-signin` (already installed)
2. Remove `@testing-library/jest-native` from devDependencies
3. Update test configurations to use built-in matchers

### 4. **Security Issues**
Found hardcoded credentials in test files:
- `test-supabase.ts` - Contains service role key
- `test-verify-purchase.ts` - Contains API keys
- `generate-test-token.ts` - Contains JWT secret

**Solution:**
1. Delete or secure these test files
2. Move credentials to environment variables
3. Add these files to `.gitignore`

### 5. **Missing Platform Files**
- Missing `GoogleService-Info.plist` for iOS
- `google-services.json` exists for Android

**Solution:**
1. Download `GoogleService-Info.plist` from Firebase console
2. Place it in the `ios` directory

## Quick Start Guide

### 1. Set up environment variables:
```bash
cp .env .env.local
# Edit .env.local with your actual values
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Fix immediate issues:
```bash
# Remove deprecated package
npm uninstall @testing-library/jest-native

# Clear cache
npx expo start --clear
```

### 4. Run the app:
```bash
# For web (easiest to test)
npx expo start --web

# For iOS simulator
npx expo start --ios

# For Android emulator
npx expo start --android
```

## Development Tips

1. **Start with Web**: The web version has fewer platform-specific requirements
2. **Use Development Build**: For native features, create a development build:
   ```bash
   npx expo prebuild
   npx expo run:ios # or run:android
   ```

3. **Check logs**: Use `npx expo start --clear` and check Metro bundler logs

## Required Services Setup

1. **Supabase**:
   - Create a project at supabase.com
   - Copy URL and anon key to `.env`

2. **Firebase**:
   - Create a project at console.firebase.google.com
   - Enable Authentication and Analytics
   - Download config files for both platforms

3. **Google OAuth**:
   - Set up OAuth 2.0 credentials in Google Cloud Console
   - Add authorized redirect URIs

4. **Stripe** (for payments):
   - Create account and get API keys

5. **DeepSeek** (for AI features):
   - Sign up and get API key

## Common Commands

```bash
# Start with cache cleared
npx expo start --clear

# Check for type errors
npx tsc --noEmit

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build:android
npm run build:ios
```
# Production Release Checklist for Brutal Sales App

## Overview
This checklist covers all services and configurations needed for your first production release.

---

## 1. ✅ Supabase (Database & Auth)
**Current Status:** Using local instance (http://127.0.0.1:54321)
**Action Required:** Migrate to production Supabase instance

### Steps:
- [ ] Create production Supabase project at [supabase.com](https://supabase.com)
- [ ] Set up database schema:
  ```sql
  -- Tables detected in your app:
  - user_terms
  - feature_ideas_with_votes 
  - feature_votes
  - google_play_purchases
  - subscriptions
  ```
- [ ] Configure authentication providers:
  - [ ] Enable Google OAuth
  - [ ] Configure redirect URLs
- [ ] Update environment variables:
  ```
  EXPO_PUBLIC_SUPABASE_URL=your-production-url
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
  SUPABASE_SERVICE_KEY=your-service-role-key
  ```
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure database backups
- [ ] Test authentication flow

---

## 2. 🔥 Firebase (Analytics & Crashlytics)
**Current Status:** Configured with project ID: brutal-sales-app
**Action Required:** Verify production setup

### Steps:
- [ ] Verify Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable required services:
  - [ ] Analytics
  - [ ] Crashlytics
  - [ ] Performance Monitoring (optional)
- [ ] Download and update config files:
  - [ ] `google-services.json` (Android) - ✅ Already exists
  - [ ] `GoogleService-Info.plist` (iOS) - ❌ Missing
- [ ] Configure app in Firebase Console:
  - [ ] Add SHA certificate fingerprints for Android
  - [ ] Add iOS bundle ID
- [ ] Test analytics events are being tracked
- [ ] Verify Crashlytics is receiving crash reports

---

## 3. 💰 Google AdMob
**Current Status:** Configured with test App IDs
**Action Required:** Create production ad units

### Steps:
- [ ] Create AdMob account at [admob.google.com](https://admob.google.com)
- [ ] Create your app in AdMob:
  - [ ] Android App (com.brutalsales.app)
  - [ ] iOS App (com.brutalsales.app)
- [ ] Create ad units:
  - [ ] Banner ads
  - [ ] Interstitial ads
- [ ] Update environment variables with production IDs:
  ```
  EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxx
  EXPO_PUBLIC_ADMOB_APP_ID_IOS=ca-app-pub-xxx
  EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxx
  EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxx
  ```
- [ ] Link AdMob to your Play Store app
- [ ] Set up mediation (optional)
- [ ] Configure ad content rating

---

## 4. 📱 Google Play Console
**Current Status:** Not configured
**Action Required:** Complete setup for Android release

### Steps:
- [ ] Create developer account ($25 one-time fee)
- [ ] Create new app listing
- [ ] Complete store listing:
  - [ ] App name and description
  - [ ] Screenshots (phone & tablet)
  - [ ] Feature graphic (1024x500)
  - [ ] App icon (512x512)
  - [ ] Privacy policy URL
  - [ ] App category and tags
- [ ] Content rating questionnaire
- [ ] Set up pricing and distribution
- [ ] Configure in-app products:
  - [ ] premium_monthly ($9.99)
  - [ ] premium_yearly ($99.99)
  - [ ] pro_monthly ($19.99) - marked as coming soon
- [ ] Create service account for automated deployment:
  - [ ] Generate `google-play-service-account.json`
  - [ ] Place in project root
  - [ ] Grant "Release Manager" permissions
- [ ] Set up Google Play Billing
- [ ] Configure app signing

---

## 5. 🤖 Google Play Billing / In-App Purchases
**Current Status:** Implemented with react-native-iap
**Action Required:** Configure products in Play Console

### Steps:
- [ ] Create subscription products in Play Console:
  ```
  - premium_monthly: $9.99/month
  - premium_yearly: $99.99/year
  - pro_monthly: $19.99/month (future)
  ```
- [ ] Set up subscription benefits
- [ ] Configure grace periods
- [ ] Set up server-side purchase verification
- [ ] Test with Google Play test accounts
- [ ] Implement subscription restore functionality

---

## 6. 🧠 DeepSeek API
**Current Status:** Configured and working
**Action Required:** Verify production limits

### Steps:
- [ ] Verify API key is valid
- [ ] Check rate limits for production
- [ ] Set up monitoring for API usage
- [ ] Configure error handling for quota exceeded
- [ ] Consider implementing caching to reduce API calls

---

## 7. 🔐 Google OAuth
**Current Status:** Configured with client IDs
**Action Required:** Verify production setup

### Steps:
- [ ] Verify OAuth consent screen in Google Cloud Console
- [ ] Add production redirect URIs:
  - [ ] `com.brutalsales.app://`
  - [ ] Web callback URL
- [ ] Verify all client IDs are correct:
  - [ ] Android Client ID ✅
  - [ ] Web Client ID ✅
  - [ ] iOS Client ID ❌ (placeholder)
- [ ] Test sign-in flow on all platforms

---

## 8. 💳 Stripe (Web Payments)
**Current Status:** Basic configuration exists
**Action Required:** Limited - focus on mobile billing

### Note:
Your app uses Google Play Billing for Android. Stripe is only needed for web payments, which is less critical for initial mobile release.

### Steps (Low Priority):
- [ ] Verify Stripe account
- [ ] Create products matching mobile subscriptions
- [ ] Set up webhooks for subscription events
- [ ] Test payment flow on web

---

## 9. 🚀 EAS (Expo Application Services)
**Current Status:** Configured with project ID
**Action Required:** Prepare for production builds

### Steps:
- [ ] Verify EAS project ID: `79c998fc-a597-4dca-a9ca-ff63d9483766`
- [ ] Configure production build profile
- [ ] Set up app signing credentials:
  - [ ] Android keystore
  - [ ] iOS certificates and provisioning profiles
- [ ] Update `eas.json` for production
- [ ] Test production builds before submission

---

## 10. 🍎 Apple App Store (iOS)
**Current Status:** Not configured
**Action Required:** Complete setup for iOS release

### Steps:
- [ ] Apple Developer Account ($99/year)
- [ ] Create App ID
- [ ] Configure app in App Store Connect:
  - [ ] App information
  - [ ] Screenshots (all required sizes)
  - [ ] App preview videos (optional)
  - [ ] Keywords and description
- [ ] Set up in-app purchases
- [ ] Configure app signing
- [ ] Add `GoogleService-Info.plist`

---

## 📋 Pre-Launch Checklist

### Code & Configuration:
- [ ] Remove all hardcoded credentials from test files
- [ ] Update all environment variables to production values
- [ ] Remove or secure test endpoints
- [ ] Enable production error tracking
- [ ] Disable development logging

### Testing:
- [ ] Test complete user flow on real devices
- [ ] Test payment flows with test accounts
- [ ] Verify analytics tracking
- [ ] Test offline functionality
- [ ] Performance testing

### Legal & Compliance:
- [ ] Privacy Policy URL active
- [ ] Terms of Service URL active
- [ ] GDPR compliance (if applicable)
- [ ] App content rating completed

### Marketing:
- [ ] App Store Optimization (ASO)
- [ ] Prepare launch announcement
- [ ] Set up support email/system

---

## 🚨 Critical Items for MVP

If you want to launch quickly, focus on these essentials:

1. **Supabase Production** - Your app won't work without this
2. **Google Play Console** - Required for Android release
3. **Google Play Billing** - For monetization
4. **Remove test credentials** - Security risk
5. **Privacy Policy & Terms** - Legal requirement

---

## 📱 Platform-Specific Notes

### Android (Priority):
- Your app is most ready for Android
- Google Play Billing is implemented
- Focus here for quickest launch

### iOS (Secondary):
- Missing `GoogleService-Info.plist`
- Need Apple Developer account
- In-app purchases need StoreKit implementation

### Web (Low Priority):
- Works but needs Stripe for payments
- Can be secondary channel

---

## 🎯 Recommended Launch Strategy

1. **Week 1**: Set up Supabase production, Google Play Console
2. **Week 2**: Configure all production services, test thoroughly
3. **Week 3**: Submit to Google Play Store (internal testing)
4. **Week 4**: Gradual rollout on Android
5. **Month 2**: iOS preparation and launch

---

## Need Help?

- Supabase Discord: https://discord.supabase.com
- Firebase Support: https://firebase.google.com/support
- Google Play Console Help: https://support.google.com/googleplay/android-developer
- Expo Forums: https://forums.expo.dev
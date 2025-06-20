# Mobile-Stack Documentation Research  

## 1. Google Ads (AdMob)
* **Recommended RN library:** [`react-native-google-mobile-ads`](https://github.com/invertase/react-native-google-mobile-ads) (supports Expo via config-plugin)
  * Ad formats: App-Open, Banner, Native, Interstitial, Rewarded (+ Rewarded-Interstitial)
  * Key setup steps:
    1. `npm install react-native-google-mobile-ads` (or `npx expo install …`)
    2. Add Android/iOS `app_id`s to `app.json` / `app.config.js` via the provided plugin.
    3. Call `mobileAds().initialize()` once on app launch.
  * iOS extras: SKAdNetwork IDs, `userTrackingUsageDescription` (ATT), optional static frameworks flag.
  * Testing: use `TestIds` helpers or AdMob test IDs to avoid account bans.
* **Official reference:** [Google Mobile Ads SDK docs](https://developers.google.com/ad-manager/mobile-ads-sdk)

---

## 2. Google Sign-In
* **Community library:** [`@react-native-google-signin/google-signin`](https://react-native-google-signin.github.io/)  
  * Universal API covering Android, iOS, Web, macOS; Expo-compatible (requires dev-build).
  * Provides both "Original" and new "One-Tap / Credential Manager" flows.
  * Typical flow:
    ```ts
    GoogleOneTapSignIn.configure({ webClientId: 'YOUR_WEB_ID' });
    await GoogleOneTapSignIn.checkPlayServices();
    const res = await GoogleOneTapSignIn.signIn();
    ```
  * Handles Play-Services checks, ATT, server auth codes, incremental scopes, sign-out & revoke.
* **Native docs:** [Google Identity](https://developers.google.com/identity)

---

## 3. Supabase
* **Docs portal:** <https://supabase.com/docs>
* **Key services**: Postgres DB, Auth, Realtime, Storage, Edge Functions, Vector, Cron.
* **Client libraries**:
  * JS (`@supabase/supabase-js`) – works in RN/Expo.
  * Flutter, Python, C#, Swift, Kotlin …
* **Basic usage (JS)**
  ```ts
  import { createClient } from '@supabase/supabase-js';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase.from('products').select('*');
  ```
* **Auth providers:** Email, Passwordless, OAuth (incl. Google, Apple), Mobile OTP, etc.
* **Expo guide:** [Using Supabase with Expo](https://docs.expo.dev/guides/using-supabase/)

---

## 4. Firebase
### 4.1 React Native Firebase (native SDK)
* Site: <https://rnfirebase.io>
* Modular packages (`@react-native-firebase/app`, `auth`, `firestore`, …); Expo-compatible via dev-build + config-plugins.
* Requires native config files (`google-services.json`, `GoogleService-Info.plist`) & CocoaPods `use_frameworks!`.
* Benefits: access to all mobile-only products (Crashlytics, Dynamic Links, Messaging, …), offline persistence, better perf.

### 4.2 Firebase JS SDK (web SDK)
* Lightweight alternative when you only need Auth / Firestore / Storage and want to stay inside **Expo Go**.
* Install `firebase`, call `initializeApp(…)`. Requires Metro tweak for v9.7+ (`sourceExts.push('cjs');`).
* Missing: Analytics, Crashlytics, Dynamic Links, etc.

### 4.3 Official Docs
* General portal: <https://firebase.google.com/docs>
* Expo guide: <https://docs.expo.dev/guides/using-firebase/>

---

## 5. React Native / Expo
* **React Native docs:** <https://reactnative.dev/docs/getting-started>
* **Expo docs & SDK:** <https://docs.expo.dev>
  * Recommended for rapid RN development; provides OTA updates, EAS Build, Router, config-plugins.
  * Custom native code (e.g. AdMob, RNFirebase, Google-SignIn) → requires **Dev Client** or **EAS build** with appropriate plugins.
* **Best-practice highlights (per repo rules):**
  * Functional components + hooks, TypeScript strict mode.
  * Expo Router for navigation; Zustand/RTK or React Query for state.
  * Performance: `memo`, `useCallback`, FlatList virtualization, code-splitting.
  * Accessibility, error boundaries, secure storage, environment separation.

---

### Quick Comparison Table
| Need | Library / SDK | Expo Go? |
|------|---------------|----------|
| AdMob / Google Ads | `react-native-google-mobile-ads` | ❌ (dev-build only) |
| Google Sign-In | `@react-native-google-signin/google-signin` | ❌ (dev-build only) |
| Supabase backend | `@supabase/supabase-js` | ✅ |
| Firebase core (Auth/DB/Storage – web SDK) | `firebase` | ✅ |
| Full Firebase suite (Analytics, Crashlytics, etc.) | `@react-native-firebase/*` | ❌ (dev-build only) |

---

#### Useful Starter Tutorials
* **AdMob:** "Getting Started – React Native Google Mobile Ads" → <https://docs.page/invertase/react-native-google-mobile-ads>
* **Google Sign-In:** "Installation" → <https://react-native-google-signin.github.io/docs/install>
* **Supabase + Expo:** Official guide → <https://docs.expo.dev/guides/using-supabase/>
* **Firebase + Expo (web SDK):** <https://docs.expo.dev/guides/using-firebase/>
* **React Native Firebase + Expo:** <https://rnfirebase.io/#expo>

---

> **Tip:** For any library that needs native code, add its config-plugin to `app.json` and rebuild your custom dev-client (`eas build --profile development`).  
> Keep AdUnit IDs, client IDs, API keys out of git – load via env vars or remote config.
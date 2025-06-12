import { AdMobInterstitial } from 'expo-ads-admob';

// Ad Unit IDs
export const AD_UNITS = {
  BANNER: 'ca-app-pub-8865921274070980/5399788411',
  INTERSTITIAL_CREATE: 'ca-app-pub-8865921274070980/7638136612',
  INTERSTITIAL_REWRITE: 'ca-app-pub-8865921274070980/8759646594'
} as const;

// Initialize interstitial ads
export const initializeInterstitialAds = async (): Promise<void> => {
  try {
    await AdMobInterstitial.setAdUnitID(AD_UNITS.INTERSTITIAL_CREATE);
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
  } catch (error) {
    console.error('Error initializing interstitial ads:', error);
  }
};

// Show create description interstitial ad
export const showCreateInterstitial = async (): Promise<void> => {
  try {
    await AdMobInterstitial.setAdUnitID(AD_UNITS.INTERSTITIAL_CREATE);
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    await AdMobInterstitial.showAdAsync();
  } catch (error) {
    console.error('Error showing create interstitial:', error);
  }
};

// Show rewrite description interstitial ad
export const showRewriteInterstitial = async (): Promise<void> => {
  try {
    await AdMobInterstitial.setAdUnitID(AD_UNITS.INTERSTITIAL_REWRITE);
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    await AdMobInterstitial.showAdAsync();
  } catch (error) {
    console.error('Error showing rewrite interstitial:', error);
  }
}; 
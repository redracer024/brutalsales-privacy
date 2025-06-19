import { useState, useEffect, useCallback } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const getAdUnitId = (adUnitId: string) => (__DEV__ ? TestIds.INTERSTITIAL : adUnitId);

export function useAdManager(adUnitId: string, onAdDismissed?: () => void) {
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const loadAd = useCallback(() => {
    const ad = InterstitialAd.createForAdRequest(getAdUnitId(adUnitId), {
      requestNonPersonalizedAdsOnly: true,
    });
    setInterstitialAd(ad);
    ad.load();
  }, [adUnitId]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  useEffect(() => {
    if (!interstitialAd) {
      return;
    }

    const loadListener = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      setIsAdLoaded(true);
    });

    const errorListener = interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
      setIsAdLoaded(false);
    });

    const closeListener = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      onAdDismissed?.();
      setIsAdLoaded(false);
      loadAd(); // Pre-load the next ad
    });

    return () => {
      loadListener();
      errorListener();
      closeListener();
    };
  }, [interstitialAd, loadAd, onAdDismissed]);

  const showAd = useCallback(() => {
    if (isAdLoaded && interstitialAd) {
      interstitialAd.show();
    } else {
      onAdDismissed?.();
    }
  }, [isAdLoaded, interstitialAd, onAdDismissed]);

  return {
    isAdLoaded,
    showAd,
  };
} 
import { useState, useEffect } from 'react';

interface AdManagerConfig {
  isPremium: boolean;
  showInterstitialAfter: number; // Number of actions before showing interstitial
}

export function useAdManager(config: AdManagerConfig) {
  const [actionCount, setActionCount] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const incrementActionCount = () => {
    if (!config.isPremium) {
      setActionCount(prev => {
        const newCount = prev + 1;
        if (newCount >= config.showInterstitialAfter) {
          setShowInterstitial(true);
          return 0; // Reset counter
        }
        return newCount;
      });
    }
  };

  const hideInterstitial = () => {
    setShowInterstitial(false);
  };

  const resetCounter = () => {
    setActionCount(0);
  };

  return {
    showInterstitial,
    hideInterstitial,
    incrementActionCount,
    resetCounter,
    actionCount,
  };
}
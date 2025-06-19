import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAdManager } from '@/hooks/useAdManager';

interface InterstitialAdProps {
  adUnitId: string;
  visible: boolean;
  onAdClosed?: () => void;
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ adUnitId, visible, onAdClosed }) => {
  const { isAdLoaded, showAd } = useAdManager(adUnitId, onAdClosed);

  useEffect(() => {
    if (visible && isAdLoaded) {
      showAd();
    }
  }, [visible, isAdLoaded, showAd]);

  return null;
};

export default InterstitialAd; 
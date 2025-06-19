import React from 'react';

interface InterstitialAdProps {
  adUnitId: string;
  visible: boolean;
  onAdClosed?: () => void;
}

const InterstitialAd: React.FC<InterstitialAdProps> = () => null;

export default InterstitialAd; 
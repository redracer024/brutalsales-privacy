import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ExternalLink } from 'lucide-react-native';

interface AdBannerProps {
  isPremium?: boolean;
  onClose?: () => void;
}

export default function AdBanner({ isPremium = false, onClose }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(!isPremium);
  const [currentAd, setCurrentAd] = useState(0);

  const ads = [
    {
      title: "Upgrade to Premium",
      description: "Unlimited descriptions, no ads!",
      cta: "Upgrade Now",
      action: () => {
        // Navigate to premium screen
        console.log('Navigate to premium');
      }
    },
    {
      title: "Web Hosting Special",
      description: "Get 50% off premium hosting",
      cta: "Learn More",
      action: () => {
        Linking.openURL('https://example-hosting.com');
      }
    },
    {
      title: "AI Writing Tools",
      description: "Discover more AI-powered tools",
      cta: "Explore",
      action: () => {
        Linking.openURL('https://example-ai-tools.com');
      }
    }
  ];

  useEffect(() => {
    if (!isPremium) {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % ads.length);
      }, 10000); // Rotate ads every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isPremium, ads.length]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleAdClick = () => {
    ads[currentAd].action();
  };

  if (isPremium || !isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.adContent} onPress={handleAdClick}>
        <LinearGradient
          colors={['rgba(217, 119, 6, 0.1)', 'rgba(217, 119, 6, 0.05)']}
          style={styles.gradient}
        >
          <View style={styles.textContent}>
            <Text style={styles.adTitle}>{ads[currentAd].title}</Text>
            <Text style={styles.adDescription}>{ads[currentAd].description}</Text>
          </View>
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>{ads[currentAd].cta}</Text>
            <ExternalLink size={16} color="#D97706" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <X size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 10, 25, 0.95)',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  adContent: {
    flex: 1,
  },
  gradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
  },
  adTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  adDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  closeButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
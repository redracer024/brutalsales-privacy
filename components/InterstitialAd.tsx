import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ExternalLink, Crown, Zap } from 'lucide-react-native';

interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  onAdDismissedAction?: () => void;
  isPremium?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function InterstitialAd({ 
  visible, 
  onClose, 
  onUpgrade,
  onAdDismissedAction,
  isPremium = false 
}: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (visible && !isPremium) {
      setCountdown(5);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, isPremium]);

  const handleClose = () => {
    if (canClose || isPremium) {
      onClose();
      // Execute the action after ad is dismissed
      if (onAdDismissedAction) {
        onAdDismissedAction();
      }
    }
  };

  const handleUpgrade = () => {
    onUpgrade?.();
    onClose();
  };

  const handleAdClick = () => {
    Linking.openURL('https://example-sponsor.com');
  };

  if (!visible || isPremium) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#0F0A19', '#1E1B4B', '#312E81']}
            style={styles.gradient}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeButton, !canClose && styles.closeButtonDisabled]}
              onPress={handleClose}
              disabled={!canClose}
            >
              {canClose ? (
                <X size={24} color="#FFFFFF" />
              ) : (
                <Text style={styles.countdownText}>{countdown}</Text>
              )}
            </TouchableOpacity>

            {/* Ad Content */}
            <View style={styles.content}>
              <View style={styles.adSection}>
                <TouchableOpacity style={styles.sponsoredAd} onPress={handleAdClick}>
                  <LinearGradient
                    colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
                    style={styles.adGradient}
                  >
                    <Zap size={32} color="#3B82F6" />
                    <Text style={styles.adTitle}>PowerHost Pro</Text>
                    <Text style={styles.adDescription}>
                      Lightning-fast web hosting with 99.9% uptime guarantee
                    </Text>
                    <View style={styles.adCta}>
                      <Text style={styles.adCtaText}>Get 50% Off</Text>
                      <ExternalLink size={16} color="#3B82F6" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                
                <Text style={styles.sponsoredLabel}>Sponsored</Text>
              </View>

              {/* Upgrade Section */}
              <View style={styles.upgradeSection}>
                <Crown size={40} color="#D97706" />
                <Text style={styles.upgradeTitle}>Tired of Ads?</Text>
                <Text style={styles.upgradeDescription}>
                  Upgrade to Premium for unlimited descriptions and an ad-free experience
                </Text>
                
                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                  <LinearGradient
                    colors={['#D97706', '#F59E0B']}
                    style={styles.upgradeGradient}
                  >
                    <Crown size={20} color="#FFFFFF" />
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonDisabled: {
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
  },
  countdownText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    marginTop: 20,
  },
  adSection: {
    marginBottom: 32,
  },
  sponsoredAd: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  adGradient: {
    padding: 20,
    alignItems: 'center',
  },
  adTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    textAlign: 'center',
    marginBottom: 16,
  },
  adCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  adCtaText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  sponsoredLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  upgradeSection: {
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 24,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
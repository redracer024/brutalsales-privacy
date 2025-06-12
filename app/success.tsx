import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown, CircleCheck as CheckCircle, Sparkles } from 'lucide-react-native';

export default function SuccessScreen() {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" />
            <Crown size={40} color="#D97706" style={styles.crownIcon} />
          </View>

          {/* Success Message */}
          <Text style={styles.title}>Welcome to Premium!</Text>
          <Text style={styles.subtitle}>
            Your upgrade was successful! You now have unlimited access to all premium features.
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="#D97706" />
              <Text style={styles.featureText}>Unlimited descriptions</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="#D97706" />
              <Text style={styles.featureText}>Ad-free experience</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="#D97706" />
              <Text style={styles.featureText}>Advanced AI models</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="#D97706" />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              style={styles.buttonGradient}
            >
              <Text style={styles.continueButtonText}>Start Creating</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Auto-redirect notice */}
          <Text style={styles.autoRedirectText}>
            You'll be automatically redirected in a few seconds...
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  crownIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  autoRedirectText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown, Edit3, FileText, Settings, Zap, Shield, HelpCircle, Lightbulb } from 'lucide-react-native';
import AdBanner from '../../components/AdBanner';
import SupportModal from '../../components/SupportModal';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useFonts } from 'expo-font';

export default function HomeScreen() {
  const { user, session, isPremium } = useAuth();
  const [fontsLoaded] = useFonts({
    'RockSalt-Regular': require('../../assets/fonts/RockSalt-Regular.ttf'),
  });

  const [dailyUsage, setDailyUsage] = useState(0);
  const [maxDaily, setMaxDaily] = useState(3);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        // Guest user settings
        setMaxDaily(3);
        setDailyUsage(0); // Or retrieve from async storage if you implement guest usage tracking
        return;
      }

      // Premium user settings
      if (isPremium) {
        setMaxDaily(999);
        setDailyUsage(0); // Or fetch actual usage if tracked for premium
        return;
      }

      // Logged-in, non-premium user
      const { data, error } = await supabase
        .from('user_settings')
        .select('daily_usage')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setDailyUsage(data.daily_usage || 0);
        setMaxDaily(3);
      }
    };

    fetchUsage();
  }, [user, isPremium]);

  const handleAction = (route: string) => {
    if (dailyUsage >= maxDaily && !isPremium) {
      Alert.alert(
        'Daily Limit Reached',
        'You have reached your daily limit. Upgrade to Premium for unlimited usage.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade to Premium', onPress: () => router.push('/(tabs)/premium') },
        ]
      );
    } else {
      router.push(route);
    }
  };

  if (!fontsLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!isPremium && <AdBanner />}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>BrutalSales</Text>
            <Text style={styles.subtitle}>AI-Powered Product Descriptions</Text>
            {!session && (
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => router.push('/(auth)/signup')}
              >
                <LinearGradient
                  colors={['#D97706', '#F59E0B']}
                  style={styles.signUpButtonGradient}
                >
                  <Text style={styles.signUpButtonText}>Sign Up Free</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Usage Card */}
          <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Daily Usage</Text>
              <Text style={styles.usageCount}>{isPremium ? 'Unlimited' : `${dailyUsage} / ${maxDaily}`}</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={[
                  styles.progressFill,
                  { width: isPremium ? '100%' : `${(dailyUsage / maxDaily) * 100}%` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Main Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => handleAction('/(tabs)/create')}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Edit3 size={32} color="#FFFFFF" />
                <Text style={styles.primaryActionTitle}>Create Description</Text>
                <Text style={styles.primaryActionSubtitle}>
                  Generate powerful sales copy from scratch
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => handleAction('/(tabs)/rewrite')}
            >
              <FileText size={24} color="#F59E0B" />
              <Text style={styles.secondaryActionText}>Rewrite Existing Text</Text>
            </TouchableOpacity>
          </View>
          
          {/* Other Features */}
          <View style={styles.featuresGrid}>
             <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/premium')}>
                <Crown size={24} color="#D97706" />
                <Text style={styles.featureText}>Go Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/features')}>
                <Zap size={24} color="#D97706" />
                <Text style={styles.featureText}>Features</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/settings')}>
                <Settings size={24} color="#D97706" />
                <Text style={styles.featureText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/terms')}>
                <Shield size={24} color="#D97706" />
                <Text style={styles.featureText}>My Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featureCard} onPress={() => setShowHelpModal(true)}>
                <HelpCircle size={24} color="#D97706" />
                <Text style={styles.featureText}>Help</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featureCard} onPress={() => setShowSupportModal(true)}>
                <Lightbulb size={24} color="#D97706" />
                <Text style={styles.featureText}>Support</Text>
              </TouchableOpacity>
          </View>
        </ScrollView>
        <SupportModal
          visible={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0A19',
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'RockSalt-Regular',
        textShadowColor: 'rgba(245, 158, 11, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#E5E7EB',
        marginTop: 4,
    },
    signUpButton: {
        marginTop: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    signUpButtonGradient: {
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    usageCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        marginHorizontal: 20,
        padding: 15,
        marginTop: 20,
    },
    usageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    usageTitle: {
        color: '#E5E7EB',
        fontSize: 16,
    },
    usageCount: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    primaryAction: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
    },
    actionGradient: {
        padding: 20,
        alignItems: 'center',
    },
    primaryActionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 10,
    },
    primaryActionSubtitle: {
        fontSize: 14,
        color: '#E5E7EB',
        marginTop: 4,
        textAlign: 'center',
    },
    secondaryAction: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryActionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    featureCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        padding: 15,
        width: '45%',
        alignItems: 'center',
        marginBottom: 15,
    },
    featureText: {
        color: '#E5E7EB',
        marginTop: 8,
        fontSize: 14,
    },
});
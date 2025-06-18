import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: March 19, 2024</Text>

            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.section}>
              By accessing or using BrutalSales ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
            </Text>

            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.section}>
              BrutalSales provides sales analytics and management tools to help businesses track, analyze, and grow their operations. The App includes both free and premium features.
            </Text>

            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.section}>
              • You must provide accurate information when creating an account{'\n'}
              • You are responsible for maintaining the security of your account{'\n'}
              • You must be at least 18 years old to use the App{'\n'}
              • You are responsible for all activities under your account
            </Text>

            <Text style={styles.sectionTitle}>4. Premium Features</Text>
            <Text style={styles.section}>
              • Premium features require an active subscription{'\n'}
              • Subscriptions are billed through Google Play Store{'\n'}
              • Prices are subject to change with notice{'\n'}
              • Refunds are handled through Google Play's refund policy
            </Text>

            <Text style={styles.sectionTitle}>5. User Conduct</Text>
            <Text style={styles.section}>
              You agree not to:{'\n'}
              • Use the App for any illegal purpose{'\n'}
              • Attempt to gain unauthorized access{'\n'}
              • Interfere with the App's operation{'\n'}
              • Share your account credentials{'\n'}
              • Use automated systems or bots
            </Text>

            <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
            <Text style={styles.section}>
              • The App and its content are protected by copyright{'\n'}
              • You may not copy, modify, or distribute the App{'\n'}
              • User-generated content remains your property
            </Text>

            <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
            <Text style={styles.section}>
              • The App is provided "as is"{'\n'}
              • We are not liable for any indirect damages{'\n'}
              • Our liability is limited to the amount paid for the service
            </Text>

            <Text style={styles.sectionTitle}>8. Contact</Text>
            <Text style={styles.section}>
              For questions about these terms, contact us at:{'\n\n'}
              support@brutalsales.app
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'EagleLake-Regular',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#A78BFA',
    marginTop: 24,
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
}); 
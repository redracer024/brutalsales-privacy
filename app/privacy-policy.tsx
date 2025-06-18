import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: March 19, 2024</Text>

            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.section}>
              BrutalSales ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your information when you use our mobile application.
            </Text>

            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.section}>
              • Personal Information: Name and email address{'\n'}
              • Financial Information: Payment details and purchase history{'\n'}
              • App Activity: Usage patterns and interactions{'\n'}
              • Device Information: Device ID and performance data
            </Text>

            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.section}>
              • To provide and maintain our service{'\n'}
              • To manage your account and subscriptions{'\n'}
              • To improve app performance and stability{'\n'}
              • To prevent fraud and ensure security
            </Text>

            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.section}>
              We implement industry-standard security measures to protect your information. All data is encrypted in transit and at rest.
            </Text>

            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.section}>
              You can:{'\n'}
              • Access your personal data{'\n'}
              • Request data deletion{'\n'}
              • Opt out of optional data collection{'\n'}
              • Contact us about privacy concerns
            </Text>

            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.section}>
              For any privacy-related questions, please contact us at:{'\n\n'}
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
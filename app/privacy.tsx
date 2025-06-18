import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1A1A1A']}
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
            <Text style={styles.lastUpdated}>Last Updated: March 15, 2024</Text>

            <Text style={styles.section}>
              At BrutalSales, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
            </Text>

            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.section}>
              • Account Information: Email address, name, and profile information{'\n'}
              • Usage Data: How you interact with our app, features used, and performance data{'\n'}
              • Device Information: Device type, operating system, and unique device identifiers{'\n'}
              • Content: Product descriptions and other content you create using our app
            </Text>

            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.section}>
              • To provide and maintain our service{'\n'}
              • To improve and personalize your experience{'\n'}
              • To communicate with you about updates and support{'\n'}
              • To analyze usage patterns and optimize our app{'\n'}
              • To protect against fraud and abuse
            </Text>

            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.section}>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.
            </Text>

            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.section}>
              You have the right to:{'\n'}
              • Access your personal data{'\n'}
              • Correct inaccurate data{'\n'}
              • Request deletion of your data{'\n'}
              • Object to data processing{'\n'}
              • Export your data
            </Text>

            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.section}>
              If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
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
    color: '#fff',
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginTop: 24,
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 16,
  },
}); 
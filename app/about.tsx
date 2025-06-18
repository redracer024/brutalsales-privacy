import { View, Text, StyleSheet, Linking, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>About BrutalSales</Text>
        <Text style={styles.description}>
          BrutalSales is your AI-powered partner for creating compelling, conversion-focused product descriptions. Our app helps you transform basic listings into engaging, persuasive content that drives sales.
        </Text>

        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>• AI-powered description generation</Text>
          <Text style={styles.featureItem}>• Multiple tone options (Professional, Friendly, Energetic, Humorous)</Text>
          <Text style={styles.featureItem}>• Rewrite existing descriptions with AI enhancement</Text>
          <Text style={styles.featureItem}>• Customizable offer acceptance settings</Text>
          <Text style={styles.featureItem}>• Premium features for power sellers</Text>
        </View>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.description}>
          We're dedicated to helping sellers create descriptions that not only inform but also engage and convert. Our AI technology ensures your listings stand out in the marketplace while maintaining authenticity and professionalism.
        </Text>

        <Text style={styles.sectionTitle}>Support</Text>
        <Text style={styles.description}>
          Need help or have suggestions? We're here to assist you in creating the perfect product descriptions. Contact us through the app's support section.
        </Text>

        <Text style={styles.text}>
          Version: 1.0.0
        </Text>
        <Text style={styles.text}>
          For support, contact us at <Text style={styles.link} onPress={() => Linking.openURL('mailto:support@brutalsales.app')}>support@brutalsales.app</Text>
        </Text>
        <Text style={styles.text}>
          Visit our website: <Text style={styles.link} onPress={() => Linking.openURL('https://brutalsales.ai')}>brutalsales.ai</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A19',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cinzel-Bold',
    marginBottom: 16,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Cinzel-Bold',
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  link: {
    color: '#D97706',
    textDecorationLine: 'underline',
  },
}); 
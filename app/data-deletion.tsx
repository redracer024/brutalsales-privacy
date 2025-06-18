import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function DataDeletionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Request Data Deletion</Text>
      <Text style={styles.text}>
        If you would like to request deletion of your account and all associated data, please use the form below. We will process your request as soon as possible.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL('https://forms.gle/your-correct-form-id')}
      >
        <Text style={styles.buttonText}>Open Data Deletion Request Form</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        If you have any questions, contact us at support@brutalsales.app
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A19',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cinzel-Bold',
    marginTop: 60,
    marginBottom: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#D97706',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  note: {
    color: '#C4B5FD',
    fontSize: 14,
    marginTop: 16,
    fontFamily: 'Inter-Regular',
  },
}); 
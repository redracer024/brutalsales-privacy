import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function DataDeletionScreen() {
  const router = useRouter();

  const handleEmailRequest = async (type: 'account' | 'data') => {
    try {
      const subject = type === 'account' 
        ? 'Account Deletion Request' 
        : 'Selective Data Deletion Request';
      
      const body = type === 'account'
        ? 'Please delete my account and all associated data.'
        : 'Please delete the following data from my account (specify which data you want deleted):\n\n- Purchase history\n- Usage data\n- Analytics data\n- Other (please specify)';
      
      const emailUrl = `mailto:support@brutalsales.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(emailUrl);
    } catch (error) {
      console.error('Error opening email client:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1A1A1A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Data Management</Text>
          
          <Text style={styles.description}>
            You can request to delete specific data or your entire account. Please choose an option below:
          </Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleEmailRequest('data')}
          >
            <Text style={styles.buttonText}>Delete Specific Data</Text>
            <Text style={styles.buttonSubtext}>Request deletion of specific data while keeping your account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleEmailRequest('account')}
          >
            <Text style={styles.buttonText}>Delete Entire Account</Text>
            <Text style={styles.buttonSubtext}>Request deletion of your account and all associated data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.backButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Back to Settings</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 'auto',
  },
}); 
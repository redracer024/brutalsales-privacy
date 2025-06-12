import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SupportModal from '@/components/SupportModal';
import { useState } from 'react';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1A1A1A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setShowSupportModal(true)}
          >
            <Text style={styles.buttonText}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/data-deletion')}
          >
            <Text style={styles.buttonText}>Request Data Deletion</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.signOutButton]}
            onPress={signOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <SupportModal
          visible={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
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
    marginBottom: 30,
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
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginTop: 'auto',
  },
});
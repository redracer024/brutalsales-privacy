import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SupportModal from '@/components/SupportModal';
import { useState } from 'react';
import { Shield, FileText, HelpCircle, Trash2, LogOut, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const openPrivacyPolicy = () => {
    router.push('/privacy');
  };

  const openTermsOfSale = () => {
    router.push('/terms');
  };

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
            <View style={styles.buttonContent}>
              <HelpCircle size={20} color="#fff" />
              <Text style={styles.buttonText}>Support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={openPrivacyPolicy}
          >
            <View style={styles.buttonContent}>
              <Shield size={20} color="#fff" />
              <Text style={styles.buttonText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={openTermsOfSale}
          >
            <View style={styles.buttonContent}>
              <FileText size={20} color="#fff" />
              <Text style={styles.buttonText}>Terms of Sale</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/data-deletion')}
          >
            <View style={styles.buttonContent}>
              <Trash2 size={20} color="#fff" />
              <Text style={styles.buttonText}>Request Data Deletion</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/about')}
          >
            <View style={styles.buttonContent}>
              <Info size={20} color="#fff" />
              <Text style={styles.buttonText}>About BrutalSales</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.signOutButton]}
            onPress={signOut}
          >
            <View style={styles.buttonContent}>
              <LogOut size={20} color="#fff" />
              <Text style={styles.buttonText}>Sign Out</Text>
            </View>
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
    fontFamily: 'Cinzel-Bold',
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
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginTop: 'auto',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
}); 
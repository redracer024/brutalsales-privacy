import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Save, FileText, Truck, RotateCcw, Shield } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';

export default function TermsScreen() {
  const [termsData, setTermsData] = useState({
    storeName: '',
    storeDescription: '',
    returnPolicy: '',
    shippingInfo: '',
    warrantyInfo: '',
    contactInfo: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isPremium] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Success!', 'Your terms of sale have been saved and will be automatically added to all future descriptions.');
    }, 1000);
  };

  const loadTemplate = () => {
    setTermsData({
      storeName: 'BrutalSales Store',
      storeDescription: 'Your trusted marketplace for quality items with exceptional service.',
      returnPolicy: '30-day return policy. Items must be in original condition. Buyer pays return shipping unless item is defective.',
      shippingInfo: 'Fast and secure shipping available. Orders processed within 1-2 business days. Tracking provided for all shipments.',
      warrantyInfo: 'All items come with standard manufacturer warranty unless otherwise specified. Extended warranties available upon request.',
      contactInfo: 'Questions? Contact us at support@brutalsales.com or call 1-800-BRUTAL1. We\'re here to help!',
    });
    Alert.alert('Template Loaded', 'Default template has been loaded. Feel free to customize as needed.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        {/* Ad Banner */}
        <AdBanner isPremium={isPremium} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <FileText size={32} color="#D97706" />
            <Text style={styles.title}>Terms of Sale</Text>
            <Text style={styles.subtitle}>
              Set up your standard terms that will be automatically added to all descriptions
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.templateButton} onPress={loadTemplate}>
              <Text style={styles.templateButtonText}>Load Template</Text>
            </TouchableOpacity>
          </View>

          {/* Form Sections */}
          <View style={styles.formContainer}>
            {/* Store Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={20} color="#D97706" />
                <Text style={styles.sectionTitle}>Store Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Store Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={termsData.storeName}
                  onChangeText={(text) => setTermsData({ ...termsData, storeName: text })}
                  placeholder="Your store or business name"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Store Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={termsData.storeDescription}
                  onChangeText={(text) => setTermsData({ ...termsData, storeDescription: text })}
                  placeholder="Brief description of your store and what makes it special"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Return Policy */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <RotateCcw size={20} color="#D97706" />
                <Text style={styles.sectionTitle}>Return Policy</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Return Terms</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={termsData.returnPolicy}
                  onChangeText={(text) => setTermsData({ ...termsData, returnPolicy: text })}
                  placeholder="Describe your return policy, time limits, conditions, etc."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Shipping Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Truck size={20} color="#D97706" />
                <Text style={styles.sectionTitle}>Shipping Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shipping Details</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={termsData.shippingInfo}
                  onChangeText={(text) => setTermsData({ ...termsData, shippingInfo: text })}
                  placeholder="Shipping methods, timeframes, costs, packaging details, etc."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Warranty Information */}
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Warranty & Guarantees</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={termsData.warrantyInfo}
                  onChangeText={(text) => setTermsData({ ...termsData, warrantyInfo: text })}
                  placeholder="Warranty information, guarantees, quality assurance details"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Information</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={termsData.contactInfo}
                  onChangeText={(text) => setTermsData({ ...termsData, contactInfo: text })}
                  placeholder="How customers can reach you for questions or support"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              style={styles.buttonGradient}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Terms of Sale'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <Text style={styles.previewSubtitle}>
              This is how your terms will appear at the end of each description:
            </Text>
            
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>
                {`---
📊 TERMS OF SALE

🏪 ${termsData.storeName || '[Store Name]'}
${termsData.storeDescription || '[Store Description]'}

↩️ RETURNS: ${termsData.returnPolicy || '[Return Policy]'}

🚚 SHIPPING: ${termsData.shippingInfo || '[Shipping Information]'}

🛡️ WARRANTY: ${termsData.warrantyInfo || '[Warranty Information]'}

📞 CONTACT: ${termsData.contactInfo || '[Contact Information]'}`}
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#A78BFA',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  templateButton: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  templateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  formContainer: {
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#C4B5FD',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#A78BFA',
    marginBottom: 16,
  },
  previewBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 18,
  },
});
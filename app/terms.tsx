import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Save, FileText, Truck, RotateCcw, Shield, ArrowLeft, Zap } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TermsScreen() {
  const [terms, setTerms] = useState({
    storeName: '',
    storeDescription: '',
    returnPolicy: 'All sales are final unless the item is defective.',
    shippingInfo: 'Standard shipping within 2-5 business days.',
    warrantyInfo: '30-day limited warranty covering manufacturing defects.',
    contactInfo: 'Contact us via email or through our website.',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load terms on mount
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Logged-in user – fetch from Supabase
          const { data: termsData, error } = await supabase
            .from('user_terms')
            .select(
              'store_name, store_description, return_policy, shipping_info, warranty_info, contact_info'
            )
            .eq('user_id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          if (termsData) {
            setTerms({
              storeName: termsData.store_name || '',
              storeDescription: termsData.store_description || '',
              returnPolicy: termsData.return_policy || '',
              shippingInfo: termsData.shipping_info || '',
              warrantyInfo: termsData.warranty_info || '',
              contactInfo: termsData.contact_info || '',
            });
            return;
          }
        } else {
          // Guest mode – load from AsyncStorage if available
          const stored = await AsyncStorage.getItem('guest_terms');
          if (stored) {
            const parsed = JSON.parse(stored);
            setTerms({
              storeName: parsed.store_name || '',
              storeDescription: parsed.store_description || '',
              returnPolicy: parsed.return_policy || '',
              shippingInfo: parsed.shipping_info || '',
              warrantyInfo: parsed.warranty_info || '',
              contactInfo: parsed.contact_info || '',
            });
            return;
          }
        }

        // Fallback to defaults
        setDefaultTerms();
      } catch (e) {
        console.error('Error loading terms:', e);
        setDefaultTerms();
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, []);

  const setDefaultTerms = () => {
    setTerms({
      storeName: '',
      storeDescription: '',
      returnPolicy: 'All sales are final unless the item is defective.',
      shippingInfo: 'Standard shipping within 2-5 business days.',
      warrantyInfo: '30-day limited warranty covering manufacturing defects.',
      contactInfo: 'Contact us via email or through our website.',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        await saveGuestTerms(terms);
        return;
      }

      await saveUserTerms(session.user.id, terms);
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveGuestTerms = async (terms: any) => {
    try {
      const guestTerms = {
        store_name: terms.storeName,
        store_description: terms.storeDescription,
        return_policy: terms.returnPolicy,
        shipping_info: terms.shippingInfo,
        warranty_info: terms.warrantyInfo,
        contact_info: terms.contactInfo,
        terms_text: formatPreview(),
        created_at: new Date().toISOString()
      };
      await AsyncStorage.setItem('guest_terms', JSON.stringify(guestTerms));
      Alert.alert('Success', 'Terms saved in guest mode');
    } catch (storageError) {
      Alert.alert('Error', 'Failed to save terms in guest mode');
    }
  };

  const saveUserTerms = async (userId: any, terms: any) => {
    const { error: upsertError } = await supabase
      .from('user_terms')
      .upsert({
        user_id: userId,
        store_name: terms.storeName,
        store_description: terms.storeDescription,
        return_policy: terms.returnPolicy,
        shipping_info: terms.shippingInfo,
        warranty_info: terms.warrantyInfo,
        contact_info: terms.contactInfo,
        terms_text: formatPreview(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      Alert.alert('Error', 'Failed to save terms. Please try again.');
      return;
    }

    Alert.alert('Success', 'Terms saved successfully');
  };

  const formatPreview = () => {
    const sections = [];
    if (terms.storeName) sections.push(`Seller: ${terms.storeName}`);
    if (terms.storeDescription) sections.push(terms.storeDescription);
    if (terms.returnPolicy) sections.push(`Returns: ${terms.returnPolicy}`);
    if (terms.shippingInfo) sections.push(`Shipping: ${terms.shippingInfo}`);
    if (terms.warrantyInfo) sections.push(`Warranty: ${terms.warrantyInfo}`);
    if (terms.contactInfo) sections.push(`Contact: ${terms.contactInfo}`);
    return sections.join('\n\n');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0A19', '#1E1B4B', '#312E81']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Sale</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.description}>
              Set up your standard terms that will be automatically added to all your product descriptions
            </Text>

            {/* Preview Toggle */}
            <TouchableOpacity 
              style={styles.previewButton} 
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={styles.buttonText}>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Text>
            </TouchableOpacity>

            {/* Preview */}
            {showPreview && (
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>{formatPreview()}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Store Name</Text>
                <TextInput
                  style={styles.input}
                  value={terms.storeName}
                  onChangeText={(text) => setTerms(prev => ({ ...prev, storeName: text }))}
                  placeholder="Your store name"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Store Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={terms.storeDescription}
                  onChangeText={(text) => setTerms(prev => ({ ...prev, storeDescription: text }))}
                  placeholder="Brief description of your store"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Return Policy</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={terms.returnPolicy}
                  onChangeText={(text) => setTerms(prev => ({ ...prev, returnPolicy: text }))}
                  placeholder="Your return policy"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Shipping Information</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={terms.shippingInfo}
                  onChangeText={(text) => setTerms(prev => ({ ...prev, shippingInfo: text }))}
                  placeholder="Your shipping information"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Warranty Information</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={terms.warrantyInfo}
                  onChangeText={(text) => setTerms(prev => ({ ...prev, warrantyInfo: text }))}
                  placeholder="Your warranty information"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Contact Information</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={terms.contactInfo}
                  onChangeText={(text) => setTerms(prev => ({ ...prev, contactInfo: text }))}
                  placeholder="Your contact information"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Save size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save Terms'}
            </Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: '#D97706',
    fontFamily: 'EagleLake-Regular',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  previewButton: {
    backgroundColor: '#1E1B4B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#D97706',
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
  },
  input: {
    backgroundColor: 'rgba(15, 10, 25, 0.8)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(49, 46, 129, 0.5)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bottomNav: {
    padding: 16,
    backgroundColor: 'rgba(15, 10, 25, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(49, 46, 129, 0.5)',
  },
  saveButton: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
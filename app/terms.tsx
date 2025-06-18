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

  // Load terms on mount
  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      // First try to load from AsyncStorage (guest mode)
      const guestTerms = await AsyncStorage.getItem('guest_terms');
      if (guestTerms) {
        const parsedTerms = JSON.parse(guestTerms);
        setTerms({
          storeName: parsedTerms.store_name || '',
          storeDescription: parsedTerms.store_description || '',
          returnPolicy: parsedTerms.return_policy || terms.returnPolicy,
          shippingInfo: parsedTerms.shipping_info || terms.shippingInfo,
          warrantyInfo: parsedTerms.warranty_info || terms.warrantyInfo,
          contactInfo: parsedTerms.contact_info || terms.contactInfo,
        });
        return;
      }

      // If no guest terms, try to load from database
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }

      if (!session?.user) {
        console.log('No active session - using default terms');
        return;
      }

      const { data, error } = await supabase
        .from('user_terms')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No existing terms found for user');
        } else {
          console.error('Error loading terms:', error);
          Alert.alert('Error', 'Failed to load your saved terms. Using default values.');
        }
        return;
      }

      if (data) {
        setTerms({
          storeName: data.store_name || '',
          storeDescription: data.store_description || '',
          returnPolicy: data.return_policy || terms.returnPolicy,
          shippingInfo: data.shipping_info || terms.shippingInfo,
          warrantyInfo: data.warranty_info || terms.warrantyInfo,
          contactInfo: data.contact_info || terms.contactInfo,
        });
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your terms.');
    }
  };

  const handleSave = async () => {
    console.log('🔍 Save button pressed - debugging session...')
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('📊 Session data:', JSON.stringify(session, null, 2))
      
      if (!session?.user) {
        console.log('❌ No active session - saving in guest mode')
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
          console.error('Error saving guest terms:', storageError);
          Alert.alert('Error', 'Failed to save terms in guest mode');
        }
        return;
      }

      // User is logged in, save to database
      const { error: upsertError } = await supabase
        .from('user_terms')
        .upsert({
          user_id: session.user.id,
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
        console.error('Error saving terms:', upsertError);
        Alert.alert('Error', 'Failed to save terms. Please try again.');
        return;
      }

      Alert.alert('Success', 'Terms saved successfully');
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
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
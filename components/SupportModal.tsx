import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  MessageCircle, 
  Bug, 
  Star, 
  Mail, 
  ExternalLink,
  Send
} from 'lucide-react-native';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SupportModal({ visible, onClose }: SupportModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportTypes = [
    {
      id: 'bug',
      title: 'Report a Bug',
      description: 'Found something that\'s not working?',
      icon: Bug,
      color: '#EF4444',
    },
    {
      id: 'feature',
      title: 'Feature Request',
      description: 'Suggest a new feature or improvement',
      icon: MessageCircle,
      color: '#3B82F6',
    },
    {
      id: 'rating',
      title: 'Rate the App',
      description: 'Love the app? Leave us a review!',
      icon: Star,
      color: '#F59E0B',
    },
    {
      id: 'general',
      title: 'General Support',
      description: 'Need help with something else?',
      icon: Mail,
      color: '#10B981',
    },
  ];

  const handleTypeSelect = (type: string) => {
    if (type === 'rating') {
      // Open app store for rating
      Alert.alert(
        'Rate BrutalSales',
        'Thank you for wanting to rate our app! This will open your app store.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Rate Now', 
            onPress: () => {
              // In production, use the actual app store URLs
              const appStoreUrl = 'https://apps.apple.com/app/brutalsales';
              const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.brutalsales';
              
              // For now, just show a placeholder
              Alert.alert('Thank you!', 'App store integration will be available in production.');
              onClose();
            }
          }
        ]
      );
      return;
    }
    
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!selectedType || !message.trim()) {
      Alert.alert('Missing Information', 'Please select a type and enter your message.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Message Sent!',
        'Thank you for your feedback. We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: onClose }]
      );
      
      // Reset form
      setSelectedType('');
      setMessage('');
      setEmail('');
    }, 2000);
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('BrutalSales Support Request');
    const body = encodeURIComponent('Hi BrutalSales team,\n\nI need help with:\n\n');
    Linking.openURL(`mailto:support@brutalsales.com?subject=${subject}&body=${body}`);
  };

  const renderTypeSelection = () => (
    <View style={styles.typeSelection}>
      <Text style={styles.sectionTitle}>How can we help you?</Text>
      
      {supportTypes.map((type) => {
        const IconComponent = type.icon;
        
        return (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeOption,
              selectedType === type.id && styles.typeOptionSelected,
            ]}
            onPress={() => handleTypeSelect(type.id)}
          >
            <IconComponent size={24} color={type.color} />
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>{type.title}</Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
            <ExternalLink size={16} color="#6B7280" />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.emailOption} onPress={handleEmailSupport}>
        <Mail size={20} color="#D97706" />
        <Text style={styles.emailOptionText}>Or email us directly</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMessageForm = () => (
    <View style={styles.messageForm}>
      <TouchableOpacity style={styles.backButton} onPress={() => setSelectedType('')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        {supportTypes.find(t => t.id === selectedType)?.title}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Your Email (optional)</Text>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor="#6B7280"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Message *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Please describe your issue or feedback in detail..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <LinearGradient
          colors={['#D97706', '#F59E0B']}
          style={styles.submitGradient}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#0F0A19', '#1E1B4B', '#312E81']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Support & Feedback</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {selectedType ? renderMessageForm() : renderTypeSelection()}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cinzel-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  typeSelection: {},
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderColor: '#D97706',
  },
  typeContent: {
    flex: 1,
    marginLeft: 12,
  },
  typeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C4B5FD',
  },
  emailOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  emailOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginLeft: 8,
  },
  messageForm: {},
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
  },
  inputGroup: {
    marginBottom: 20,
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
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
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
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
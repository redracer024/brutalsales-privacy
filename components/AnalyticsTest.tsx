import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { analyticsService, ANALYTICS_EVENTS } from '../lib/analytics';
import { crashlytics } from '../lib/firebase';

export default function AnalyticsTest() {
  const testAnalytics = async () => {
    try {
      // Test analytics collection enabled
      await analyticsService.setAnalyticsCollectionEnabled(true);
      console.log('✅ Analytics collection enabled');

      // Test screen view
      await analyticsService.logScreenView('AnalyticsTest');
      console.log('✅ Screen view logged');

      // Test basic event
      await analyticsService.logEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
        button_name: 'test_button',
        screen_name: 'AnalyticsTest',
        action_result: 'success'
      });
      console.log('✅ Button click event logged');

      // Test purchase flow events
      await analyticsService.logEvent(ANALYTICS_EVENTS.PURCHASE_INITIATED, {
        productId: 'test_product',
        price: 9.99,
        currency: 'USD',
        payment_method: 'stripe'
      });
      console.log('✅ Purchase initiated event logged');

      await analyticsService.logEvent(ANALYTICS_EVENTS.PURCHASE_COMPLETED, {
        productId: 'test_product',
        transactionId: 'test_transaction',
        price: 9.99,
        currency: 'USD',
        payment_method: 'stripe',
        success: true
      });
      console.log('✅ Purchase completed event logged');

      // Test user properties
      await analyticsService.setUserProperties({
        user_type: 'tester',
        test_device: 'true',
        subscription_tier: 'premium'
      });
      console.log('✅ User properties set');

      // Test user ID
      await analyticsService.setUserId('test_user_123');
      console.log('✅ User ID set');

      // Test error logging
      await analyticsService.logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_type: 'test_error',
        error_message: 'This is a test error',
        component_name: 'AnalyticsTest'
      });
      console.log('✅ Error event logged');

      // Test feature usage
      await analyticsService.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
        feature_name: 'analytics_test',
        duration_ms: 1500,
        success: true
      });
      console.log('✅ Feature usage logged');

      // Test Crashlytics
      await crashlytics.log('Testing crashlytics logging');
      await crashlytics.setAttribute('test_run', 'true');
      console.log('✅ Crashlytics logging tested');

      console.log('✅ All analytics tests completed successfully');
    } catch (error) {
      console.error('❌ Analytics test failed:', error);
    }
  };

  const testCrash = () => {
    crashlytics.log('Testing crash reporting');
    crashlytics.crash();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics Test Panel</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={testAnalytics}
      >
        <Text style={styles.buttonText}>Run Analytics Tests</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.crashButton]}
        onPress={testCrash}
      >
        <Text style={styles.buttonText}>Test Crash Reporting</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Check the console for test results and Firebase Console for events
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  crashButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 
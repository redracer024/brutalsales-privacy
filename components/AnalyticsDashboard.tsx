import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ANALYTICS_EVENTS } from '../lib/analytics';

interface AnalyticsEvent {
  timestamp: number;
  eventName: string;
  params?: any;
}

// Singleton event bus for real-time analytics
class AnalyticsEventBus {
  private static instance: AnalyticsEventBus;
  private listeners: ((event: AnalyticsEvent) => void)[] = [];

  static getInstance() {
    if (!AnalyticsEventBus.instance) {
      AnalyticsEventBus.instance = new AnalyticsEventBus();
    }
    return AnalyticsEventBus.instance;
  }

  addListener(callback: (event: AnalyticsEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit(event: AnalyticsEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const analyticsEventBus = AnalyticsEventBus.getInstance();

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = analyticsEventBus.addListener((event) => {
      setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
    });

    return () => unsubscribe();
  }, []);

  const clearEvents = () => setEvents([]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatParams = (params: any) => {
    if (!params) return '';
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity 
        style={styles.minimizedContainer}
        onPress={() => setIsExpanded(true)}
      >
        <Text style={styles.minimizedText}>
          📊 Analytics ({events.length} events)
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Real-time Analytics</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={clearEvents} style={styles.clearButton}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.minimizeButton}>
            <Text style={styles.buttonText}>Minimize</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.eventList}>
        {events.map((event, index) => (
          <View key={index} style={styles.eventItem}>
            <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
            <Text style={styles.eventName}>{event.eventName}</Text>
            <Text style={styles.eventParams}>{formatParams(event.params)}</Text>
          </View>
        ))}
        {events.length === 0 && (
          <Text style={styles.noEvents}>No events recorded yet</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 300,
    height: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 12,
    zIndex: 1000,
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  minimizedText: {
    color: 'white',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#DB4437',
    padding: 6,
    borderRadius: 4,
  },
  minimizeButton: {
    backgroundColor: '#4285F4',
    padding: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  eventList: {
    flex: 1,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventTime: {
    color: '#888',
    fontSize: 12,
  },
  eventName: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  eventParams: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  noEvents: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 
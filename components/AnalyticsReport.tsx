import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { analyticsEventBus } from './AnalyticsDashboard';
import { experimentManager } from '../lib/experiments';
import { performanceMonitor } from '../lib/performance';
import AnalyticsCharts from './AnalyticsCharts';

interface AnalyticsEvent {
  timestamp: number;
  eventName: string;
  params?: any;
}

interface MetricSummary {
  count: number;
  avgDuration?: number;
  successRate: number;
  lastOccurrence: number;
}

interface ExperimentSummary {
  id: string;
  name: string;
  variants: {
    [key: string]: {
      impressions: number;
      conversions: number;
      conversionRate: number;
    }
  }
}

export default function AnalyticsReport() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [metrics, setMetrics] = useState<Record<string, MetricSummary>>({});
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedTab, setSelectedTab] = useState<'events' | 'performance' | 'experiments'>('events');
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');

  useEffect(() => {
    const unsubscribe = analyticsEventBus.addListener((event) => {
      setEvents(prev => [event, ...prev].slice(0, 1000)); // Keep last 1000 events
      updateMetrics(event);
    });

    return () => unsubscribe();
  }, []);

  const updateMetrics = (event: AnalyticsEvent) => {
    setMetrics(prev => {
      const metric = prev[event.eventName] || {
        count: 0,
        avgDuration: 0,
        successRate: 0,
        lastOccurrence: 0
      };

      const duration = event.params?.duration_ms;
      const success = event.params?.success;

      return {
        ...prev,
        [event.eventName]: {
          count: metric.count + 1,
          avgDuration: duration
            ? (metric.avgDuration! * metric.count + duration) / (metric.count + 1)
            : metric.avgDuration,
          successRate: success !== undefined
            ? (metric.successRate * metric.count + (success ? 1 : 0)) / (metric.count + 1)
            : metric.successRate,
          lastOccurrence: event.timestamp
        }
      };
    });
  };

  const updateExperiments = () => {
    const summaries: ExperimentSummary[] = [];
    const experiments = ['button_color', 'pricing_display']; // Add your experiment IDs here

    experiments.forEach(id => {
      const results = experimentManager.getResults(id);
      const summary: ExperimentSummary = {
        id,
        name: id, // You might want to store experiment names somewhere
        variants: {}
      };

      results.forEach(result => {
        if (!summary.variants[result.variant]) {
          summary.variants[result.variant] = {
            impressions: 0,
            conversions: 0,
            conversionRate: 0
          };
        }
        summary.variants[result.variant].impressions++;
      });

      // Calculate conversion rates
      Object.values(summary.variants).forEach(variant => {
        variant.conversionRate = variant.conversions / variant.impressions || 0;
      });

      summaries.push(summary);
    });

    setExperiments(summaries);
  };

  const filterEventsByTime = () => {
    const now = Date.now();
    const ranges = {
      hour: now - 3600000,
      day: now - 86400000,
      week: now - 604800000
    };
    return events.filter(event => event.timestamp >= ranges[timeRange]);
  };

  const renderEventsList = () => {
    const filteredEvents = filterEventsByTime();
    return (
      <ScrollView style={styles.section}>
        <AnalyticsCharts events={filteredEvents} timeRange={timeRange} />
        <Text style={styles.sectionTitle}>Events ({filteredEvents.length})</Text>
        {filteredEvents.map((event, index) => (
          <View key={index} style={styles.eventItem}>
            <Text style={styles.eventTime}>
              {new Date(event.timestamp).toLocaleString()}
            </Text>
            <Text style={styles.eventName}>{event.eventName}</Text>
            <Text style={styles.eventParams}>
              {JSON.stringify(event.params, null, 2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderPerformanceMetrics = () => {
    return (
      <ScrollView style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        {Object.entries(metrics).map(([name, metric]) => (
          <View key={name} style={styles.metricItem}>
            <Text style={styles.metricName}>{name}</Text>
            <View style={styles.metricDetails}>
              <Text>Count: {metric.count}</Text>
              {metric.avgDuration && (
                <Text>Avg Duration: {metric.avgDuration.toFixed(2)}ms</Text>
              )}
              <Text>Success Rate: {(metric.successRate * 100).toFixed(1)}%</Text>
              <Text>Last: {new Date(metric.lastOccurrence).toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderExperiments = () => {
    return (
      <ScrollView style={styles.section}>
        <Text style={styles.sectionTitle}>A/B Test Results</Text>
        {experiments.map(experiment => (
          <View key={experiment.id} style={styles.experimentItem}>
            <Text style={styles.experimentName}>{experiment.name}</Text>
            {Object.entries(experiment.variants).map(([variant, stats]) => (
              <View key={variant} style={styles.variantItem}>
                <Text style={styles.variantName}>{variant}</Text>
                <Text>Impressions: {stats.impressions}</Text>
                <Text>Conversions: {stats.conversions}</Text>
                <Text>
                  Conversion Rate: {(stats.conversionRate * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Report</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'events' && styles.selectedTab]}
            onPress={() => setSelectedTab('events')}
          >
            <Text style={styles.tabText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'performance' && styles.selectedTab]}
            onPress={() => setSelectedTab('performance')}
          >
            <Text style={styles.tabText}>Performance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'experiments' && styles.selectedTab]}
            onPress={() => setSelectedTab('experiments')}
          >
            <Text style={styles.tabText}>Experiments</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeRange}>
          <TouchableOpacity
            style={[styles.timeButton, timeRange === 'hour' && styles.selectedTime]}
            onPress={() => setTimeRange('hour')}
          >
            <Text style={styles.timeText}>1H</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, timeRange === 'day' && styles.selectedTime]}
            onPress={() => setTimeRange('day')}
          >
            <Text style={styles.timeText}>24H</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, timeRange === 'week' && styles.selectedTime]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={styles.timeText}>7D</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'events' && renderEventsList()}
      {selectedTab === 'performance' && renderPerformanceMetrics()}
      {selectedTab === 'experiments' && renderExperiments()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  selectedTab: {
    backgroundColor: '#4285F4',
  },
  tabText: {
    color: '#000',
    fontWeight: '500',
  },
  timeRange: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
  },
  selectedTime: {
    backgroundColor: '#4285F4',
  },
  timeText: {
    color: '#000',
  },
  section: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  eventTime: {
    color: '#6c757d',
    fontSize: 12,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 5,
  },
  eventParams: {
    color: '#495057',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  metricItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderRadius: 5,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  metricDetails: {
    marginLeft: 10,
  },
  experimentItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
    borderRadius: 5,
  },
  experimentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  variantItem: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 5,
    borderRadius: 3,
  },
  variantName: {
    fontWeight: '500',
    marginBottom: 5,
  },
}); 
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface AnalyticsEvent {
  timestamp: number;
  eventName: string;
  params?: any;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}

interface AnalyticsChartsProps {
  events: AnalyticsEvent[];
  timeRange: 'hour' | 'day' | 'week';
}

export default function AnalyticsCharts({ events, timeRange }: AnalyticsChartsProps) {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const getTimeLabels = () => {
    const now = new Date();
    const labels: string[] = [];
    
    switch (timeRange) {
      case 'hour':
        for (let i = 0; i < 12; i++) {
          labels.unshift(new Date(now.getTime() - i * 5 * 60000).getMinutes().toString());
        }
        break;
      case 'day':
        for (let i = 0; i < 12; i++) {
          labels.unshift(new Date(now.getTime() - i * 2 * 3600000).getHours().toString());
        }
        break;
      case 'week':
        for (let i = 0; i < 7; i++) {
          const date = new Date(now.getTime() - i * 86400000);
          labels.unshift(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
    }
    
    return labels;
  };

  const eventCountData = useMemo(() => {
    const labels = getTimeLabels();
    const data: number[] = new Array(labels.length).fill(0);
    const interval = timeRange === 'hour' ? 300000 : timeRange === 'day' ? 7200000 : 86400000;
    const now = Date.now();

    events.forEach(event => {
      const timeDiff = now - event.timestamp;
      const index = Math.floor(timeDiff / interval);
      if (index >= 0 && index < data.length) {
        data[index]++;
      }
    });

    return {
      labels,
      datasets: [{ data }],
    };
  }, [events, timeRange]);

  const eventTypeData = useMemo(() => {
    const eventCounts = new Map<string, number>();
    events.forEach(event => {
      eventCounts.set(event.eventName, (eventCounts.get(event.eventName) || 0) + 1);
    });

    const sortedEvents = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedEvents.map(([name]) => name),
      datasets: [{
        data: sortedEvents.map(([_, count]) => count),
      }],
    };
  }, [events]);

  const successRateData = useMemo(() => {
    const successCounts = new Map<string, { success: number; total: number }>();
    
    events.forEach(event => {
      if (event.params?.success !== undefined) {
        const current = successCounts.get(event.eventName) || { success: 0, total: 0 };
        successCounts.set(event.eventName, {
          success: current.success + (event.params.success ? 1 : 0),
          total: current.total + 1,
        });
      }
    });

    const data = Array.from(successCounts.entries())
      .map(([name, counts]) => ({
        name,
        rate: (counts.success / counts.total) * 100,
        color: `rgba(66, 133, 244, ${0.5 + (counts.success / counts.total) * 0.5})`,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    return data;
  }, [events]);

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <Text style={styles.chartTitle}>Event Frequency</Text>
        <LineChart
          data={eventCountData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
      </View>

      <View style={styles.chart}>
        <Text style={styles.chartTitle}>Top Events</Text>
        <BarChart
          data={eventTypeData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chartStyle}
          showValuesOnTopOfBars
        />
      </View>

      <View style={styles.chart}>
        <Text style={styles.chartTitle}>Success Rates</Text>
        <PieChart
          data={successRateData.map(item => ({
            name: item.name,
            population: item.rate,
            color: item.color,
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
          }))}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  chart: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 
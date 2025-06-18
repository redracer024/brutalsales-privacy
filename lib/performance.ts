import { Platform } from 'react-native';
import { analyticsService, ANALYTICS_EVENTS } from './analytics';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly SLOW_THRESHOLD_MS = 1000; // 1 second

  // Start tracking a performance metric
  startTrace(name: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata
    };
    this.metrics.set(name, metric);
    return name;
  }

  // End tracking a performance metric
  endTrace(name: string, additionalMetadata?: Record<string, any>) {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No performance metric found for name: ${name}`);
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.metadata = {
      ...metric.metadata,
      ...additionalMetadata,
      platform: Platform.OS,
      version: Platform.Version,
    };

    // Log performance data to analytics
    analyticsService.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature_name: `perf_${name}`,
      duration_ms: metric.duration,
      success: metric.duration < this.SLOW_THRESHOLD_MS,
      ...metric.metadata
    });

    // Clear the metric
    this.metrics.delete(name);

    return metric;
  }

  // Track a function's execution time
  async trackFunction<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTrace(name, metadata);
    try {
      const result = await fn();
      this.endTrace(name, { success: true });
      return result;
    } catch (error) {
      this.endTrace(name, { 
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Track component render time
  trackRender(componentName: string) {
    const traceName = `render_${componentName}`;
    this.startTrace(traceName, { component: componentName });
    
    return () => {
      this.endTrace(traceName);
    };
  }

  // Track API call performance
  async trackApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const traceName = `api_${endpoint}`;
    this.startTrace(traceName, { endpoint });

    try {
      const response = await apiCall();
      this.endTrace(traceName, { 
        success: true,
        status: 'success'
      });
      return response;
    } catch (error) {
      this.endTrace(traceName, { 
        success: false,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Track memory usage
  trackMemoryUsage(componentName: string) {
    if (Platform.OS === 'web') {
      const memory = (performance as any).memory;
      if (memory) {
        analyticsService.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
          feature_name: 'memory_usage',
          component_name: componentName,
          used_js_heap_size: memory.usedJSHeapSize,
          total_js_heap_size: memory.totalJSHeapSize,
          js_heap_size_limit: memory.jsHeapSizeLimit
        });
      }
    }
  }

  // Track frame rate
  trackFrameRate(duration: number = 1000) {
    let frames = 0;
    const startTime = Date.now();
    
    const frame = () => {
      frames++;
      const currentTime = Date.now();
      
      if (currentTime - startTime >= duration) {
        const fps = Math.round(frames * 1000 / duration);
        analyticsService.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
          feature_name: 'frame_rate',
          fps,
          duration_ms: duration
        });
        return;
      }
      
      requestAnimationFrame(frame);
    };
    
    requestAnimationFrame(frame);
  }
}

export const performanceMonitor = new PerformanceMonitor(); 
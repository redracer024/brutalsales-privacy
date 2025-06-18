import { analyticsService, ANALYTICS_EVENTS } from './analytics';

interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[];
  defaultVariant: string;
}

interface ExperimentResult {
  experimentId: string;
  variant: string;
  timestamp: number;
  userId?: string;
}

class ExperimentManager {
  private experiments: Map<string, Experiment> = new Map();
  private results: Map<string, ExperimentResult> = new Map();
  private userSegments: Map<string, string[]> = new Map();

  // Register a new experiment
  registerExperiment(experiment: Experiment) {
    // Validate weights if provided
    if (experiment.weights) {
      if (experiment.weights.length !== experiment.variants.length) {
        throw new Error('Number of weights must match number of variants');
      }
      if (Math.abs(experiment.weights.reduce((a, b) => a + b, 0) - 1) > 0.0001) {
        throw new Error('Weights must sum to 1');
      }
    }

    this.experiments.set(experiment.id, experiment);
  }

  // Get variant for a user
  getVariant(experimentId: string, userId?: string): string {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Check if user already has a variant assigned
    const existingResult = this.results.get(`${experimentId}_${userId}`);
    if (existingResult) {
      return existingResult.variant;
    }

    // Check if user is in a specific segment
    if (userId && this.userSegments.has(experimentId)) {
      const segments = this.userSegments.get(experimentId)!;
      if (segments.includes(userId)) {
        return experiment.variants[0]; // First variant for segmented users
      }
    }

    // Randomly assign variant based on weights
    let variant: string;
    if (experiment.weights) {
      const random = Math.random();
      let sum = 0;
      variant = experiment.defaultVariant;
      
      for (let i = 0; i < experiment.weights.length; i++) {
        sum += experiment.weights[i];
        if (random <= sum) {
          variant = experiment.variants[i];
          break;
        }
      }
    } else {
      // Equal distribution if no weights provided
      const random = Math.floor(Math.random() * experiment.variants.length);
      variant = experiment.variants[random];
    }

    // Store the result
    const result: ExperimentResult = {
      experimentId,
      variant,
      timestamp: Date.now(),
      userId
    };
    this.results.set(`${experimentId}_${userId}`, result);

    // Log the experiment exposure
    analyticsService.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature_name: `experiment_${experimentId}`,
      success: true,
      variant,
      user_id: userId
    });

    return variant;
  }

  // Add users to a specific segment
  addToSegment(experimentId: string, userIds: string[]) {
    const currentSegment = this.userSegments.get(experimentId) || [];
    this.userSegments.set(experimentId, [...new Set([...currentSegment, ...userIds])]);
  }

  // Track experiment conversion
  trackConversion(experimentId: string, userId?: string, metadata?: Record<string, any>) {
    const result = this.results.get(`${experimentId}_${userId}`);
    if (!result) {
      console.warn(`No experiment result found for ${experimentId} and user ${userId}`);
      return;
    }

    analyticsService.logEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature_name: `experiment_conversion_${experimentId}`,
      success: true,
      variant: result.variant,
      user_id: userId,
      ...metadata
    });
  }

  // Get experiment results
  getResults(experimentId: string): ExperimentResult[] {
    return Array.from(this.results.values())
      .filter(result => result.experimentId === experimentId);
  }

  // Clear experiment results
  clearResults(experimentId: string) {
    for (const [key, value] of this.results.entries()) {
      if (value.experimentId === experimentId) {
        this.results.delete(key);
      }
    }
  }
}

export const experimentManager = new ExperimentManager();

// Example experiments
experimentManager.registerExperiment({
  id: 'button_color',
  name: 'Button Color Test',
  variants: ['blue', 'green', 'red'],
  weights: [0.4, 0.4, 0.2], // 40% blue, 40% green, 20% red
  defaultVariant: 'blue'
});

experimentManager.registerExperiment({
  id: 'pricing_display',
  name: 'Pricing Display Test',
  variants: ['monthly_first', 'annual_first'],
  defaultVariant: 'monthly_first'
}); 
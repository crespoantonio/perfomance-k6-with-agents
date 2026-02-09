/**
 * Main Test Configuration
 * Central configuration for k6 test options
 */

import { Options } from 'k6/options';
import { getCurrentEnvironment } from './environments';
import { defaultThresholds, getThresholdsForEnvironment } from './thresholds';

/**
 * Base configuration shared across all test types
 */
export const baseOptions: Partial<Options> = {
  // Enable HTTP debugging if needed
  // httpDebug: 'full',
  
  // User agent
  userAgent: 'k6-performance-tests/1.0',
  
  // Batch requests to improve performance
  batch: 20,
  batchPerHost: 6,
  
  // Connection settings
  noConnectionReuse: false,
  noVUConnectionReuse: false,
  
  // Tags applied to all requests
  tags: {
    testType: 'performance',
    environment: __ENV.ENV || 'prod',
  },
  
  // Thresholds
  thresholds: getThresholdsForEnvironment(__ENV.ENV || 'prod'),
};

/**
 * Load Test Configuration
 * Simulates expected normal load
 */
export const loadTestOptions: Options = {
  ...baseOptions,
  stages: [
    { duration: __ENV.RAMP_UP_DURATION || '30s', target: parseInt(__ENV.VUS || '10') },
    { duration: __ENV.DURATION || '5m', target: parseInt(__ENV.VUS || '10') },
    { duration: __ENV.RAMP_DOWN_DURATION || '30s', target: 0 },
  ],
  thresholds: defaultThresholds,
};

/**
 * Stress Test Configuration
 * Gradually increases load until system breaks
 */
export const stressTestOptions: Options = {
  ...baseOptions,
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 300 },  // Ramp up to 300 users
    { duration: '5m', target: 300 },  // Stay at 300 users
    { duration: '10m', target: 0 },   // Ramp down
  ],
};

/**
 * Spike Test Configuration
 * Sudden increase in load
 */
export const spikeTestOptions: Options = {
  ...baseOptions,
  stages: [
    { duration: '1m', target: 10 },   // Baseline
    { duration: '30s', target: 200 }, // Spike
    { duration: '3m', target: 200 },  // Sustain spike
    { duration: '30s', target: 10 },  // Return to baseline
    { duration: '3m', target: 10 },   // Recovery
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

/**
 * Endurance/Soak Test Configuration
 * Extended duration at moderate load
 */
export const enduranceTestOptions: Options = {
  ...baseOptions,
  stages: [
    { duration: '5m', target: 50 },    // Ramp up
    { duration: '4h', target: 50 },    // Soak - maintain load for extended period
    { duration: '5m', target: 0 },     // Ramp down
  ],
};

/**
 * Smoke Test Configuration
 * Minimal load to validate functionality
 */
export const smokeTestOptions: Options = {
  ...baseOptions,
  vus: 1,
  duration: '1m',
  thresholds: {
    'http_req_failed': ['rate<0.05'], // Allow 5% error rate for smoke tests
    'http_req_duration': ['p(95)<2000'], // More relaxed threshold
  },
};

/**
 * Get appropriate options based on test type
 */
export function getTestOptions(testType: string): Options {
  switch (testType.toLowerCase()) {
    case 'load':
      return loadTestOptions;
    case 'stress':
      return stressTestOptions;
    case 'spike':
      return spikeTestOptions;
    case 'endurance':
    case 'soak':
      return enduranceTestOptions;
    case 'smoke':
      return smokeTestOptions;
    default:
      return loadTestOptions;
  }
}

/**
 * Print test configuration summary
 */
export function printTestConfig(testType: string): void {
  const env = getCurrentEnvironment();
  const options = getTestOptions(testType);
  
  console.log('='.repeat(60));
  console.log(`Test Type: ${testType.toUpperCase()}`);
  console.log(`Environment: ${env.name}`);
  console.log(`Base URL: ${env.baseUrl}`);
  console.log(`Max VUs: ${env.maxVUs}`);
  if (options.stages) {
    console.log(`Stages: ${options.stages.length}`);
  } else {
    console.log(`VUs: ${options.vus}, Duration: ${options.duration}`);
  }
  console.log('='.repeat(60));
}

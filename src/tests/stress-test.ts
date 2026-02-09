/**
 * Stress Test Template
 * Tests system behavior under extreme load to find breaking point
 */

import { sleep } from 'k6';
import { Options } from 'k6/options';
import { stressTestOptions, printTestConfig } from '../config/config';
import { validateEnvironment, getCurrentEnvironment } from '../config/environments';
import { httpGet } from '../utils/http';
import { checkGetSuccess, checkNoErrors } from '../utils/checks';
import { recordApiCall, recordRetrieve } from '../utils/metrics';
import { updateRateLimitMetrics, handleRateLimit } from '../utils/rate-limit';

// Test configuration
export const options: Options = stressTestOptions;

/**
 * Setup function - runs once before test starts
 */
export function setup() {
  console.log('='.repeat(60));
  console.log('STRESS TEST - SETUP');
  console.log('='.repeat(60));
  console.log('This test will gradually increase load to find the breaking point');
  
  validateEnvironment();
  printTestConfig('stress');
  
  const env = getCurrentEnvironment();
  
  // Health check
  const healthCheck = httpGet('/status', { endpoint: 'health-check' });
  
  if (healthCheck.status !== 200) {
    console.error(`Health check failed: ${healthCheck.status}`);
    throw new Error('API is not healthy, aborting test');
  }
  
  console.log('✓ API health check passed');
  console.log('='.repeat(60));
  
  return {
    baseUrl: env.baseUrl,
    startTime: Date.now(),
    errorThreshold: 0.1, // Start logging when error rate > 10%
  };
}

/**
 * Main test function - runs once per iteration per VU
 */
export default function (_data: any) {
  // Primary endpoint test
  const response = httpGet('/status', {
    endpoint: 'status',
    tags: { 
      operation: 'read',
      testType: 'stress',
    },
  });
  
  // Check for rate limiting
  if (handleRateLimit(response)) {
    console.warn('Rate limit encountered during stress test');
  }
  
  // Validate response
  const success = checkGetSuccess(response, 2000); // More lenient threshold for stress test
  
  // Check for errors (important in stress testing)
  const noErrors = checkNoErrors(response);
  
  if (!noErrors) {
    console.warn(`Error detected: Status ${response.status}`);
  }
  
  // Record metrics
  recordApiCall(success, response.timings.duration);
  recordRetrieve(success, response.timings.duration);
  updateRateLimitMetrics(response);
  
  // Shorter think time for stress testing
  sleep(0.5);
  
  // Log performance degradation
  if (response.timings.duration > 3000) {
    console.warn(`Slow response detected: ${response.timings.duration}ms`);
  }
  
  /* Example: Add more intensive operations
  
  // Multiple rapid requests to stress the system
  const endpoints = ['/items', '/categories', '/search'];
  for (const endpoint of endpoints) {
    const resp = httpGet(endpoint, {
      endpoint: endpoint.substring(1),
      tags: { testType: 'stress' },
    });
    checkGetSuccess(resp);
    sleep(0.2); // Minimal think time
  }
  
  */
}

/**
 * Teardown function - runs once after test completes
 */
export function teardown(data: any) {
  console.log('='.repeat(60));
  console.log('STRESS TEST - COMPLETED');
  const duration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(2);
  console.log(`Total test duration: ${duration} minutes`);
  console.log('System breaking point analysis:');
  console.log('- Check error rates in results');
  console.log('- Review response time degradation');
  console.log('- Analyze at which VU count issues began');
  console.log('='.repeat(60));
}

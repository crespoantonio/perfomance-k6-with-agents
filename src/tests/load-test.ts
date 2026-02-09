/**
 * Load Test Template
 * Tests system performance under expected normal load conditions
 */

import { sleep } from 'k6';
import { Options } from 'k6/options';
import { loadTestOptions, printTestConfig } from '../config/config';
import { validateEnvironment, getCurrentEnvironment } from '../config/environments';
import { httpGet } from '../utils/http';
import { checkGetSuccess } from '../utils/checks';
import { recordApiCall, recordRetrieve } from '../utils/metrics';
import { updateRateLimitMetrics } from '../utils/rate-limit';

// Test configuration
export const options: Options = loadTestOptions;

/**
 * Setup function - runs once before test starts
 * Use this to authenticate, load data, etc.
 */
export function setup() {
  console.log('='.repeat(60));
  console.log('LOAD TEST - SETUP');
  console.log('='.repeat(60));
  
  validateEnvironment();
  printTestConfig('load');
  
  const env = getCurrentEnvironment();
  
  // Test that the API is reachable
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
  };
}

/**
 * Main test function - runs once per iteration per VU
 */
export default function (_data: any) {
  // Example: GET request to health/status endpoint
  const response = httpGet('/status', {
    endpoint: 'status',
    tags: { operation: 'read' },
  });
  
  // Validate response
  const success = checkGetSuccess(response, 1000);
  
  // Record metrics
  recordApiCall(success, response.timings.duration);
  recordRetrieve(success, response.timings.duration);
  updateRateLimitMetrics(response);
  
  // Think time - simulates user reading/processing the response
  sleep(1);
  
  // Example: Additional API calls can be added here
  // Example workflow:
  // 1. List items
  // 2. Get item details
  // 3. Search for items
  // etc.
  
  /* Example additional requests:
  
  // List items
  const listResponse = httpGet('/items', {
    endpoint: 'list',
    tags: { operation: 'read' },
  });
  checkGetSuccess(listResponse);
  sleep(1);
  
  // Get specific item
  const itemId = 1; // Get from data or random
  const getResponse = httpGet(`/items/${itemId}`, {
    endpoint: 'get-item',
    tags: { operation: 'read' },
  });
  checkGetSuccess(getResponse);
  sleep(1);
  
  */
}

/**
 * Teardown function - runs once after test completes
 * Use this to cleanup, generate reports, etc.
 */
export function teardown(data: any) {
  console.log('='.repeat(60));
  console.log('LOAD TEST - COMPLETED');
  const duration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(2);
  console.log(`Total test duration: ${duration} minutes`);
  console.log('='.repeat(60));
}

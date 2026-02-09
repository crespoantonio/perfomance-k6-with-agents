/**
 * Endurance/Soak Test Template
 * Tests system stability over extended period under sustained load
 */

import { sleep } from 'k6';
import { Options } from 'k6/options';
import { enduranceTestOptions, printTestConfig } from '../config/config';
import { validateEnvironment, getCurrentEnvironment } from '../config/environments';
import { httpGet } from '../utils/http';
import { checkApiSuccess } from '../utils/checks';
import { recordApiCall, recordRetrieve } from '../utils/metrics';
import { updateRateLimitMetrics } from '../utils/rate-limit';

// Test configuration
export const options: Options = enduranceTestOptions;

/**
 * Setup function - runs once before test starts
 */
export function setup() {
  console.log('='.repeat(60));
  console.log('ENDURANCE/SOAK TEST - SETUP');
  console.log('='.repeat(60));
  console.log('This test runs for extended duration to detect:');
  console.log('- Memory leaks');
  console.log('- Connection pool exhaustion');
  console.log('- Gradual performance degradation');
  console.log('- Resource cleanup issues');
  
  validateEnvironment();
  printTestConfig('endurance');
  
  const env = getCurrentEnvironment();
  
  // Health check
  const healthCheck = httpGet('/status', { endpoint: 'health-check' });
  
  if (healthCheck.status !== 200) {
    console.error(`Health check failed: ${healthCheck.status}`);
    throw new Error('API is not healthy, aborting test');
  }
  
  console.log('✓ API health check passed');
  console.log('⏰ Test will run for an extended period');
  console.log('='.repeat(60));
  
  return {
    baseUrl: env.baseUrl,
    startTime: Date.now(),
    checkpointInterval: 300000, // Log checkpoint every 5 minutes
    lastCheckpoint: Date.now(),
    iterationCount: 0,
    errorCount: 0,
  };
}

/**
 * Main test function - runs once per iteration per VU
 */
export default function (data: any) {
  data.iterationCount++;
  
  // Periodic checkpoint logging
  const now = Date.now();
  if (now - data.lastCheckpoint >= data.checkpointInterval) {
    const elapsed = ((now - data.startTime) / 1000 / 60).toFixed(1);
    const errorRate = data.errorCount / data.iterationCount;
    console.log(`⏱️  Checkpoint: ${elapsed}min elapsed, ${data.iterationCount} iterations, ${(errorRate * 100).toFixed(2)}% errors`);
    data.lastCheckpoint = now;
  }
  
  // Main API call
  const response = httpGet('/status', {
    endpoint: 'status',
    tags: { 
      operation: 'read',
      testType: 'endurance',
    },
  });
  
  // Validate response - strict checks for endurance test
  const success = checkApiSuccess(response, 1000);
  
  if (!success) {
    data.errorCount++;
  }
  
  // Record metrics
  recordApiCall(success, response.timings.duration);
  recordRetrieve(success, response.timings.duration);
  updateRateLimitMetrics(response);
  
  // Monitor for performance degradation over time
  if (response.timings.duration > 2000) {
    const elapsed = ((now - data.startTime) / 1000 / 60).toFixed(1);
    console.warn(`⚠️  Performance degradation detected at ${elapsed}min: ${response.timings.duration}ms`);
  }
  
  // Consistent think time
  sleep(2);
  
  /* Example: Realistic user workflow for endurance testing
  
  // Simulate typical user journey
  // This should represent actual usage patterns
  
  // 1. Browse items
  const listResponse = httpGet('/items?page=1&limit=20', {
    endpoint: 'list',
    tags: { testType: 'endurance', operation: 'browse' },
  });
  checkGetSuccess(listResponse);
  sleep(3); // User reviews list
  
  // 2. View item details
  const itemId = Math.floor(Math.random() * 100) + 1;
  const detailResponse = httpGet(`/items/${itemId}`, {
    endpoint: 'get-item',
    tags: { testType: 'endurance', operation: 'view' },
  });
  checkGetSuccess(detailResponse);
  sleep(5); // User reviews details
  
  // 3. Search (occasionally)
  if (Math.random() < 0.3) { // 30% of time
    const searchResponse = httpGet('/search?q=test', {
      endpoint: 'search',
      tags: { testType: 'endurance', operation: 'search' },
    });
    checkGetSuccess(searchResponse);
    sleep(2);
  }
  
  */
}

/**
 * Teardown function - runs once after test completes
 */
export function teardown(data: any) {
  console.log('='.repeat(60));
  console.log('ENDURANCE/SOAK TEST - COMPLETED');
  const duration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(2);
  const errorRate = (data.errorCount / data.iterationCount * 100).toFixed(2);
  
  console.log(`Total test duration: ${duration} minutes`);
  console.log(`Total iterations: ${data.iterationCount}`);
  console.log(`Total errors: ${data.errorCount}`);
  console.log(`Overall error rate: ${errorRate}%`);
  
  console.log('\nAnalysis focus:');
  console.log('- Compare response times: start vs middle vs end');
  console.log('- Check for gradual memory increase');
  console.log('- Verify connection pools are healthy');
  console.log('- Review error patterns over time');
  console.log('- Check for any resource leaks');
  
  console.log('='.repeat(60));
}

/**
 * Spike Test Template
 * Tests system behavior during sudden traffic spikes
 */

import { sleep } from 'k6';
import { Options } from 'k6/options';
import { spikeTestOptions, printTestConfig } from '../config/config';
import { validateEnvironment, getCurrentEnvironment } from '../config/environments';
import { httpGet } from '../utils/http';
import { checkGetSuccess, checkStatusSuccess } from '../utils/checks';
import { recordApiCall, recordRetrieve, customGauges } from '../utils/metrics';
import { updateRateLimitMetrics, isRateLimited } from '../utils/rate-limit';

// Test configuration
export const options: Options = spikeTestOptions;

/**
 * Setup function - runs once before test starts
 */
export function setup() {
  console.log('='.repeat(60));
  console.log('SPIKE TEST - SETUP');
  console.log('='.repeat(60));
  console.log('This test simulates sudden traffic spikes');
  console.log('Focus: System recovery and auto-scaling capabilities');
  
  validateEnvironment();
  printTestConfig('spike');
  
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
    spikeDetected: false,
  };
}

/**
 * Main test function - runs once per iteration per VU
 */
export default function (data: any) {
  const currentVUs = __VU; // Current VU number
  
  // Detect when spike occurs (sudden increase in VUs)
  if (currentVUs > 50 && !data.spikeDetected) {
    console.log(`🚀 SPIKE DETECTED - VUs: ${currentVUs}`);
    data.spikeDetected = true;
  }
  
  // Main API call
  const response = httpGet('/status', {
    endpoint: 'status',
    tags: { 
      operation: 'read',
      testType: 'spike',
      phase: currentVUs > 100 ? 'spike' : 'baseline',
    },
  });
  
  // Validate response
  const success = checkStatusSuccess(response);
  
  // During spike, we expect some degradation but system should still respond
  if (currentVUs > 100) {
    // In spike phase - more lenient checks
    checkGetSuccess(response, 5000); // 5s max during spike
  } else {
    // Normal phase - strict checks
    checkGetSuccess(response, 1000);
  }
  
  // Record metrics
  recordApiCall(success, response.timings.duration);
  recordRetrieve(success, response.timings.duration);
  updateRateLimitMetrics(response);
  
  // Update active users gauge
  customGauges.activeUsers.set(currentVUs, {});
  
  // Check for rate limiting during spike
  if (isRateLimited(response)) {
    console.warn(`Rate limited during spike - VUs: ${currentVUs}`);
  }
  
  // Log slow responses during spike
  if (response.timings.duration > 3000) {
    console.warn(`Slow response during spike: ${response.timings.duration}ms (VUs: ${currentVUs})`);
  }
  
  // Variable think time based on phase
  if (currentVUs > 100) {
    sleep(0.3); // Faster during spike
  } else {
    sleep(1); // Normal during baseline
  }
  
  /* Example: Additional critical operations to test during spike
  
  // Test critical user flows that must work even during spikes
  const criticalEndpoints = [
    '/health',
    '/status',
    '/version',
  ];
  
  const randomEndpoint = criticalEndpoints[Math.floor(Math.random() * criticalEndpoints.length)];
  const criticalResponse = httpGet(randomEndpoint, {
    endpoint: 'critical',
    tags: { critical: 'true', phase: currentVUs > 100 ? 'spike' : 'baseline' },
  });
  
  checkStatusSuccess(criticalResponse);
  
  */
}

/**
 * Teardown function - runs once after test completes
 */
export function teardown(data: any) {
  console.log('='.repeat(60));
  console.log('SPIKE TEST - COMPLETED');
  const duration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(2);
  console.log(`Total test duration: ${duration} minutes`);
  console.log('Analysis focus:');
  console.log('- How quickly did system recover after spike?');
  console.log('- Did auto-scaling trigger appropriately?');
  console.log('- Were there any cascading failures?');
  console.log('- Did error rates return to normal after spike?');
  console.log('='.repeat(60));
}

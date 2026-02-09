/**
 * Thresholds Configuration
 * Defines SLA requirements and performance criteria for tests
 */

export interface ThresholdConfig {
  http_req_duration: string[];
  http_req_failed: string[];
  http_reqs: string[];
  checks: string[];
}

/**
 * Default thresholds for all tests
 * Can be overridden by environment variables
 */
export const defaultThresholds: Record<string, string[]> = {
  // HTTP response time thresholds
  'http_req_duration': [
    `p(95)<${__ENV.HTTP_REQ_DURATION_P95 || '500'}`, // 95% of requests should be below 500ms
    `p(99)<${__ENV.HTTP_REQ_DURATION_P99 || '1000'}`, // 99% of requests should be below 1s
  ],
  
  // Error rate threshold
  'http_req_failed': [
    `rate<${__ENV.HTTP_REQ_FAILED_RATE || '0.01'}`, // Error rate should be less than 1%
  ],
  
  // Throughput threshold
  'http_reqs': [
    `rate>${__ENV.HTTP_REQS_RATE || '100'}`, // Should maintain at least 100 requests per second
  ],
  
  // Check success rate
  'checks': [
    'rate>0.95', // 95% of checks should pass
  ],
};

/**
 * Strict thresholds for production validation
 */
export const strictThresholds: Record<string, string[]> = {
  'http_req_duration': [
    'p(95)<300', // Stricter - 95% under 300ms
    'p(99)<800',  // 99% under 800ms
  ],
  'http_req_failed': [
    'rate<0.005', // Less than 0.5% error rate
  ],
  'http_reqs': [
    'rate>200', // Higher throughput requirement
  ],
  'checks': [
    'rate>0.99', // 99% check success rate
  ],
};

/**
 * Relaxed thresholds for development/testing
 */
export const relaxedThresholds: Record<string, string[]> = {
  'http_req_duration': [
    'p(95)<1000',
    'p(99)<2000',
  ],
  'http_req_failed': [
    'rate<0.05', // 5% acceptable in dev
  ],
  'http_reqs': [
    'rate>50',
  ],
  'checks': [
    'rate>0.90',
  ],
};

/**
 * Endpoint-specific thresholds using tags
 * Example: 'http_req_duration{endpoint:login}': ['p(95)<200']
 */
export const endpointThresholds: Record<string, string[]> = {
  // Login endpoint - should be fast
  'http_req_duration{endpoint:login}': ['p(95)<200', 'p(99)<500'],
  
  // List/search endpoints - moderate speed
  'http_req_duration{endpoint:list}': ['p(95)<500', 'p(99)<1000'],
  
  // Create/update operations - can be slower
  'http_req_duration{endpoint:create}': ['p(95)<800', 'p(99)<1500'],
  'http_req_duration{endpoint:update}': ['p(95)<800', 'p(99)<1500'],
  
  // Delete operations - should be fast
  'http_req_duration{endpoint:delete}': ['p(95)<300', 'p(99)<600'],
};

/**
 * Get thresholds based on environment
 */
export function getThresholdsForEnvironment(env: string): Record<string, string[]> {
  switch (env) {
    case 'prod':
      return { ...strictThresholds, ...endpointThresholds };
    case 'dev':
      return relaxedThresholds;
    default:
      return { ...defaultThresholds, ...endpointThresholds };
  }
}

/**
 * Rate Limit Validation Utilities
 * Helper functions to validate and handle rate limiting
 */

import { RefinedResponse, ResponseType } from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Gauge } from 'k6/metrics';

// Custom metrics for rate limiting
export const rateLimitMetrics = {
  rateLimitHit: new Counter('rate_limit_hit'),
  rateLimitRemaining: new Gauge('rate_limit_remaining'),
  rateLimitReset: new Gauge('rate_limit_reset_seconds'),
};

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter?: number; // Seconds to wait
}

/**
 * Extract rate limit information from response headers
 * Supports common rate limit header formats
 */
export function extractRateLimitInfo(
  response: RefinedResponse<ResponseType | undefined>
): RateLimitInfo | null {
  const headers = response.headers;

  // Common header names for rate limiting
  const limit =
    parseInt(headers['X-RateLimit-Limit'] || headers['X-Rate-Limit-Limit'] || '0') || null;
  const remaining =
    parseInt(headers['X-RateLimit-Remaining'] || headers['X-Rate-Limit-Remaining'] || '0') || 0;
  const reset =
    parseInt(headers['X-RateLimit-Reset'] || headers['X-Rate-Limit-Reset'] || '0') || null;
  const retryAfter =
    parseInt(headers['Retry-After'] || headers['retry-after'] || '0') || undefined;

  if (limit === null) {
    return null; // No rate limit info available
  }

  return {
    limit: limit,
    remaining: remaining,
    reset: reset || 0,
    retryAfter: retryAfter,
  };
}

/**
 * Check if rate limit has been hit
 */
export function isRateLimited(response: RefinedResponse<ResponseType | undefined>): boolean {
  // Check status code
  if (response.status === 429) {
    rateLimitMetrics.rateLimitHit.add(1);
    return true;
  }

  // Check rate limit headers
  const rateLimitInfo = extractRateLimitInfo(response);
  if (rateLimitInfo && rateLimitInfo.remaining === 0) {
    rateLimitMetrics.rateLimitHit.add(1);
    return true;
  }

  return false;
}

/**
 * Update rate limit metrics
 */
export function updateRateLimitMetrics(
  response: RefinedResponse<ResponseType | undefined>
): void {
  const rateLimitInfo = extractRateLimitInfo(response);
  if (rateLimitInfo) {
    rateLimitMetrics.rateLimitRemaining.set(rateLimitInfo.remaining, {});

    // Calculate seconds until reset
    const now = Math.floor(Date.now() / 1000);
    const secondsUntilReset = rateLimitInfo.reset - now;
    if (secondsUntilReset > 0) {
      rateLimitMetrics.rateLimitReset.set(secondsUntilReset, {});
    }
  }
}

/**
 * Check rate limit headers and validate
 */
export function checkRateLimit(response: RefinedResponse<ResponseType | undefined>): boolean {
  const rateLimitInfo = extractRateLimitInfo(response);

  if (!rateLimitInfo) {
    console.warn('No rate limit information found in response headers');
    return false;
  }

  return check(response, {
    'rate limit not exceeded': () => !isRateLimited(response),
    'rate limit remaining > 0': () => rateLimitInfo.remaining > 0,
    'rate limit headers present': () => rateLimitInfo.limit > 0,
  });
}

/**
 * Handle rate limit by waiting if needed
 * Returns true if wait was required, false otherwise
 */
export function handleRateLimit(response: RefinedResponse<ResponseType | undefined>): boolean {
  if (!isRateLimited(response)) {
    updateRateLimitMetrics(response);
    return false;
  }

  const rateLimitInfo = extractRateLimitInfo(response);

  console.warn(`Rate limit hit! Status: ${response.status}`);

  // Calculate wait time
  let waitSeconds = 60; // Default wait time

  if (rateLimitInfo?.retryAfter) {
    waitSeconds = rateLimitInfo.retryAfter;
  } else if (rateLimitInfo?.reset) {
    const now = Math.floor(Date.now() / 1000);
    waitSeconds = Math.max(rateLimitInfo.reset - now, 0) + 1; // Add 1 second buffer
  }

  console.warn(`Waiting ${waitSeconds} seconds before retry...`);
  sleep(waitSeconds);

  return true;
}

/**
 * Calculate optimal think time to avoid rate limiting
 * Based on remaining requests and reset time
 */
export function calculateOptimalThinkTime(
  response: RefinedResponse<ResponseType | undefined>
): number {
  const rateLimitInfo = extractRateLimitInfo(response);

  if (!rateLimitInfo || rateLimitInfo.remaining === 0) {
    return 1; // Default 1 second if no info
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilReset = Math.max(rateLimitInfo.reset - now, 1);

  // Calculate requests per second we can safely make
  const safeRequestsPerSecond = rateLimitInfo.remaining / secondsUntilReset;

  // Calculate think time (with 20% buffer for safety)
  const optimalThinkTime = (1 / safeRequestsPerSecond) * 1.2;

  return Math.max(optimalThinkTime, 0.1); // Minimum 0.1 seconds
}

/**
 * Log rate limit information for debugging
 */
export function logRateLimitInfo(response: RefinedResponse<ResponseType | undefined>): void {
  const rateLimitInfo = extractRateLimitInfo(response);

  if (rateLimitInfo) {
    const now = Math.floor(Date.now() / 1000);
    const resetIn = rateLimitInfo.reset - now;

    console.log('Rate Limit Info:');
    console.log(`  Limit: ${rateLimitInfo.limit}`);
    console.log(`  Remaining: ${rateLimitInfo.remaining}`);
    console.log(`  Reset in: ${resetIn} seconds`);
    if (rateLimitInfo.retryAfter) {
      console.log(`  Retry after: ${rateLimitInfo.retryAfter} seconds`);
    }
  } else {
    console.log('No rate limit information available');
  }
}

/**
 * Validate rate limit headers are present
 */
export function validateRateLimitHeaders(
  response: RefinedResponse<ResponseType | undefined>
): boolean {
  const rateLimitInfo = extractRateLimitInfo(response);

  if (!rateLimitInfo) {
    console.warn('Expected rate limit headers not found in response');
    return false;
  }

  console.log(
    `Rate Limit: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining`
  );
  return true;
}

/**
 * Smart sleep that respects rate limits
 * Adjusts think time dynamically based on rate limit headers
 */
export function smartSleep(
  response: RefinedResponse<ResponseType | undefined>,
  baseThinkTime: number = 1
): void {
  const rateLimitInfo = extractRateLimitInfo(response);

  if (!rateLimitInfo || rateLimitInfo.remaining > rateLimitInfo.limit * 0.1) {
    // If we have > 10% of requests remaining, use base think time
    sleep(baseThinkTime);
  } else {
    // If running low on requests, use calculated optimal think time
    const optimalTime = calculateOptimalThinkTime(response);
    console.log(`Adjusting think time to ${optimalTime.toFixed(2)}s to avoid rate limit`);
    sleep(optimalTime);
  }
}

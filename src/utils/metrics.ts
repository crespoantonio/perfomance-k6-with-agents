/**
 * Custom Metrics
 * Define and manage custom metrics for performance testing
 */

import { Counter, Trend, Rate, Gauge } from 'k6/metrics';

/**
 * Custom counter metrics
 */
export const customCounters = {
  // API-specific counters
  apiCallsTotal: new Counter('api_calls_total'),
  apiCallsSuccess: new Counter('api_calls_success'),
  apiCallsFailed: new Counter('api_calls_failed'),
  
  // Business logic counters
  itemsCreated: new Counter('items_created'),
  itemsUpdated: new Counter('items_updated'),
  itemsDeleted: new Counter('items_deleted'),
  itemsRetrieved: new Counter('items_retrieved'),
  
  // Authentication counters
  loginAttempts: new Counter('login_attempts'),
  loginSuccess: new Counter('login_success'),
  loginFailures: new Counter('login_failures'),
  
  // Error counters
  validationErrors: new Counter('validation_errors'),
  serverErrors: new Counter('server_errors'),
  timeoutErrors: new Counter('timeout_errors'),
};

/**
 * Custom trend metrics (for timing measurements)
 */
export const customTrends = {
  // Operation durations
  loginDuration: new Trend('login_duration', true),
  createItemDuration: new Trend('create_item_duration', true),
  updateItemDuration: new Trend('update_item_duration', true),
  deleteItemDuration: new Trend('delete_item_duration', true),
  listItemsDuration: new Trend('list_items_duration', true),
  searchDuration: new Trend('search_duration', true),
  
  // Time to first byte
  ttfb: new Trend('time_to_first_byte', true),
  
  // Custom business metrics
  checkoutDuration: new Trend('checkout_duration', true),
  paymentProcessingTime: new Trend('payment_processing_time', true),
};

/**
 * Custom rate metrics (for percentage calculations)
 */
export const customRates = {
  // Success rates
  apiSuccessRate: new Rate('api_success_rate'),
  dataValidationRate: new Rate('data_validation_rate'),
  
  // Error rates
  clientErrorRate: new Rate('client_error_rate'), // 4xx
  serverErrorRate: new Rate('server_error_rate'), // 5xx
  
  // Business metrics
  checkoutSuccessRate: new Rate('checkout_success_rate'),
  searchResultsFoundRate: new Rate('search_results_found_rate'),
};

/**
 * Custom gauge metrics (for instantaneous values)
 */
export const customGauges = {
  // Current state
  activeUsers: new Gauge('active_users'),
  itemsInCart: new Gauge('items_in_cart'),
  
  // Response sizes
  averageResponseSize: new Gauge('average_response_size'),
};

/**
 * Record API call metrics
 */
export function recordApiCall(success: boolean, _duration: number): void {
  customCounters.apiCallsTotal.add(1);
  
  if (success) {
    customCounters.apiCallsSuccess.add(1);
    customRates.apiSuccessRate.add(true);
  } else {
    customCounters.apiCallsFailed.add(1);
    customRates.apiSuccessRate.add(false);
  }
}

/**
 * Record login metrics
 */
export function recordLogin(success: boolean, duration: number): void {
  customCounters.loginAttempts.add(1);
  customTrends.loginDuration.add(duration);
  
  if (success) {
    customCounters.loginSuccess.add(1);
  } else {
    customCounters.loginFailures.add(1);
  }
}

/**
 * Record CRUD operation metrics
 */
export function recordCreate(success: boolean, duration: number): void {
  if (success) {
    customCounters.itemsCreated.add(1);
  }
  customTrends.createItemDuration.add(duration);
}

export function recordUpdate(success: boolean, duration: number): void {
  if (success) {
    customCounters.itemsUpdated.add(1);
  }
  customTrends.updateItemDuration.add(duration);
}

export function recordDelete(success: boolean, duration: number): void {
  if (success) {
    customCounters.itemsDeleted.add(1);
  }
  customTrends.deleteItemDuration.add(duration);
}

export function recordRetrieve(success: boolean, duration: number): void {
  if (success) {
    customCounters.itemsRetrieved.add(1);
  }
  customTrends.listItemsDuration.add(duration);
}

/**
 * Record error metrics based on status code
 */
export function recordError(statusCode: number): void {
  if (statusCode >= 400 && statusCode < 500) {
    customRates.clientErrorRate.add(true);
    if (statusCode === 400 || statusCode === 422) {
      customCounters.validationErrors.add(1);
    }
  } else if (statusCode >= 500) {
    customRates.serverErrorRate.add(true);
    customCounters.serverErrors.add(1);
  }
}

/**
 * Record timeout error
 */
export function recordTimeout(): void {
  customCounters.timeoutErrors.add(1);
}

/**
 * Record search metrics
 */
export function recordSearch(duration: number, resultsFound: boolean): void {
  customTrends.searchDuration.add(duration);
  customRates.searchResultsFoundRate.add(resultsFound);
}

/**
 * Record checkout metrics
 */
export function recordCheckout(success: boolean, duration: number): void {
  customTrends.checkoutDuration.add(duration);
  customRates.checkoutSuccessRate.add(success);
}

/**
 * Update active users gauge
 */
export function updateActiveUsers(count: number): void {
  customGauges.activeUsers.set(count, {});
}

/**
 * Print custom metrics summary
 */
export function printMetricsSummary(): void {
  console.log('='.repeat(60));
  console.log('Custom Metrics Summary');
  console.log('='.repeat(60));
  console.log('Note: Detailed metrics available in test results');
}

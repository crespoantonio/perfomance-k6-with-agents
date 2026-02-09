/**
 * HTTP Utility Functions
 * Common HTTP operations and helpers
 */

import http, { RefinedResponse, ResponseType } from 'k6/http';
import { getCurrentEnvironment } from '../config/environments';

export interface HttpParams {
  headers?: Record<string, string>;
  tags?: Record<string, string>;
  timeout?: string;
}

export interface RequestOptions extends HttpParams {
  endpoint?: string;
  includeAuth?: boolean;
}

/**
 * Get default headers with optional authentication
 */
export function getDefaultHeaders(includeAuth: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth) {
    const env = getCurrentEnvironment();
    if (env.apiKey) {
      headers['X-API-Key'] = env.apiKey;
    }
  }

  return headers;
}

/**
 * Build full URL from endpoint
 */
export function buildUrl(endpoint: string): string {
  const env = getCurrentEnvironment();
  const baseUrl = env.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * GET request with standard error handling
 */
export function httpGet(
  endpoint: string,
  params?: RequestOptions
): RefinedResponse<ResponseType | undefined> {
  const url = buildUrl(endpoint);
  const headers = { ...getDefaultHeaders(params?.includeAuth !== false), ...params?.headers };
  const tags = { endpoint: params?.endpoint || 'get', ...params?.tags };

  const response = http.get(url, {
    headers,
    tags,
    timeout: params?.timeout,
  });

  return response;
}

/**
 * POST request with standard error handling
 */
export function httpPost(
  endpoint: string,
  payload: any,
  params?: RequestOptions
): RefinedResponse<ResponseType | undefined> {
  const url = buildUrl(endpoint);
  const headers = { ...getDefaultHeaders(params?.includeAuth !== false), ...params?.headers };
  const tags = { endpoint: params?.endpoint || 'post', ...params?.tags };

  const response = http.post(url, JSON.stringify(payload), {
    headers,
    tags,
    timeout: params?.timeout,
  });

  return response;
}

/**
 * PUT request with standard error handling
 */
export function httpPut(
  endpoint: string,
  payload: any,
  params?: RequestOptions
): RefinedResponse<ResponseType | undefined> {
  const url = buildUrl(endpoint);
  const headers = { ...getDefaultHeaders(params?.includeAuth !== false), ...params?.headers };
  const tags = { endpoint: params?.endpoint || 'put', ...params?.tags };

  const response = http.put(url, JSON.stringify(payload), {
    headers,
    tags,
    timeout: params?.timeout,
  });

  return response;
}

/**
 * PATCH request with standard error handling
 */
export function httpPatch(
  endpoint: string,
  payload: any,
  params?: RequestOptions
): RefinedResponse<ResponseType | undefined> {
  const url = buildUrl(endpoint);
  const headers = { ...getDefaultHeaders(params?.includeAuth !== false), ...params?.headers };
  const tags = { endpoint: params?.endpoint || 'patch', ...params?.tags };

  const response = http.patch(url, JSON.stringify(payload), {
    headers,
    tags,
    timeout: params?.timeout,
  });

  return response;
}

/**
 * DELETE request with standard error handling
 */
export function httpDelete(
  endpoint: string,
  params?: RequestOptions
): RefinedResponse<ResponseType | undefined> {
  const url = buildUrl(endpoint);
  const headers = { ...getDefaultHeaders(params?.includeAuth !== false), ...params?.headers };
  const tags = { endpoint: params?.endpoint || 'delete', ...params?.tags };

  const response = http.del(url, null, {
    headers,
    tags,
    timeout: params?.timeout,
  });

  return response;
}

/**
 * Batch GET requests
 */
export function httpBatchGet(endpoints: string[], params?: RequestOptions): any {
  const requests = endpoints.map((endpoint) => {
    const url = buildUrl(endpoint);
    const headers = { ...getDefaultHeaders(params?.includeAuth !== false), ...params?.headers };
    const tags = { endpoint: params?.endpoint || 'batch-get', ...params?.tags };

    return ['GET', url, null, { headers, tags }] as const;
  });

  return http.batch(requests as any);
}

/**
 * Check if response is successful (2xx status code)
 */
export function isSuccessful(response: RefinedResponse<ResponseType | undefined>): boolean {
  return response.status >= 200 && response.status < 300;
}

/**
 * Parse JSON response safely
 */
export function parseJsonResponse(response: RefinedResponse<ResponseType | undefined>): any {
  try {
    return response.json();
  } catch (error) {
    console.error(`Failed to parse JSON response: ${error}`);
    return null;
  }
}

/**
 * Log response for debugging
 */
export function logResponse(
  response: RefinedResponse<ResponseType | undefined>,
  context?: string
): void {
  const prefix = context ? `[${context}]` : '';
  const bodyLength = response.body ? 
    (typeof response.body === 'string' ? response.body.length : 
     response.body instanceof ArrayBuffer ? response.body.byteLength : 0) : 0;
  console.log(
    `${prefix} Status: ${response.status}, Duration: ${response.timings.duration}ms, Size: ${bodyLength} bytes`
  );
}

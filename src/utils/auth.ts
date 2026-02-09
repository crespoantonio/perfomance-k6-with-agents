/**
 * Authentication Utilities
 * Handle authentication flows and token management
 */

import { httpPost } from './http';
import { getCurrentEnvironment } from '../config/environments';

export interface AuthToken {
  token: string;
  expiresAt?: number;
  refreshToken?: string;
}

export interface Credentials {
  username?: string;
  password?: string;
  apiKey?: string;
}

/**
 * Get API Key from environment
 */
export function getApiKey(): string {
  const env = getCurrentEnvironment();
  return env.apiKey || __ENV.API_KEY || '';
}

/**
 * Authenticate and get token (if using token-based auth)
 * This is a template - adjust based on your API's auth mechanism
 */
export function authenticate(credentials: Credentials): AuthToken | null {
  try {
    const response = httpPost('/auth/login', credentials, {
      endpoint: 'login',
      includeAuth: false,
    });

    if (response.status === 200) {
      const body = response.json() as any;
      return {
        token: body.token || body.access_token,
        expiresAt: body.expires_at,
        refreshToken: body.refresh_token,
      };
    } else {
      console.error(`Authentication failed: ${response.status} ${response.status_text}`);
      return null;
    }
  } catch (error) {
    console.error(`Authentication error: ${error}`);
    return null;
  }
}

/**
 * Refresh authentication token
 */
export function refreshAuthToken(refreshToken: string): AuthToken | null {
  try {
    const response = httpPost(
      '/auth/refresh',
      { refresh_token: refreshToken },
      {
        endpoint: 'refresh-token',
        includeAuth: false,
      }
    );

    if (response.status === 200) {
      const body = response.json() as any;
      return {
        token: body.token || body.access_token,
        expiresAt: body.expires_at,
        refreshToken: body.refresh_token || refreshToken,
      };
    } else {
      console.error(`Token refresh failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Token refresh error: ${error}`);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(authToken: AuthToken): boolean {
  if (!authToken.expiresAt) {
    return false; // Assume valid if no expiration
  }
  return Date.now() >= authToken.expiresAt;
}

/**
 * Get authorization header for Bearer token
 */
export function getBearerTokenHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get authorization header for API Key
 */
export function getApiKeyHeader(apiKey?: string): Record<string, string> {
  const key = apiKey || getApiKey();
  return {
    'X-API-Key': key,
  };
}

/**
 * Setup function to authenticate once per VU
 * Use this in your test's setup() function
 */
export function setupAuthentication(credentials?: Credentials): AuthToken | string {
  // If using API Key
  const apiKey = getApiKey();
  if (apiKey) {
    console.log('Using API Key authentication');
    return apiKey;
  }

  // If using token-based auth
  if (credentials) {
    console.log('Authenticating with credentials');
    const authToken = authenticate(credentials);
    if (!authToken) {
      throw new Error('Failed to authenticate');
    }
    return authToken;
  }

  throw new Error('No authentication method configured');
}

/**
 * Logout/cleanup function
 */
export function logout(authToken: AuthToken): void {
  try {
    httpPost('/auth/logout', {}, {
      endpoint: 'logout',
      headers: getBearerTokenHeader(authToken.token),
    });
  } catch (error) {
    console.warn(`Logout error: ${error}`);
  }
}

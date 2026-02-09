/**
 * Environment Configuration
 * Manages environment-specific settings for different testing environments
 */

export type Environment = 'dev' | 'qa' | 'staging' | 'prod';

export interface EnvironmentConfig {
  name: Environment;
  baseUrl: string;
  apiKey: string;
  maxVUs: number;
  description: string;
}

// Default to prod if ENV is not set
const currentEnv = (__ENV.ENV || 'prod') as Environment;

export const environments: Record<Environment, EnvironmentConfig> = {
  dev: {
    name: 'dev',
    baseUrl: __ENV.DEV_BASE_URL || 'https://dev.api.example.com',
    apiKey: __ENV.DEV_API_KEY || '',
    maxVUs: 50,
    description: 'Development environment',
  },
  qa: {
    name: 'qa',
    baseUrl: __ENV.QA_BASE_URL || 'https://qa.api.example.com',
    apiKey: __ENV.QA_API_KEY || '',
    maxVUs: 100,
    description: 'QA/Testing environment',
  },
  staging: {
    name: 'staging',
    baseUrl: __ENV.STAGING_BASE_URL || 'https://staging.api.example.com',
    apiKey: __ENV.STAGING_API_KEY || '',
    maxVUs: 200,
    description: 'Staging/Pre-production environment',
  },
  prod: {
    name: 'prod',
    baseUrl: __ENV.BASE_URL || 'https://api.practicesoftwaretesting.com',
    apiKey: __ENV.API_KEY || '',
    maxVUs: 500,
    description: 'Production environment',
  },
};

/**
 * Get current environment configuration
 */
export function getCurrentEnvironment(): EnvironmentConfig {
  return environments[currentEnv];
}

/**
 * Get configuration for specific environment
 */
export function getEnvironment(env: Environment): EnvironmentConfig {
  return environments[env];
}

/**
 * Validate that required environment variables are set
 */
export function validateEnvironment(): void {
  const env = getCurrentEnvironment();
  
  if (!env.baseUrl) {
    throw new Error(`BASE_URL is not set for environment: ${env.name}`);
  }
  
  console.log(`Running tests against: ${env.name} (${env.baseUrl})`);
  console.log(`Max VUs allowed: ${env.maxVUs}`);
}

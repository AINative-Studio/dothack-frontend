/**
 * Type-safe environment variable access
 */

interface EnvironmentConfig {
  apiUrl: string
  apiVersion: string
  wsUrl?: string
  isDevelopment: boolean
  isProduction: boolean
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

function getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

/**
 * Validates and returns typed environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development'

  return {
    apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api/v1'),
    apiVersion: getEnvVar('NEXT_PUBLIC_API_VERSION', 'v1'),
    wsUrl: getOptionalEnvVar('NEXT_PUBLIC_WS_URL'),
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  }
}

// Export singleton instance
export const env = getEnvironmentConfig()

/**
 * Validates all required environment variables on app start
 * Throws error if any required variables are missing
 */
export function validateEnvironment(): void {
  try {
    getEnvironmentConfig()

    if (env.isDevelopment) {
      console.log('Environment configuration loaded:', {
        apiUrl: env.apiUrl,
        apiVersion: env.apiVersion,
        wsUrl: env.wsUrl || 'not configured',
      })
    }
  } catch (error) {
    console.error('Environment validation failed:', error)
    throw error
  }
}

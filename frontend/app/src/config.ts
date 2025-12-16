// src/config.ts
// Centralized configuration for API endpoints

const getApiBaseUrl = (): string => {
  // Debug: Log all available environment variables
  console.log('All import.meta.env:', import.meta.env);
  
  // In production build, the environment variable should be embedded
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  
  console.log('Raw environment variable VITE_API_BASE_URL:', envUrl);
  console.log('Environment mode:', import.meta.env?.MODE);
  console.log('Environment dev flag:', import.meta.env?.DEV);
  console.log('Environment prod flag:', import.meta.env?.PROD);
  
  // Fallback logic for different environments
  if (envUrl && envUrl.trim() !== '') {
    console.log('✅ Using API URL from environment:', envUrl);
    return envUrl.trim();
  }
  
  // Production fallback - if we're in production and no env var, use the deployed backend
  if (import.meta.env?.PROD) {
    const prodUrl = 'https://apkargbo-wellshift-backend.hf.space';
    console.log('⚠️ Using hardcoded production API URL (fallback):', prodUrl);
    return prodUrl;
  }
  
  // Development fallback
  const devUrl = 'http://localhost:8000';
  console.log('⚠️ Using development API URL (fallback):', devUrl);
  return devUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Export individual endpoint builders
export const endpoints = {
  checkin: `${API_BASE_URL}/checkin`,
  timeline: `${API_BASE_URL}/timeline`,
} as const;

// Log the final configuration for debugging
console.log('🔧 Final API Configuration:', {
  baseUrl: API_BASE_URL,
  endpoints,
  envVarValue: import.meta.env?.VITE_API_BASE_URL || 'NOT SET',
  mode: import.meta.env?.MODE || 'UNKNOWN'
});
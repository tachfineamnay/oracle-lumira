// Oracle Lumira - API Configuration
// Production-ready API base URL management

import { getApiBaseUrl as getApiBaseUrlFromLib } from '../lib/apiBase';

/**
 * Get API base URL for different environments
 * Production: relative paths (proxy nginx)  
 * Development: localhost with port
 */
export function getApiBaseUrl(): string {
  // Use the robust fallback function
  return getApiBaseUrlFromLib();
}

/**
 * Make API request with proper error handling
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with response data
 */
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Validate Stripe publishable key at startup
 */
export function validateStripeKey(): string {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!pk) {
    throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is required but not set');
  }
  
  if (!/^pk_(test|live)_[a-zA-Z0-9]+$/.test(pk)) {
    throw new Error(`Invalid Stripe publishable key format: ${pk.substring(0, 10)}...`);
  }
  
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
    console.log(`Stripe key validated: ${pk.substring(0, 15)}...`);
  }
  return pk;
}

export default {
  getApiBaseUrl,
  apiRequest,
  validateStripeKey,
};

// Oracle Lumira - API Configuration
// Production-ready API base URL management

import { getApiBaseUrl as getApiBaseUrlFromLib } from '../lib/apiBase';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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
  
  // Don't set Content-Type for FormData - let the browser set it automatically
  const defaultHeaders: Record<string, string> = {};
  
  // Only set JSON Content-Type if we're not sending FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = (errorData && (errorData.message || errorData.error)) || `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(response.status, message, errorData);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, (error as Error).message, null);
  }
}

/**
 * Validate Stripe publishable key at startup
 */
export function validateStripeKey(): string {
  // Prefer standard VITE_STRIPE_PUBLISHABLE_KEY, but support legacy VITE_STRIPE_PUBLIC_KEY
  const pk =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  if (!pk) {
    throw new Error(
      'Stripe publishable key missing: set VITE_STRIPE_PUBLISHABLE_KEY (or legacy VITE_STRIPE_PUBLIC_KEY)'
    );
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

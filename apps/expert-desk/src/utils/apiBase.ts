export function getApiBaseUrl(): string {
  // Prefer runtime-safe same-origin proxy in production
  const envBase = (import.meta as any)?.env?.VITE_API_URL as string | undefined;

  // On our production domains, force same-origin proxy to avoid CORS/CSP issues
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host.endsWith('oraclelumira.com')) {
      return '/api';
    }
  }

  // Fallback to env var when not on our prod domains (e.g., local dev, previews)
  if (typeof envBase === 'string' && envBase.trim() !== '') {
    return envBase.trim();
  }

  // Default to same-origin proxy
  return '/api';
}


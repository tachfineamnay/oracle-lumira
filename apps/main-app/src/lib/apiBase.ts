export function getApiBaseUrl() {
  const v = (import.meta as any)?.env?.VITE_API_BASE_URL;
  if (typeof v === 'string' && v.trim() !== '') return v;

  // Production-safe fallback for Option A (API séparée)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If running on oraclelumira.com (prod), target api subdomain
    if (host.endsWith('oraclelumira.com')) {
      return 'https://api.oraclelumira.com';
    }
  }
  // Local/dev fallback
  return '/api';
}

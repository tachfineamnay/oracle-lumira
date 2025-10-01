export function getApiBaseUrl() {
  // Prefer unified var VITE_API_URL; keep backward-compat with VITE_API_BASE_URL
  const env = (import.meta as any)?.env ?? {};
  const candidate = env.VITE_API_URL || env.VITE_API_BASE_URL;
  if (typeof candidate === 'string' && candidate.trim() !== '') return candidate.trim();

  // Production-safe fallback for oraclelumira.com
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('oraclelumira.com')) {
      return 'https://api.oraclelumira.com';
    }
  }
  // Default to same-origin proxy
  return '/api';
}

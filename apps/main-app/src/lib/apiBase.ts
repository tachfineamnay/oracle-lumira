export function getApiBaseUrl() {
  const v = (import.meta as any)?.env?.VITE_API_BASE_URL;
  return (typeof v === 'string' && v.trim() !== '') ? v : '/api';
}

const STORAGE_KEY = 'haihe.apiBaseUrl';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getWindow() {
  return typeof window === 'undefined' ? null : window;
}

export function resolveApiBaseUrl() {
  const currentWindow = getWindow();
  if (!currentWindow) {
    return '';
  }

  const params = new URLSearchParams(currentWindow.location.search);
  const queryBaseUrl = normalizeBaseUrl(params.get('apiBaseUrl') || params.get('apiOrigin') || '');

  if (queryBaseUrl) {
    currentWindow.localStorage.setItem(STORAGE_KEY, queryBaseUrl);
    return queryBaseUrl;
  }

  const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || '');
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const storedBaseUrl = normalizeBaseUrl(currentWindow.localStorage.getItem(STORAGE_KEY));
  if (storedBaseUrl) {
    return storedBaseUrl;
  }

  if (currentWindow.location.protocol === 'file:') {
    return 'http://127.0.0.1:5001';
  }

  if (LOCAL_HOSTS.has(currentWindow.location.hostname)) {
    return 'http://127.0.0.1:5001';
  }

  return currentWindow.location.origin;
}

export function resolveApiUrl(path) {
  const baseUrl = resolveApiBaseUrl();
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

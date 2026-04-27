import { resolveApiBaseUrl, resolveApiUrl } from '../config/runtime.js';

export function ensureRuntimeBridge() {
  const apiBaseUrl = resolveApiBaseUrl();
  window.HAIHE_RUNTIME = {
    ...(window.HAIHE_RUNTIME || {}),
    apiBaseUrl,
    resolveApi: (path) => resolveApiUrl(path),
  };
}

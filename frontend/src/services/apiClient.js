import { resolveApiUrl } from '../config/runtime.js';

export async function getJson(path, options = {}) {
  const response = await fetch(resolveApiUrl(path), {
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function postJson(path, body, options = {}) {
  const response = await fetch(resolveApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

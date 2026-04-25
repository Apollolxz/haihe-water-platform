import { describe, expect, test, beforeEach } from 'vitest';
import { resolveApiBaseUrl, resolveApiUrl } from './runtime.js';

describe('runtime API config', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/');
  });

  test('uses apiBaseUrl query parameter and persists it', () => {
    window.history.replaceState(
      null,
      '',
      'http://127.0.0.1:8000/?apiBaseUrl=http://127.0.0.1:5001',
    );

    expect(resolveApiBaseUrl()).toBe('http://127.0.0.1:5001');
    expect(window.localStorage.getItem('haihe.apiBaseUrl')).toBe('http://127.0.0.1:5001');
  });

  test('builds API URLs from the resolved base URL', () => {
    window.localStorage.setItem('haihe.apiBaseUrl', 'http://127.0.0.1:5001/');

    expect(resolveApiUrl('/api/dashboard/validation-overview')).toBe(
      'http://127.0.0.1:5001/api/dashboard/validation-overview',
    );
  });
});

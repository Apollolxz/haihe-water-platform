import { beforeEach, describe, expect, test } from 'vitest';
import { getCurrentPage, getLegacyPage, pageBase, resolveLegacyScriptSrc } from './routing.js';

describe('legacy routing adapter', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/');
  });

  test('uses the homepage at the root route', () => {
    expect(getCurrentPage()).toBe('index.html');
    expect(getLegacyPage('index.html').Component).toBeTruthy();
  });

  test('maps legacy page URLs to generated React pages', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/knowledge-graph.html');

    expect(getCurrentPage()).toBe('knowledge-graph.html');
    expect(getLegacyPage('knowledge-graph.html').title).toContain('知识图谱');
  });

  test('resolves local legacy script paths against the Vite base path', () => {
    expect(pageBase).toBe('/pages/');
    expect(resolveLegacyScriptSrc('../assets/js/chat-page.js')).toBe('/assets/js/chat-page.js');
  });
});

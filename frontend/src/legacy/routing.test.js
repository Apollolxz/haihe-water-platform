import { beforeEach, describe, expect, test } from 'vitest';
import BoxplotAnalysisPage from '../pages/BoxplotAnalysisPage.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import CorrelationAnalysisPage from '../pages/CorrelationAnalysisPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import IndexPage from '../pages/IndexPage.jsx';
import KnowledgeGraphPage from '../pages/KnowledgeGraphPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ProvinceComparisonPage from '../pages/ProvinceComparisonPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import SandboxPage from '../pages/SandboxPage.jsx';
import TrendAnalysisPage from '../pages/TrendAnalysisPage.jsx';
import { getCurrentPage, getLegacyPage, pageBase } from './routing.js';

describe('legacy routing adapter', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/');
  });

  test('uses the homepage at the root route', () => {
    expect(getCurrentPage()).toBe('index.html');
    expect(getLegacyPage('index.html').Component).toBeTruthy();
  });

  test('maps legacy page URLs to native React pages', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/knowledge-graph.html');

    expect(getCurrentPage()).toBe('knowledge-graph.html');
    expect(getLegacyPage('knowledge-graph.html').title).toContain('知识图谱');
  });

  test('allows native React pages to override generated legacy pages', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/chat.html');

    expect(getCurrentPage()).toBe('chat.html');
    expect(getLegacyPage('chat.html').Component).toBe(ChatPage);
  });

  test('routes account pages through native React page wrappers', () => {
    expect(getLegacyPage('login.html').Component).toBe(LoginPage);
    expect(getLegacyPage('register.html').Component).toBe(RegisterPage);
    expect(getLegacyPage('forgot-password.html').Component).toBe(ForgotPasswordPage);
    expect(getLegacyPage('profile.html').Component).toBe(ProfilePage);
  });

  test('routes every legacy page through a native React wrapper', () => {
    const expectedPages = {
      'boxplot-analysis.html': BoxplotAnalysisPage,
      'correlation-analysis.html': CorrelationAnalysisPage,
      'dashboard.html': DashboardPage,
      'index.html': IndexPage,
      'knowledge-graph.html': KnowledgeGraphPage,
      'province-comparison.html': ProvinceComparisonPage,
      'sandbox.html': SandboxPage,
      'trend-analysis.html': TrendAnalysisPage,
    };

    Object.entries(expectedPages).forEach(([pageName, Component]) => {
      expect(getLegacyPage(pageName).Component).toBe(Component);
    });
  });

  test('keeps page entries free of script injection declarations', () => {
    [
      'boxplot-analysis.html',
      'chat.html',
      'correlation-analysis.html',
      'dashboard.html',
      'forgot-password.html',
      'index.html',
      'knowledge-graph.html',
      'login.html',
      'profile.html',
      'province-comparison.html',
      'register.html',
      'sandbox.html',
      'trend-analysis.html',
    ].forEach((pageName) => {
      expect(getLegacyPage(pageName).scripts).toEqual([]);
    });

  });

  test('keeps the legacy page base path for old URLs', () => {
    expect(pageBase).toBe('/pages/');
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import App from './App.jsx';

vi.mock('./pages/dashboardRuntime.js', () => ({ initDashboardRuntime: vi.fn() }));
vi.mock('./pages/sandboxRuntime.js', () => ({ initSandboxRuntime: vi.fn() }));
vi.mock('./pages/knowledgeGraphRuntime.js', () => ({ initKnowledgeGraphRuntime: vi.fn() }));
vi.mock('./pages/boxplotAnalysisRuntime.js', () => ({ initBoxplotAnalysisRuntime: vi.fn() }));
vi.mock('./pages/correlationAnalysisRuntime.js', () => ({ initCorrelationAnalysisRuntime: vi.fn() }));
vi.mock('./pages/provinceComparisonRuntime.js', () => ({ initProvinceComparisonRuntime: vi.fn() }));
vi.mock('./pages/trendAnalysisRuntime.js', () => ({ initTrendAnalysisRuntime: vi.fn() }));

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/index.html');
});

describe('React legacy home shell', () => {
  test('renders the legacy business homepage through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/index.html');
    render(<App />);

    expect(screen.getAllByRole('heading', { name: '海河六域' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /数据大屏/ })[0]).toHaveAttribute('href', '/pages/dashboard.html');
    expect(screen.getAllByRole('link', { name: /流域时空推演沙盘/ })[0]).toHaveAttribute('href', '/pages/sandbox.html');
    expect(screen.getAllByRole('link', { name: /智能问答/ })[0]).toHaveAttribute('href', '/pages/chat.html');
  });

  test('renders the hand-authored homepage data hooks through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/index.html');
    render(<App />);

    expect(document.getElementById('particleCanvas')).toBeInTheDocument();
    expect(document.getElementById('heroGraphNodeCount')).toBeInTheDocument();
    expect(document.getElementById('overviewGraphNodeCount')).toBeInTheDocument();
    expect(document.getElementById('overviewGraphLinkCount')).toBeInTheDocument();
    expect(document.getElementById('overviewStationCount')).toBeInTheDocument();
  });

  test('renders legacy subpages through React based on the current URL', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/dashboard.html');
    render(<App />);

    expect(screen.getAllByText('数据大屏').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /流域时空推演沙盘/ })[0]).toHaveAttribute('href', '/pages/sandbox.html');
  });

  test('renders the hand-authored dashboard mount points through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/dashboard.html');
    render(<App />);

    expect(screen.getAllByText('数据大屏').length).toBeGreaterThan(0);
    expect(document.getElementById('mapChart')).toBeInTheDocument();
    expect(document.getElementById('trendChart')).toBeInTheDocument();
    expect(document.getElementById('provinceButtons')).toBeInTheDocument();
    expect(document.getElementById('loadingMask')).toBeInTheDocument();
    expect(document.getElementById('qGraph')).toBeInTheDocument();
    expect(document.getElementById('indicatorRadarChart')).toBeInTheDocument();
  });

  test.each([
    ['knowledge-graph.html', 'knowledgeGraph', 'searchInput', 'loadingMask'],
    ['sandbox.html', 'timeChart', 'indicatorSelect', 'decisionReport'],
    ['boxplot-analysis.html', 'boxplotGrid', 'statsTableBody', 'outlierModal'],
    ['correlation-analysis.html', 'heatmapChart', 'detailPanel', 'featureContainer'],
    ['province-comparison.html', 'barChart', 'rankingTableBody', 'suggestionsContainer'],
    ['trend-analysis.html', 'doChart', 'seasonChart', 'trendConclusion'],
  ])('renders the hand-authored %s mount points through React', (pageName, ...ids) => {
    window.history.replaceState(null, '', `http://127.0.0.1:8000/pages/${pageName}`);
    render(<App />);

    ids.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
  });

  test('renders the hand-authored login page through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/login.html');
    render(<App />);

    expect(screen.getByRole('heading', { name: '登录海河六域' })).toBeInTheDocument();
    expect(screen.getByLabelText('账号')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '忘记密码?' })).toHaveAttribute('href', '/pages/forgot-password.html');
  });

  test('renders the hand-authored forgot password page through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/forgot-password.html');
    render(<App />);

    expect(screen.getByRole('heading', { name: '重置登录密码' })).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱验证码')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回登录页' })).toHaveAttribute('href', '/pages/login.html');
  });

  test('renders the hand-authored register page through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/register.html');
    render(<App />);

    expect(screen.getByRole('heading', { name: '创建平台账号' })).toBeInTheDocument();
    expect(screen.getByLabelText('账号')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByLabelText('学生')).toHaveAttribute('name', 'tag');
    expect(screen.getByLabelText(/我已阅读并同意/)).toHaveAttribute('id', 'agreeTerms');
    expect(screen.getByRole('link', { name: '立即登录' })).toHaveAttribute('href', '/pages/login.html');
  });

  test('renders the hand-authored chat page through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/chat.html');
    render(<App />);

    expect(screen.getByRole('heading', { name: '流域智能问答助手' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入您的问题...')).toHaveAttribute('id', 'messageInput');
    expect(screen.getByText('热门问题')).toBeInTheDocument();
    expect(screen.getByText('暂无历史记录')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /什么是 COD/ })[0]).toHaveClass('hot-question');
  });

  test('renders the hand-authored profile page through React', () => {
    window.history.replaceState(null, '', 'http://127.0.0.1:8000/pages/profile.html');
    render(<App />);

    expect(screen.getByRole('heading', { name: '个人中心' })).toBeInTheDocument();
    expect(screen.getByLabelText('显示名称')).toHaveAttribute('id', 'nickName');
    expect(screen.getByLabelText('默认进入模块')).toHaveAttribute('id', 'defaultModule');
    expect(screen.getByLabelText('当前密码')).toHaveAttribute('id', 'currentPassword');
    expect(screen.getByRole('button', { name: '保存资料' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '立即验证' })).toHaveLength(2);
  });
});

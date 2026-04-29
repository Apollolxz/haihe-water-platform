import BoxplotAnalysisPage from './BoxplotAnalysisPage.jsx';
import ChatPage from './ChatPage.jsx';
import CorrelationAnalysisPage from './CorrelationAnalysisPage.jsx';
import DashboardPage from './DashboardPage.jsx';
import ForgotPasswordPage from './ForgotPasswordPage.jsx';
import IndexPage from './IndexPage.jsx';
import KnowledgeGraphPage from './KnowledgeGraphPage.jsx';
import LoginPage from './LoginPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import ProvinceComparisonPage from './ProvinceComparisonPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import SandboxPage from './SandboxPage.jsx';
import TrendAnalysisPage from './TrendAnalysisPage.jsx';
import { definePage } from './pageRegistry.js';

export const pageMetadata = {
  'boxplot-analysis.html': { title: '海河六域 - 指标分布与异常预警专项屏', scripts: [] },
  'chat.html': { title: '海河六域 - 智能问答', scripts: [] },
  'correlation-analysis.html': { title: '海河六域 - 指标相关性分析专项屏', scripts: [] },
  'dashboard.html': { title: '海河六域・水质时空演变智能治理系统', scripts: [] },
  'forgot-password.html': { title: '海河六域 - 忘记密码', scripts: [] },
  'index.html': { title: '海河六域 - 流域水质时空演变与知识图谱智能治理系统', scripts: [] },
  'knowledge-graph.html': { title: '海河六域｜知识图谱', scripts: [] },
  'login.html': { title: '海河六域 - 登录', scripts: [] },
  'profile.html': { title: '海河六域 - 个人中心', scripts: [] },
  'province-comparison.html': { title: '海河六域 - 省际空间对比专项屏', scripts: [] },
  'register.html': { title: '海河六域 - 注册', scripts: [] },
  'sandbox.html': { title: '流域时空推演沙盘｜模型预测与多维验证', scripts: [] },
  'trend-analysis.html': { title: '海河六域 - 时序趋势专项屏', scripts: [] },
};

export const nativePages = {
  'boxplot-analysis.html': definePage(pageMetadata['boxplot-analysis.html'], BoxplotAnalysisPage),
  'chat.html': definePage(pageMetadata['chat.html'], ChatPage),
  'correlation-analysis.html': definePage(pageMetadata['correlation-analysis.html'], CorrelationAnalysisPage),
  'dashboard.html': definePage(pageMetadata['dashboard.html'], DashboardPage),
  'forgot-password.html': definePage(pageMetadata['forgot-password.html'], ForgotPasswordPage),
  'index.html': definePage(pageMetadata['index.html'], IndexPage),
  'knowledge-graph.html': definePage(pageMetadata['knowledge-graph.html'], KnowledgeGraphPage),
  'login.html': definePage(pageMetadata['login.html'], LoginPage),
  'profile.html': definePage(pageMetadata['profile.html'], ProfilePage),
  'province-comparison.html': definePage(pageMetadata['province-comparison.html'], ProvinceComparisonPage),
  'register.html': definePage(pageMetadata['register.html'], RegisterPage),
  'sandbox.html': definePage(pageMetadata['sandbox.html'], SandboxPage),
  'trend-analysis.html': definePage(pageMetadata['trend-analysis.html'], TrendAnalysisPage),
};

export default nativePages;

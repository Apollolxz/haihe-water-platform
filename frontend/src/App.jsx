import { useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Database,
  GitBranch,
  Globe2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import './styles.css';

const basePath = import.meta.env.BASE_URL || '/';
const withBase = (path) => `${basePath.replace(/\/$/, '')}${path}`;

const navItems = [
  { label: '首页', href: withBase('/pages/index.html'), icon: LayoutDashboard },
  { label: '数据大屏', href: withBase('/pages/dashboard.html'), icon: BarChart3 },
  { label: '流域时空推演沙盘', href: withBase('/pages/sandbox.html'), icon: Globe2, featured: true },
  { label: '知识图谱', href: withBase('/pages/knowledge-graph.html'), icon: GitBranch },
  { label: '智能问答', href: withBase('/pages/chat.html'), icon: Bot },
];

const capabilities = [
  {
    title: '水质态势感知',
    text: '汇聚监测断面、关键指标和区域趋势，支持流域运行状态快速研判。',
    icon: Activity,
  },
  {
    title: '治理决策推演',
    text: '面向沙盘预测、风险模拟和治理方案比选，保留原有模型接口接入空间。',
    icon: ShieldCheck,
  },
  {
    title: '知识图谱溯源',
    text: '连接污染事件、监测站点和关联实体，支撑超标原因追踪。',
    icon: Database,
  },
];

function NavLink({ item }) {
  const Icon = item.icon;

  return (
    <a className={item.featured ? 'nav-link nav-link-featured' : 'nav-link'} href={item.href}>
      <Icon aria-hidden="true" size={18} />
      <span>{item.label}</span>
    </a>
  );
}

function Metric({ value, label }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Capability({ item }) {
  const Icon = item.icon;

  return (
    <article className="capability">
      <div className="capability-icon">
        <Icon aria-hidden="true" size={22} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  );
}

function BasinVisual() {
  return (
    <section className="basin-visual" aria-label="流域态势概览">
      <div className="visual-toolbar">
        <span>Haihe Basin</span>
        <span className="status-dot">运行中</span>
      </div>
      <div className="basin-map">
        <div className="river river-main" />
        <div className="river river-branch river-branch-a" />
        <div className="river river-branch river-branch-b" />
        <span className="station station-a" />
        <span className="station station-b" />
        <span className="station station-c" />
        <span className="station station-d" />
      </div>
      <div className="visual-grid">
        <Metric value="6" label="省市域" />
        <Metric value="24h" label="态势刷新" />
        <Metric value="Neo4j" label="图谱引擎" />
      </div>
    </section>
  );
}

export default function App() {
  useEffect(() => {
    if (basePath !== '/') {
      window.location.replace(withBase('/pages/index.html'));
    }
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href={withBase('/pages/index.html')} aria-label="海河六域首页">
          <span className="brand-mark">
            <Waves aria-hidden="true" size={24} />
          </span>
          <span>
            <strong>海河六域</strong>
            <small>流域水质时空演变与知识图谱智能治理系统</small>
          </span>
        </a>
        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles aria-hidden="true" size={16} />
              <span>React 前端框架已接入</span>
            </div>
            <h1>海河六域</h1>
            <p>
              面向海河流域水质监测、图谱溯源和治理推演的业务前端。当前 React
              版本先提供首页、工程化构建和旧页面入口，后续可逐页组件化迁移。
            </p>
            <div className="hero-actions">
              <a className="primary-action" href={withBase('/pages/sandbox.html')}>
                打开推演沙盘
                <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className="secondary-action" href={withBase('/pages/dashboard.html')}>
                查看数据大屏
              </a>
            </div>
          </div>
          <BasinVisual />
        </section>

        <section className="capability-grid" aria-label="核心能力">
          {capabilities.map((item) => (
            <Capability key={item.title} item={item} />
          ))}
        </section>
      </main>
    </div>
  );
}

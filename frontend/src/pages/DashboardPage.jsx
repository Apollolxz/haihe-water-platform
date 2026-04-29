import '../../assets/styles/dashboard-screen.css';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function initDashboardRuntime() {
  let cleanup;
  let cancelled = false;

  import('./dashboardRuntime.js').then(async ({ initDashboardRuntime: initRuntime }) => {
    const runtimeCleanup = await initRuntime();
    if (cancelled) {
      runtimeCleanup?.();
    } else {
      cleanup = runtimeCleanup;
    }
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}

function PageLink({ href, className, children, title }) {
  return (
    <a href={href} data-page-link={href} className={className} title={title}>
      {children}
    </a>
  );
}

function DashboardHeader() {
  const links = [
    ['index.html', 'fa-home', '首页', 'nav-link'],
    ['dashboard.html', 'fa-dashboard', '数据大屏', 'nav-link active'],
    ['sandbox.html', 'fa-globe', '流域时空推演沙盘', 'nav-core mx-2'],
    ['knowledge-graph.html', 'fa-project-diagram', '知识图谱', 'nav-link'],
    ['chat.html', 'fa-robot', '智能问答', 'nav-link'],
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10 dashboard-topbar">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
              <i className="fa fa-tint text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">海河六域</h1>
              <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1">
            {links.map(([href, icon, label, className]) => (
              <PageLink href={href} className={className} key={href}>
                <i className={`fa ${icon} mr-2`}></i>
                <span>{label}</span>
              </PageLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <form
              className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-white/10 transition-colors"
              data-nav-search
            >
              <i className="fa fa-search text-gray-400 mr-2"></i>
              <input
                type="search"
                className="w-40 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                placeholder="搜索功能或页面"
              />
            </form>
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <i className="fa fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                  <i className="fa fa-user text-white"></i>
                </div>
                <span className="text-sm font-medium text-gray-300 hidden md:inline" id="userName">
                  用户名
                </span>
                <i className="fa fa-chevron-down text-xs text-gray-400"></i>
              </button>
              <div
                className="absolute right-0 mt-2 w-48 bg-dark-light rounded-lg shadow-2xl py-2 z-50 hidden border border-white/10"
                id="userMenu"
              >
                <PageLink
                  href="profile.html"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <i className="fa fa-user-o mr-2"></i>个人中心
                </PageLink>
                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <i className="fa fa-cog mr-2"></i>设置
                </a>
                <div className="border-t border-white/10 my-1"></div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  data-logout-link
                >
                  <i className="fa fa-sign-out mr-2"></i>退出登录
                </a>
              </div>
            </div>

            <button className="md:hidden text-gray-400 hover:text-white" id="mobileMenuBtn">
              <i className="fa fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-dark-light border-t border-white/10 hidden dashboard-mobile-nav" id="mobileMenu">
        <div className="container mx-auto px-4 py-2 space-y-1">
          {links.map(([href, icon, label, className]) => (
            <PageLink
              href={href}
              className={
                className.includes('active') || className.includes('nav-core')
                  ? 'block px-4 py-3 text-white bg-white/10 rounded-lg'
                  : 'block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors'
              }
              key={href}
            >
              <i className={`fa ${icon} mr-2`}></i>
              {label}
            </PageLink>
          ))}
        </div>
      </div>
    </header>
  );
}

function KpiCards() {
  return (
    <div className="kpi-cards" id="kpiCards">
      <div className="kpi-card">
        <div className="kpi-label">综合水质指数</div>
        <div className="kpi-value" id="kpiScore">--</div>
        <div className="kpi-bar">
          <span id="kpiScoreBar"></span>
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">综合等级</div>
        <div className="kpi-value" id="kpiLevel">--</div>
        <div className="kpi-level-dot" id="kpiLevelDot"></div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">监测站点</div>
        <div className="kpi-value" id="kpiStations">--</div>
        <div className="kpi-sublabel">个活跃站点</div>
      </div>
      <div className="kpi-card alert">
        <div className="kpi-label">30天异常记录</div>
        <div className="kpi-value" id="kpiAlerts">--</div>
        <div className="kpi-sublabel">项超标告警</div>
      </div>
    </div>
  );
}

function DashHeaderPanel() {
  return (
    <div className="dash-header">
      <div className="dash-header-left">
        <div className="dash-title-group">
          <h1 id="pageTitle">海河流域水质数据大屏</h1>
        </div>
        <div className="scope-badge" id="currentScope">
          全流域宏观水质总览
        </div>
        <div className="dash-meta-row">
          <span className="meta-pill">
            <i className="fa fa-map-marker mr-1"></i>
            <strong id="metaRange">京津冀晋鲁豫 6 省市</strong>
          </span>
          <span className="meta-pill">
            <i className="fa fa-flask mr-1"></i>
            <strong id="metaIndicators">11 项核心水质指标</strong>
          </span>
          <span className="meta-pill">
            <i className="fa fa-clock-o mr-1"></i>
            <span id="metaCycle">历史监测 / 模型预测</span>
          </span>
        </div>
      </div>
      <div className="dash-header-right">
        <KpiCards />
        <div className="dash-time" id="metaClock">
          --
        </div>
      </div>
    </div>
  );
}

function LeftPanels() {
  return (
    <aside className="dash-side left">
      <Panel icon="fa-map-signs" title="省份切换">
        <div className="province-pills" id="provinceButtons"></div>
      </Panel>
      <Panel icon="fa-trophy" title="省份水质排名">
        <div className="chart-side" id="provinceRankChart"></div>
      </Panel>
      <Panel icon="fa-exclamation-circle" title="污染物超标排行">
        <div className="chart-side" id="pollutantChart"></div>
      </Panel>
    </aside>
  );
}

function Panel({ icon, title, children, className = '' }) {
  return (
    <div className={`side-panel ${className}`}>
      <div className="side-head">
        <i className={`fa ${icon}`}></i>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function CenterPanels() {
  return (
    <main className="dash-center">
      <div className="map-panel">
        <div className="corner-deco tl"></div>
        <div className="corner-deco tr"></div>
        <div className="corner-deco bl"></div>
        <div className="corner-deco br"></div>
        <div className="map-head">
          <h2>
            <i className="fa fa-globe"></i> 海河流域地理空间
          </h2>
          <span className="map-hint">
            <i className="fa fa-hand-o-up mr-1"></i>点击省份切换 &middot; 双击回到全流域
          </span>
        </div>
        <div className="chart-map" id="mapChart"></div>
      </div>

      <div className="trend-panel center-trend-panel">
        <div className="trend-head">
          <h3>
            <i className="fa fa-area-chart"></i> 全域时间趋势轴
          </h3>
          <span className="trend-meta" id="trendMeta"></span>
        </div>
        <div className="chart-trend" id="trendChart"></div>
      </div>
    </main>
  );
}

function RightPanels() {
  const links = [
    ['trend-analysis.html', 'fa-line-chart', '时序趋势', 'qTrend', '时序趋势专项分析'],
    ['boxplot-analysis.html', 'fa-bar-chart', '箱线分析', 'qBox', '指标分布与异常预警'],
    ['correlation-analysis.html', 'fa-fire', '相关性', 'qCorr', '指标相关性分析'],
    ['province-comparison.html', 'fa-map', '省份对比', 'qCompare', '省际空间对比'],
    ['sandbox.html', 'fa-globe', '推演沙盘', 'qSandbox', '流域时空推演沙盘'],
    ['knowledge-graph.html', 'fa-project-diagram', '知识图谱', 'qGraph', '知识图谱'],
  ];

  return (
    <aside className="dash-side right">
      <Panel icon="fa-dashboard" title="核心水质指标">
        <div className="chart-side" id="indicatorRadarChart"></div>
      </Panel>
      <Panel icon="fa-cogs" title="模型精度">
        <div className="model-mini">
          <div className="chart-mini" id="modelChart"></div>
          <div className="model-caption" id="modelMeta"></div>
        </div>
      </Panel>
      <Panel icon="fa-th-large" title="深度分析" className="links-panel">
        <div className="quick-links">
          {links.map(([href, icon, label, id, title]) => (
            <PageLink href={href} className="q-card" title={title} key={href}>
              <div className="q-icon">
                <i className={`fa ${icon}`}></i>
              </div>
              <div className="q-text">{label}</div>
              <div className="q-data" id={id}>
                --
              </div>
            </PageLink>
          ))}
        </div>
      </Panel>
    </aside>
  );
}

function HiddenDashboardMounts() {
  const ids = [
    'indicatorWindow',
    'indicatorNotes',
    'scopeScore',
    'scopeScoreFoot',
    'scopeLevel',
    'scopeLevelFoot',
    'scopeStations',
    'scopeStationsFoot',
    'scopeAlerts',
    'scopeAlertsFoot',
    'modelScope',
    'provinceRanking',
    'pollutantRanking',
    'indicatorGrid',
  ];

  return (
    <div style={{ display: 'none' }}>
      {ids.map((id) => (
        <div id={id} key={id}>
          --
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage({ page }) {
  useLegacyPageRuntime(page, initDashboardRuntime);

  return (
    <>
      <canvas id="particleCanvas"></canvas>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>
      <DashboardHeader />
      <div className="dashboard-shell">
        <DashHeaderPanel />
        <div className="dash-body">
          <LeftPanels />
          <CenterPanels />
          <RightPanels />
        </div>
      </div>
      <div className="loading-mask hidden" id="loadingMask">
        <div className="spinner"></div>
        <div className="loading-text">数据同步中...</div>
      </div>
      <HiddenDashboardMounts />
    </>
  );
}


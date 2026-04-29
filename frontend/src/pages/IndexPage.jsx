import { loadHomeData, loadPlatformStats } from '../features/home/homeData.js';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

const homeStyles = `
body {
  background-color: #0f172a;
  overflow-x: hidden;
}
`;

function PageLink({ href, className, children }) {
  return (
    <a href={href} data-page-link={href} className={className}>
      {children}
    </a>
  );
}

const navLinks = [
  ['index.html', 'fa-home', '首页', 'nav-link active'],
  ['dashboard.html', 'fa-dashboard', '数据大屏', 'nav-link'],
  ['sandbox.html', 'fa-globe', '流域时空推演沙盘', 'nav-core mx-2'],
  ['knowledge-graph.html', 'fa-project-diagram', '知识图谱', 'nav-link'],
  ['chat.html', 'fa-comments-o', '智能问答', 'nav-link'],
];

function HomeHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10 scrollbar-safe-topbar">
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
            {navLinks.map(([href, icon, label, className]) => (
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

      <div className="md:hidden bg-dark-light border-t border-white/10 hidden" id="mobileMenu">
        <div className="container mx-auto px-4 py-2 space-y-1">
          {navLinks.map(([href, icon, label, className]) => (
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

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark"></div>
        <canvas id="particleCanvas" className="absolute inset-0 w-full h-full"></canvas>
      </div>
      <div className="water-wave"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 space-y-8 animate-slide-up">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300">四大核心能力已接入</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              守护海河
              <br />
              <span className="text-gradient">水质未来</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
              围绕海河流域监测数据，整合数据大屏、流域时空推演沙盘、知识图谱与智能问答，支撑态势感知、风险推演、图谱溯源与辅助决策。
            </p>
            <div className="flex flex-wrap gap-4">
              <PageLink href="sandbox.html" className="btn-primary flex items-center space-x-2">
                <i className="fa fa-globe"></i>
                <span>进入沙盘</span>
              </PageLink>
              <PageLink href="dashboard.html" className="btn-secondary flex items-center space-x-2">
                <i className="fa fa-line-chart"></i>
                <span>查看大屏</span>
              </PageLink>
            </div>
            <div className="flex items-center space-x-8 pt-8 border-t border-white/10">
              <HeroMetric value="6" label="省市联动" />
              <HeroMetric value="--" label="图谱节点" id="heroGraphNodeCount" />
              <HeroMetric value="4" label="核心模块" />
            </div>
          </div>

          <div className="w-full lg:w-1/2 animate-slide-down">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-water rounded-3xl blur-3xl opacity-30 animate-pulse-slow"></div>
              <div className="relative card-glass rounded-3xl p-8 card-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">平台核心入口</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                    在线运行
                  </span>
                </div>
                <div className="space-y-4">
                  <EntryCard href="dashboard.html" icon="fa-bar-chart" color="blue" title="数据大屏" desc="趋势分析与多维对比" tag="实时查看" meta="dashboard" />
                  <EntryCard href="sandbox.html" icon="fa-globe" color="cyan" title="时空推演沙盘" desc="风险模拟与 AI 决策" tag="核心入口" meta="sandbox" />
                  <EntryCard href="knowledge-graph.html" icon="fa-share-alt" color="teal" title="知识图谱" desc="上游链路与超标溯源" tag="图谱联动" meta="neo4j" />
                  <EntryCard href="chat.html" icon="fa-comments-o" color="green" title="智能问答" desc="DeepSeek 与本地知识协同" tag="即时问答" meta="chat" />
                </div>
                <PageLink href="sandbox.html" className="mt-6 flex items-center justify-center space-x-2 text-primary hover:text-white transition-colors">
                  <span>从流域时空推演沙盘开始体验</span>
                  <i className="fa fa-arrow-right"></i>
                </PageLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ value, label, id }) {
  return (
    <div>
      <p className="text-3xl font-bold text-white" id={id}>
        {value}
      </p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

const colorClass = {
  blue: ['bg-blue-500/20', 'text-blue-400'],
  cyan: ['bg-cyan-500/20', 'text-cyan-400'],
  teal: ['bg-teal-500/20', 'text-teal-400'],
  green: ['bg-green-500/20', 'text-green-400'],
};

function EntryCard({ href, icon, color, title, desc, tag, meta }) {
  const [bg, text] = colorClass[color];
  return (
    <PageLink href={href} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
          <i className={`fa ${icon} ${text}`}></i>
        </div>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-gray-400">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${text}`}>{tag}</p>
        <p className="text-xs text-gray-400">{meta}</p>
      </div>
    </PageLink>
  );
}

function SectionTitle({ title, children }) {
  return (
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
      {children ? <p className="text-gray-400 max-w-2xl mx-auto">{children}</p> : null}
    </div>
  );
}

function CoreFeatures() {
  const features = [
    ['dashboard.html', 'fa-line-chart', 'blue', '数据大屏', '查看海河流域水质指标的时序变化、相关性、热力分布和省市对比。'],
    ['sandbox.html', 'fa-globe', 'cyan', '流域时空推演沙盘', '按省市、模型和时间进行风险推演，并联动 AI 决策辅助分析。'],
    ['knowledge-graph.html', 'fa-share-alt', 'teal', '知识图谱', '查看污染物、监测站点和上游链路之间的关系，支持超标溯源。'],
    ['chat.html', 'fa-comments-o', 'green', '智能问答', '围绕页面使用、指标解释和治理思路进行快速问答。'],
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <SectionTitle title="核心功能" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(([href, icon, color, title, desc]) => {
            const [bg, text] = colorClass[color];
            return (
              <PageLink href={href} className="feature-card group block" key={href}>
                <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fa ${icon} ${text} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-gray-400 mb-4">{desc}</p>
                <span className="text-primary text-sm font-medium">
                  进入页面 <i className="fa fa-arrow-right ml-1"></i>
                </span>
              </PageLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BusinessLoop() {
  const steps = [
    ['01', 'fa-database', '数据接入', '汇聚监测站点、水质指标和时间序列数据。'],
    ['02', 'fa-area-chart', '态势分析', '通过大屏快速识别重点区域、指标和变化趋势。'],
    ['03', 'fa-globe', '时空推演', '在沙盘中进行模型推演和风险场景模拟。'],
    ['04', 'fa-share-alt', '图谱溯源', '利用知识图谱追踪上游链路和超标关联。'],
    ['05', 'fa-comments-o', '问答解释', '用智能问答补充指标含义、页面使用和治理建议。'],
  ];

  return (
    <section className="py-24 relative bg-dark-light/50">
      <div className="container mx-auto px-4">
        <SectionTitle title="平台业务闭环" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map(([number, icon, title, desc]) => (
            <div className="relative group" key={number}>
              <div className="feature-card h-full">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-bold text-white/10">{number}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <i className={`fa ${icon} text-primary text-xl`}></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Overview() {
  const stats = [
    ['fa-map', 'blue', '6', '省市协同分析', '区域联动', '60%'],
    ['fa-database', 'cyan', '--', '监测站点', '监测接入', '40%', 'overviewStationCount'],
    ['fa-share-alt', 'green', '--', '知识节点', '图谱在线', '72%', 'overviewGraphNodeCount'],
    ['fa-link', 'teal', '--', '关系链路', '溯源分析', '88%', 'overviewGraphLinkCount'],
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <SectionTitle title="平台能力概览" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(([icon, color, value, label, status, width, id]) => (
            <StatCard icon={icon} color={color} value={value} label={label} status={status} width={width} id={id} key={label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, color, value, label, status, width, id }) {
  const [bg, text] = colorClass[color];
  return (
    <div className="stat-card group hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
          <i className={`fa ${icon} ${text} text-xl`}></i>
        </div>
        <span className="text-xs text-green-400 flex items-center">
          <i className="fa fa-circle mr-1"></i>
          {status}
        </span>
      </div>
      <p className="text-4xl font-bold text-white mb-1" id={id}>
        {value}
      </p>
      <p className="text-sm text-gray-400">{label}</p>
      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${text.replace('text-', 'bg-')} rounded-full`} style={{ width }}></div>
      </div>
    </div>
  );
}

function Scenarios() {
  const cards = [
    ['fa-area-chart', 'from-blue-600 to-blue-800', '全局态势研判', '从数据大屏查看相关性、热力图、时序和省份对比，快速锁定需要关注的区域和指标。', '数据大屏', 'dashboard.html'],
    ['fa-globe', 'from-cyan-600 to-cyan-800', '风险推演决策', '在流域时空推演沙盘中按省市、模型和日期进行演化模拟，并查看 AI 辅助决策结果。', '流域沙盘', 'sandbox.html'],
    ['fa-share-alt', 'from-teal-600 to-teal-800', '图谱溯源解释', '进入知识图谱追踪上游链路，再结合智能问答补充指标解释和治理背景说明。', '图谱 + 问答', 'knowledge-graph.html'],
  ];

  return (
    <section className="py-24 relative bg-dark-light/50">
      <div className="container mx-auto px-4">
        <SectionTitle title="典型使用场景" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(([icon, gradient, title, desc, tag, href]) => (
            <div className="feature-card group" key={title}>
              <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className={`fa ${icon} text-6xl text-white/20`}></i>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
              </div>
              <p className="text-gray-400 mb-4">{desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-400">{tag}</span>
                <PageLink href={href} className="text-primary hover:text-white transition-colors">
                  立即查看 <i className="fa fa-arrow-right ml-1"></i>
                </PageLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KnowledgeGraphLinks() {
  const cards = [
    ['fa-search', '站点溯源', '从监测站点出发，查看上游站点、行政区和污染物之间的关联路径。'],
    ['fa-warning', '超标查询', '围绕异常指标查看可能关联的上下游节点，辅助定位风险来源。'],
    ['fa-random', '沙盘联动', '将图谱中识别出的重点区域带入时空推演沙盘，继续进行情景模拟。'],
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">知识图谱联动能力</h2>
          </div>
          <PageLink href="knowledge-graph.html" className="btn-secondary">
            查看完整图谱 <i className="fa fa-arrow-right ml-2"></i>
          </PageLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(([icon, title, desc]) => (
            <div className="feature-card" key={title}>
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-5">
                <i className={`fa ${icon} text-teal-400 text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
              <p className="text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
          <div className="absolute inset-0 bg-gradient-water opacity-10"></div>
          <div className="relative p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">从首页直达核心模块</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              先看全局态势，再做时空推演、图谱溯源和智能解释，让首页真正成为现在这个项目的起点。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <PageLink href="sandbox.html" className="btn-primary text-lg px-8 py-4">
                进入推演沙盘
              </PageLink>
              <PageLink href="knowledge-graph.html" className="btn-secondary text-lg px-8 py-4">
                打开知识图谱
              </PageLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className="bg-dark-light border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                <i className="fa fa-tint text-white"></i>
              </div>
              <h3 className="text-lg font-semibold text-white">海河六域</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              面向海河流域水质分析与治理决策，整合数据大屏、时空推演、知识图谱与智能问答。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['index.html', '首页'],
                ['dashboard.html', '数据大屏'],
                ['sandbox.html', '流域时空推演沙盘'],
                ['knowledge-graph.html', '知识图谱'],
                ['chat.html', '智能问答'],
              ].map(([href, label]) => (
                <li key={href}>
                  <PageLink href={href} className="text-gray-400 hover:text-white transition-colors">
                    {label}
                  </PageLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">关注我们</h3>
            <div className="flex space-x-3">
              {['fa-weixin', 'fa-weibo', 'fa-github'].map((icon) => (
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors" key={icon}>
                  <i className={`fa ${icon} text-gray-400 hover:text-white`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-500 text-sm">© 2026 海河六域 - 流域水质时空演变与知识图谱智能治理系统 版权所有</p>
        </div>
      </div>
    </footer>
  );
}

export default function IndexPage({ page }) {
  useLegacyPageRuntime(page, () => {
    loadHomeData();
    loadPlatformStats();
  });

  return (
    <>
      <style>{homeStyles}</style>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>
      <HomeHeader />
      <main className="pt-16 relative">
        <Hero />
        <CoreFeatures />
        <BusinessLoop />
        <Overview />
        <Scenarios />
        <KnowledgeGraphLinks />
        <CTA />
      </main>
      <HomeFooter />
    </>
  );
}

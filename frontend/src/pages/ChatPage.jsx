import { initChatPageInteractions } from '../features/chat/chatController.js';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

const chatStyles = `.bg-gradient-eco {
                background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
            }
            .bg-gradient-dark {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            }
            .bg-gradient-wave {
                background: linear-gradient(-45deg, #06b6d4, #10b981, #3b82f6, #06b6d4);
                background-size: 400% 400%;
                animation: wave 10s ease infinite;
            }
            .text-gradient {
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                background-image: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
            }
            .card-shadow {
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
            }
            .glass {
                background: rgba(30, 41, 59, 0.7);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .glass-light {
                background: rgba(49, 64, 84, 0.7);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .nav-link {
                position: relative;
                padding: 0.5rem 1rem;
                color: #9ca3af;
                transition: color 300ms ease;
            }
            .nav-link::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 2px;
                background: #06b6d4;
                transition: width 300ms ease;
            }
            .nav-link:hover {
                color: #06b6d4;
            }
            .nav-link:hover::after {
                width: 100%;
            }
            .nav-link.active {
                color: #06b6d4;
                font-weight: 500;
            }
            .nav-link.active::after {
                width: 100%;
            }
            .nav-core {
                position: relative;
                display: flex;
                align-items: center;
                padding: 0.5rem 1.25rem;
                border-radius: 9999px;
                color: #ffffff;
                font-size: 0.875rem;
                font-weight: 600;
                box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.35);
                transition: all 300ms ease;
                background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
                animation: glow-pulse 2s infinite;
            }
            @keyframes glow-pulse {
                0%, 100% { box-shadow: 0 0 8px rgba(6,182,212,0.6); transform: scale(1); }
                50% { box-shadow: 0 0 20px rgba(6,182,212,0.9); transform: scale(1.02); }
            }
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes slideUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes wave {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes pulseGlow {
                0% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.5); }
                100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(16, 185, 129, 0.5); }
            }
            @keyframes pulse {
                50% { opacity: 0.5; }
            }
            .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
            .animate-slide-up { animation: slideUp 0.5s ease-in-out; }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-glow { animation: pulseGlow 2s ease-in-out infinite alternate; }
            .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .chat-message {
                max-width: 80%;
                padding: 1rem;
                border-radius: 0.5rem;
                animation: fadeIn 0.5s ease-in-out;
            }
            .user-message {
                align-self: flex-end;
                color: #ffffff;
                background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
            }
            .bot-message {
                align-self: flex-start;
                color: #e2e8f0;
                background: rgba(49, 64, 84, 0.7);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            .typing-dot {
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 9999px;
                background: #06b6d4;
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .input-glow {
                box-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
                transition: box-shadow 0.3s ease;
            }
            .input-glow:focus {
                box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);
            }`;

function PageLink({ href, className, children }) {
  return (
    <a href={href} data-page-link={href} className={className}>
      {children}
    </a>
  );
}

function Header() {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-eco flex items-center justify-center animate-float animate-glow">
              <i className="fa fa-tint text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-white">海河六域</h1>
          </div>

          <nav className="hidden md:flex space-x-1">
            <PageLink href="index.html" className="nav-link">
              <i className="fa fa-home mr-2"></i>
              <span>首页</span>
            </PageLink>
            <PageLink href="dashboard.html" className="nav-link">
              <i className="fa fa-dashboard mr-2"></i>
              <span>数据大屏</span>
            </PageLink>
            <PageLink href="sandbox.html" className="nav-core mx-2">
              <i className="fa fa-globe mr-2"></i>
              <span>流域时空推演沙盘</span>
            </PageLink>
            <PageLink href="knowledge-graph.html" className="nav-link">
              <i className="fa fa-project-diagram mr-2"></i>
              <span>知识图谱</span>
            </PageLink>
            <PageLink href="chat.html" className="nav-link active">
              <i className="fa fa-question-circle mr-2"></i>
              <span>智能问答</span>
            </PageLink>
          </nav>

          <div className="flex items-center space-x-4">
            <form
              className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-white/10 transition-colors"
              data-nav-search
            >
              <i className="fa fa-search text-gray-400 mr-2"></i>
              <input
                type="search"
                className="w-40 bg-transparent text-sm text-text-light placeholder:text-gray-500 focus:outline-none"
                placeholder="搜索功能或页面"
              />
            </form>
            <button className="text-gray-400 hover:text-primary transition-colors">
              <i className="fa fa-bell text-lg"></i>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                <div className="w-8 h-8 rounded-full bg-dark-lighter flex items-center justify-center">
                  <i className="fa fa-user text-primary"></i>
                </div>
                <span className="text-sm font-medium text-text-light hidden md:inline" id="userName">
                  用户名
                </span>
                <i className="fa fa-chevron-down text-xs text-gray-400"></i>
              </button>

              <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg py-2 z-50 hidden" id="userMenu">
                <PageLink
                  href="profile.html"
                  className="block px-4 py-2 text-sm text-text-light hover:bg-dark-lighter rounded-md"
                >
                  <i className="fa fa-user-o mr-2"></i>个人中心
                </PageLink>
                <a href="#" className="block px-4 py-2 text-sm text-text-light hover:bg-dark-lighter rounded-md">
                  <i className="fa fa-cog mr-2"></i>设置
                </a>
                <div className="border-t border-dark-lighter my-1"></div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-400 hover:bg-dark-lighter rounded-md"
                  data-logout-link
                >
                  <i className="fa fa-sign-out mr-2"></i>退出登录
                </a>
              </div>
            </div>

            <button className="md:hidden text-gray-400 hover:text-primary" id="mobileMenuBtn">
              <i className="fa fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden glass shadow-md hidden" id="mobileMenu">
        <div className="container mx-auto px-4 py-2 space-y-1">
          <PageLink href="index.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
            <i className="fa fa-home mr-2"></i>首页
          </PageLink>
          <PageLink href="dashboard.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
            <i className="fa fa-dashboard mr-2"></i>数据大屏
          </PageLink>
          <PageLink href="sandbox.html" className="block px-4 py-3 text-white rounded-md bg-gradient-eco">
            <i className="fa fa-globe mr-2"></i>流域时空推演沙盘
          </PageLink>
          <PageLink
            href="knowledge-graph.html"
            className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md"
          >
            <i className="fa fa-project-diagram mr-2"></i>知识图谱
          </PageLink>
          <PageLink href="chat.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
            <i className="fa fa-question-circle mr-2"></i>智能问答
          </PageLink>
        </div>
      </div>
    </header>
  );
}

const hotQuestions = [
  '什么是 COD？',
  '数据大屏怎么看六省市对比？',
  '如何在流域时空推演沙盘中查看 AI 决策？',
  '如何从沙盘跳转到知识图谱溯源？',
  '知识图谱里如何查询超标事件？',
];

function ChatMain() {
  return (
    <main className="container mx-auto px-4 py-8 relative z-10">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4">
          <div className="glass rounded-xl card-shadow h-[80vh] flex flex-col animate-fade-in">
            <div className="border-b border-dark-lighter p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-eco flex items-center justify-center animate-float">
                  <i className="fa fa-robot text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">流域智能问答助手</h2>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chatMessages">
              <div className="chat-message bot-message">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
                    <i className="fa fa-robot text-white"></i>
                  </div>
                  <div>
                    <p className="text-sm">
                      您好！我是流域智能问答助手，为您解答页面使用、指标含义和流域治理相关问题。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dark-lighter p-4">
              <form id="chatForm" className="flex space-x-2">
                <input
                  type="text"
                  id="messageInput"
                  className="flex-1 glass-light border border-dark-lighter rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-text-light input-glow"
                  placeholder="请输入您的问题..."
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-eco text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity animate-glow"
                >
                  <i className="fa fa-paper-plane"></i>
                </button>
              </form>
              <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                <button className="text-primary hover:underline" id="clearChatBtn">
                  清空聊天
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/4 space-y-6">
          <div className="glass rounded-xl card-shadow p-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fa fa-fire text-primary mr-2"></i>
              热门问题
            </h3>
            <ul className="space-y-2">
              {hotQuestions.map((question) => (
                <li key={question}>
                  <button className="w-full text-left text-gray-300 hover:text-primary transition-colors text-sm py-2 px-3 rounded-md hover:bg-dark-lighter hot-question">
                    {question}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-xl card-shadow p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fa fa-history text-primary mr-2"></i>
              历史记录
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto" id="historyList">
              <div className="text-sm text-gray-500 italic">暂无历史记录</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="glass py-12 mt-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">关于我们</h3>
            <p className="text-gray-400 text-sm">
              海河六域平台整合数据大屏、流域时空推演沙盘、知识图谱与智能问答，支持流域水环境分析与治理决策。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <PageLink href="index.html" className="hover:text-primary transition-colors">
                  首页
                </PageLink>
              </li>
              <li>
                <PageLink href="dashboard.html" className="hover:text-primary transition-colors">
                  数据大屏
                </PageLink>
              </li>
              <li>
                <PageLink href="sandbox.html" className="hover:text-primary transition-colors">
                  流域时空推演沙盘
                </PageLink>
              </li>
              <li>
                <PageLink href="knowledge-graph.html" className="hover:text-primary transition-colors">
                  知识图谱
                </PageLink>
              </li>
              <li>
                <PageLink href="chat.html" className="hover:text-primary transition-colors">
                  智能问答
                </PageLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">关注我们</h3>
            <div className="flex space-x-4">
              {['fa-weixin', 'fa-weibo', 'fa-github'].map((icon) => (
                <a
                  href="#"
                  key={icon}
                  className="w-10 h-10 rounded-full bg-dark-lighter flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <i className={`fa ${icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-dark-lighter mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 海河六域平台 版权所有</p>
        </div>
      </div>
    </footer>
  );
}

export default function ChatPage({ page }) {
  useLegacyPageRuntime(page, initChatPageInteractions);

  return (
    <>
      <style>{chatStyles}</style>
      <div className="bg-dark min-h-screen text-text-light overflow-x-hidden relative">
        <div id="particles-js" className="fixed inset-0 z-0"></div>
        <div className="fixed inset-0 z-0 opacity-20">
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-wave"></div>
        </div>
        <Header />
        <ChatMain />
        <Footer />
      </div>
    </>
  );
}

import { initAuthPageInteractions } from '../features/auth/authController.js';
import { AuthBackground, authPageStyles } from './authPageShared.jsx';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function FeatureItem({ icon, iconColor, title, description }) {
  return (
    <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
      <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center`}>
        <i className={`fa ${icon}`}></i>
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default function LoginPage({ page, pageName }) {
  useLegacyPageRuntime(page, () => initAuthPageInteractions(pageName));

  return (
    <>
      <style>{authPageStyles}</style>
      <AuthBackground />

      <div className="min-h-screen w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full md:w-1/2 space-y-6 animate-fade-in">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
              <i className="fa fa-tint text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">海河六域</h1>
              <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">登录平台</h2>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            登录后即可进入数据大屏、流域时空推演沙盘、知识图谱与智能问答，在同一平台内完成态势查看、推演决策与图谱溯源。
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <FeatureItem
              icon="fa-database text-primary"
              iconColor="bg-primary/20"
              title="数据大屏"
              description="查看全局态势分析"
            />
            <FeatureItem
              icon="fa-sitemap text-secondary"
              iconColor="bg-secondary/20"
              title="推演沙盘"
              description="联动 AI 决策结果"
            />
            <FeatureItem
              icon="fa-bar-chart text-primary"
              iconColor="bg-primary/20"
              title="知识图谱"
              description="追踪上游溯源链路"
            />
            <FeatureItem
              icon="fa-users text-secondary"
              iconColor="bg-secondary/20"
              title="智能问答"
              description="快速获得解释辅助"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 animate-slide-up">
          <div className="card-glass rounded-2xl p-8 border border-white/10 card-shadow">
            <h2 className="text-2xl font-bold text-center text-white mb-2">登录海河六域</h2>
            <p className="text-center text-sm text-gray-400 mb-6">继续访问四大核心模块与个人使用记录</p>
            <form id="loginForm" className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  账号
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <i className="fa fa-user"></i>
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
                    placeholder="请输入账号"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  密码
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    id="togglePassword"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  >
                    <i className="fa fa-eye-slash"></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                    记住密码
                  </label>
                </div>
                <a
                  href="forgot-password.html"
                  data-page-link="forgot-password.html"
                  className="text-sm text-primary hover:text-white transition-colors"
                >
                  忘记密码?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-water text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                登录并进入平台
              </button>
              <div className="text-center text-sm">
                <span className="text-gray-400">还没有账号?</span>
                <a
                  href="register.html"
                  data-page-link="register.html"
                  className="text-primary font-medium hover:text-white ml-1 transition-colors"
                >
                  立即注册
                </a>
              </div>
            </form>
          </div>
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>© 2026 海河六域 版权所有</p>
          </div>
        </div>
      </div>
    </>
  );
}

import { initAuthPageInteractions } from '../features/auth/authController.js';
import { AuthBackground, AuthBrand, authPageStyles } from './authPageShared.jsx';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

export default function ForgotPasswordPage({ page, pageName }) {
  useLegacyPageRuntime(page, () => initAuthPageInteractions(pageName));

  return (
    <>
      <style>{authPageStyles}</style>
      <AuthBackground />

      <div className="w-full max-w-md mx-auto animate-slide-up relative z-10">
        <AuthBrand
          heading="重置登录密码"
          description="请输入注册邮箱并完成验证，以便继续访问数据大屏、推演沙盘、知识图谱和智能问答。"
        />

        <div className="card-glass rounded-2xl p-8 border border-white/10 card-shadow">
          <form id="forgotPasswordForm" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                邮箱
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <i className="fa fa-envelope"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
                  placeholder="请输入您的邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-400 mb-1">
                邮箱验证码
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <i className="fa fa-shield"></i>
                  </span>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
                    placeholder="请输入邮箱验证码"
                    required
                  />
                </div>
                <button
                  type="button"
                  id="sendCodeBtn"
                  className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
                >
                  发送邮箱验证码
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-1">
                新密码
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <i className="fa fa-lock"></i>
                </span>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
                  placeholder="请设置新密码"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                确认新密码
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <i className="fa fa-lock"></i>
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-water text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              重置密码并返回登录
            </button>
            <div className="text-center text-sm">
              <a
                href="login.html"
                data-page-link="login.html"
                className="text-primary font-medium hover:text-white transition-colors"
              >
                返回登录页
              </a>
            </div>
          </form>
        </div>
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>© 2026 海河六域 版权所有</p>
        </div>
      </div>
    </>
  );
}

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

function TextInput({ id, name = id, type = 'text', label, icon, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <i className={`fa ${icon}`}></i>
        </span>
        <input
          type={type}
          id={id}
          name={name}
          className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  );
}

function RoleOption({ value, label, required = false }) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        name="tag"
        value={value}
        className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter"
        required={required}
      />
      <span className="text-sm text-gray-400">{label}</span>
    </label>
  );
}

export default function RegisterPage({ page, pageName }) {
  useLegacyPageRuntime(page, () => initAuthPageInteractions(pageName));

  return (
    <>
      <style>{authPageStyles}</style>
      <AuthBackground />

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center relative z-10">
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
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            创建账号，进入
            <br />
            <span className="text-gradient">四大核心模块</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            注册后即可统一访问数据大屏、流域时空推演沙盘、知识图谱和智能问答，形成从分析、推演到溯源解释的一体化使用体验。
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <FeatureItem
              icon="fa-share-alt text-primary"
              iconColor="bg-primary/20"
              title="多维分析"
              description="查看省市与指标趋势"
            />
            <FeatureItem
              icon="fa-comments text-secondary"
              iconColor="bg-secondary/20"
              title="推演决策"
              description="进入沙盘联动 AI"
            />
            <FeatureItem
              icon="fa-line-chart text-primary"
              iconColor="bg-primary/20"
              title="图谱溯源"
              description="查看上游链路关系"
            />
            <FeatureItem
              icon="fa-lightbulb-o text-secondary"
              iconColor="bg-secondary/20"
              title="智能问答"
              description="获得页面与指标解释"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 animate-slide-up">
          <div className="card-glass rounded-2xl p-8 border border-white/10 card-shadow">
            <h2 className="text-2xl font-bold text-center text-white mb-2">创建平台账号</h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              完成注册后即可登录并访问当前项目全部核心页面
            </p>
            <form id="registerForm" className="space-y-6">
              <TextInput id="username" label="账号" icon="fa-user" placeholder="请设置账号" />

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
                    placeholder="请设置密码"
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

              <TextInput
                id="confirmPassword"
                type="password"
                label="确认密码"
                icon="fa-lock"
                placeholder="请再次输入密码"
              />
              <TextInput id="email" type="email" label="邮箱" icon="fa-envelope" placeholder="请输入邮箱" />

              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-400 mb-1">
                  验证码
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
                      placeholder="请输入验证码"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    id="sendCodeBtn"
                    className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
                  >
                    发送验证码
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">使用角色</label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleOption value="学生" label="学生" required />
                  <RoleOption value="科研人员" label="科研人员" />
                  <RoleOption value="环保工作者" label="环保工作者" />
                  <RoleOption value="教育工作者" label="教育工作者" />
                  <RoleOption value="企业人员" label="企业人员" />
                  <RoleOption value="其他" label="其他" />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter rounded"
                  required
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-400">
                  我已阅读并同意
                  <a href="#" className="text-primary hover:underline">
                    用户协议
                  </a>
                  和
                  <a href="#" className="text-primary hover:underline">
                    隐私政策
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-water text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                创建账号
              </button>
              <div className="text-center text-sm">
                <span className="text-gray-400">已有账号?</span>
                <a
                  href="login.html"
                  data-page-link="login.html"
                  className="text-primary font-medium hover:text-white ml-1 transition-colors"
                >
                  立即登录
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

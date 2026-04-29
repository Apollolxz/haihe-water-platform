import { initProfilePageInteractions } from '../features/profile/profileController.js';
import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

const profileStyles = `@layer utilities {
            .bg-gradient-water {
                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 45%, #22c55e 100%);
            }
            .card-glass {
                background: rgba(255, 255, 255, 0.04);
                backdrop-filter: blur(14px);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .card-shadow {
                box-shadow: 0 20px 50px -16px rgba(15, 23, 42, 0.55);
            }
            .nav-link {
                @apply relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300;
            }
            .nav-link::after {
                content: '';
                @apply absolute bottom-0 left-1/2 w-0 h-0.5 transition-all duration-300;
                background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
                transform: translateX(-50%);
            }
            .nav-link:hover::after,
            .nav-link.active::after {
                @apply w-full;
            }
            .nav-link.active {
                @apply text-white font-medium;
            }
            .nav-core {
                @apply relative px-5 py-2 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-300 flex items-center;
                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);
            }
            .nav-core:hover {
                box-shadow: 0 0 24px rgba(14, 165, 233, 0.35);
            }
            .input-focus {
                @apply focus:ring-2 focus:ring-primary/60 focus:border-primary focus:outline-none;
            }
            .section-label {
                @apply text-sm uppercase tracking-[0.24em] text-primary/80;
            }
            .stat-card {
                @apply rounded-2xl p-4;
                background: linear-gradient(145deg, rgba(14, 165, 233, 0.09) 0%, rgba(34, 197, 94, 0.08) 100%);
                border: 1px solid rgba(148, 163, 184, 0.14);
            }
            .soft-divider {
                border-color: rgba(255, 255, 255, 0.08);
            }
        }

body {
            background-color: #0f172a;
            overflow-x: hidden;
        }`;

function PageLink({ href, className, children }) {
  return (
    <a href={href} data-page-link={href} className={className}>
      {children}
    </a>
  );
}

function ProfileHeader() {
  const links = [
    ['index.html', 'fa-home', '首页', 'nav-link'],
    ['dashboard.html', 'fa-dashboard', '数据大屏', 'nav-link'],
    ['sandbox.html', 'fa-globe', '流域时空推演沙盘', 'nav-core mx-2'],
    ['knowledge-graph.html', 'fa-project-diagram', '知识图谱', 'nav-link'],
    ['chat.html', 'fa-robot', '智能问答', 'nav-link'],
    ['profile.html', 'fa-user-o', '个人中心', 'nav-link active'],
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10 scrollbar-safe-topbar">
      <div className="container mx-auto px-4">
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
            <button className="text-gray-400 hover:text-white transition-colors">
              <i className="fa fa-search text-lg"></i>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <i className="fa fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                  <i className="fa fa-user text-white"></i>
                </div>
                <span className="text-sm font-medium text-gray-300 hidden md:inline" id="userName">
                  访客
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

function TextField({ id, label, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus"
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ id, label, options }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus"
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProfileSummary() {
  const stats = [
    ['常用模块', 'favoriteModuleCount', '4'],
    ['关注省份', 'focusProvinceCount', '3'],
    ['查询记录', 'queryCount', '128'],
    ['方案草稿', 'planCount', '12'],
  ];

  return (
    <section className="card-glass card-shadow rounded-3xl p-6 md:p-8 mb-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-water flex items-center justify-center shadow-lg">
              <i className="fa fa-user text-white text-4xl"></i>
            </div>
            <button className="absolute -right-2 -bottom-2 h-9 w-9 rounded-full bg-dark-light border border-white/10 text-primary hover:text-white hover:bg-primary transition-colors">
              <i className="fa fa-camera"></i>
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" id="profileUserName">
              访客
            </h2>
            <p className="text-primary mt-1" id="profileUserRole">
              流域分析账号
            </p>
            <p className="text-sm text-gray-400 mt-2 max-w-xl" id="profileTagline">
              关注流域水质变化、知识图谱溯源与辅助决策。
            </p>
            <div className="flex flex-wrap gap-2 mt-4" id="interestTags">
              <span className="px-3 py-1 rounded-full text-xs bg-primary/15 text-primary">知识图谱</span>
              <span className="px-3 py-1 rounded-full text-xs bg-secondary/15 text-secondary">污染溯源</span>
              <span className="px-3 py-1 rounded-full text-xs bg-accent/15 text-accent">治理研判</span>
            </div>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 xl:grid-cols-4 gap-3">
          {stats.map(([label, id, value]) => (
            <div className="stat-card" key={id}>
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-2xl font-bold mt-2" id={id}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileForms() {
  return (
    <div className="xl:col-span-2 space-y-6">
      <div className="card-glass card-shadow rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-semibold text-white">基础资料</h3>
            <p className="text-sm text-gray-400 mt-1">用于展示账号信息与页面身份标识。</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300">已同步到本地</span>
        </div>
        <form id="profileForm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField id="realName" label="姓名" placeholder="请输入姓名" />
            <TextField id="nickName" label="显示名称" placeholder="请输入显示名称" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField id="email" type="email" label="邮箱" placeholder="请输入邮箱" />
            <TextField id="phone" type="tel" label="手机号" placeholder="请输入手机号" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField id="organization" label="所属单位" placeholder="请输入所属单位" />
            <TextField id="position" label="岗位职责" placeholder="请输入岗位职责" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              工作说明
            </label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus resize-none"
              placeholder="例如：负责流域监测研判、站点排查与治理方案梳理。"
            ></textarea>
          </div>
          <TextField id="interests" label="关注方向" placeholder="例如：知识图谱, 污染溯源, 风险预警" />
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-3 rounded-xl bg-gradient-water text-white font-medium hover:opacity-95 transition-opacity">
              保存资料
            </button>
          </div>
        </form>
      </div>

      <div className="card-glass card-shadow rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-semibold text-white">使用偏好</h3>
            <p className="text-sm text-gray-400 mt-1">设置默认关注区域与常用入口。</p>
          </div>
        </div>
        <form id="preferenceForm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              id="defaultProvince"
              label="默认关注省份"
              options={['河北省', '北京市', '天津市', '山东省', '山西省', '河南省'].map((value) => ({
                value,
                label: value,
              }))}
            />
            <SelectField
              id="defaultModule"
              label="默认进入模块"
              options={[
                ['dashboard', '数据大屏'],
                ['sandbox', '时空推演沙盘'],
                ['knowledge-graph', '知识图谱'],
                ['chat', '智能问答'],
              ].map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              id="focusIndicator"
              label="默认指标"
              options={['高锰酸盐指数', '氨氮', '总磷', '溶解氧', '总氮'].map((value) => ({ value, label: value }))}
            />
            <SelectField
              id="workspaceMode"
              label="默认视角"
              options={['流域总览', '省域分析', '站点排查', '溯源研判'].map((value) => ({ value, label: value }))}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-colors">
              保存偏好
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="space-y-6">
      <div className="card-glass card-shadow rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">近期使用</h3>
        <div className="space-y-3">
          {[
            ['fa-project-diagram', 'bg-primary/15 text-primary', '知识图谱溯源', '上游站点排查', '刚刚'],
            ['fa-globe', 'bg-secondary/15 text-secondary', '流域推演沙盘', '方案对比与模拟', '今天'],
            ['fa-robot', 'bg-accent/15 text-accent', '智能问答', '问答记录已同步', '昨天'],
          ].map(([icon, color, title, desc, time]) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" key={title}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl ${color} flex items-center justify-center`}>
                    <i className={`fa ${icon}`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass card-shadow rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">账号安全</h3>
        <div className="space-y-4">
          <SecurityAction title="邮箱验证" textId="emailVerifyText" action="verify-email" fallback="绑定后可用于找回账号。" />
          <div className="soft-divider border-t"></div>
          <SecurityAction title="手机验证" textId="phoneVerifyText" action="verify-phone" fallback="开启后可接收登录提醒。" />
          <div className="soft-divider border-t"></div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">登录提醒</p>
              <p className="text-sm text-gray-400">异常登录时发送提示。</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="loginAlertToggle" className="sr-only peer" />
              <div className="w-11 h-6 bg-dark-lighter peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-lighter after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card-glass card-shadow rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">修改密码</h3>
        <form id="changePasswordForm" className="space-y-4">
          <TextField id="currentPassword" type="password" label="当前密码" placeholder="请输入当前密码" />
          <TextField id="newPassword" type="password" label="新密码" placeholder="请输入新密码" />
          <TextField id="confirmPassword" type="password" label="确认新密码" placeholder="请再次输入新密码" />
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors">
              更新密码
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityAction({ title, textId, action, fallback }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-gray-400" id={textId}>
          {fallback}
        </p>
      </div>
      <button
        type="button"
        data-action={action}
        className="px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors text-sm"
      >
        立即验证
      </button>
    </div>
  );
}

export default function ProfilePage({ page }) {
  useLegacyPageRuntime(page, initProfilePageInteractions);

  return (
    <>
      <style>{profileStyles}</style>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1.8s' }}
        ></div>
        <div
          className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl animate-pulse-slow"
          style={{ animationDelay: '3.2s' }}
        ></div>
      </div>
      <ProfileHeader />
      <main className="container mx-auto px-4 pt-24 pb-10 relative z-10">
        <section className="mb-6">
          <p className="section-label mb-2">Account Center</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">个人中心</h1>
              <p className="text-gray-400 mt-2">管理账号资料、使用偏好与近期常用模块。</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">知识图谱</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">沙盘推演</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">智能问答</span>
            </div>
          </div>
        </section>

        <ProfileSummary />

        <section className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
            <span className="px-4 py-2 rounded-xl bg-primary/15 text-primary">个人资料</span>
            <span className="px-4 py-2 rounded-xl text-gray-300">使用偏好</span>
            <span className="px-4 py-2 rounded-xl text-gray-300">近期记录</span>
            <span className="px-4 py-2 rounded-xl text-gray-300">账号安全</span>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ProfileForms />
          <Sidebar />
        </section>
      </main>
    </>
  );
}

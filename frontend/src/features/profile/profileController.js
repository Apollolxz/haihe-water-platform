import { pageBase } from '../../legacy/routing.js';

let activeCleanup = null;

const DEFAULT_USER = {
  username: '访客',
  role: '流域分析账号',
  realName: '',
  nickName: '',
  email: '',
  phone: '',
  organization: '海河流域项目组',
  position: '数据分析员',
  bio: '关注流域水质变化、知识图谱溯源与辅助决策。',
  interests: '知识图谱,污染溯源,风险预警',
  defaultProvince: '河北省',
  defaultModule: 'knowledge-graph',
  focusIndicator: '高锰酸盐指数',
  workspaceMode: '流域总览',
  stats: {
    favoriteModuleCount: 4,
    focusProvinceCount: 3,
    queryCount: 128,
    planCount: 12,
  },
  security: {
    emailVerified: false,
    phoneVerified: false,
    loginAlert: true,
  },
};

function $(id) {
  return document.getElementById(id);
}

function cloneDefaultUser() {
  return JSON.parse(JSON.stringify(DEFAULT_USER));
}

function safeReadCurrentUser() {
  try {
    const stored = JSON.parse(localStorage.getItem('currentUser')) || {};
    return {
      ...cloneDefaultUser(),
      ...stored,
      stats: {
        ...DEFAULT_USER.stats,
        ...(stored.stats || {}),
      },
      security: {
        ...DEFAULT_USER.security,
        ...(stored.security || {}),
      },
    };
  } catch {
    return cloneDefaultUser();
  }
}

function saveCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function setValue(id, value) {
  const element = $(id);
  if (element) element.value = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInterestTags(interestsValue) {
  const container = $('interestTags');
  if (!container) return;

  const tags = (interestsValue || '')
    .split(/[，,、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  const colors = [
    'bg-primary/15 text-primary',
    'bg-secondary/15 text-secondary',
    'bg-accent/15 text-accent',
    'bg-white/10 text-white',
  ];

  container.innerHTML = tags
    .map((tag, index) => `<span class="px-3 py-1 rounded-full text-xs ${colors[index % colors.length]}">${escapeHtml(tag)}</span>`)
    .join('');
}

function updateSecurityUI(user) {
  setText('emailVerifyText', user.security.emailVerified ? '邮箱已验证。' : '绑定后可用于找回账号。');
  setText('phoneVerifyText', user.security.phoneVerified ? '手机已验证，可接收安全提醒。' : '开启后可接收登录提醒。');
  const loginAlertToggle = $('loginAlertToggle');
  if (loginAlertToggle) loginAlertToggle.checked = Boolean(user.security.loginAlert);
}

function renderProfile(user) {
  const displayName = user.nickName || user.username || DEFAULT_USER.username;
  setText('userName', displayName);
  setText('profileUserName', displayName);
  setText('profileUserRole', user.role || DEFAULT_USER.role);
  setText('profileTagline', user.bio || DEFAULT_USER.bio);

  setText('favoriteModuleCount', user.stats.favoriteModuleCount);
  setText('focusProvinceCount', user.stats.focusProvinceCount);
  setText('queryCount', user.stats.queryCount);
  setText('planCount', user.stats.planCount);

  setValue('realName', user.realName || '');
  setValue('nickName', user.nickName || user.username || '');
  setValue('email', user.email || '');
  setValue('phone', user.phone || '');
  setValue('organization', user.organization || '');
  setValue('position', user.position || '');
  setValue('bio', user.bio || '');
  setValue('interests', user.interests || '');
  setValue('defaultProvince', user.defaultProvince || DEFAULT_USER.defaultProvince);
  setValue('defaultModule', user.defaultModule || DEFAULT_USER.defaultModule);
  setValue('focusIndicator', user.focusIndicator || DEFAULT_USER.focusIndicator);
  setValue('workspaceMode', user.workspaceMode || DEFAULT_USER.workspaceMode);

  renderInterestTags(user.interests || DEFAULT_USER.interests);
  updateSecurityUI(user);
}

function bindForm(formId, handler) {
  const form = $(formId);
  if (!form) return undefined;
  form.addEventListener('submit', handler);
  return () => form.removeEventListener('submit', handler);
}

function bindProfileForm() {
  return bindForm('profileForm', (event) => {
    event.preventDefault();
    const currentUser = safeReadCurrentUser();
    currentUser.realName = $('realName')?.value.trim() || '';
    currentUser.nickName = $('nickName')?.value.trim() || '';
    currentUser.username = currentUser.nickName || currentUser.username || DEFAULT_USER.username;
    currentUser.email = $('email')?.value.trim() || '';
    currentUser.phone = $('phone')?.value.trim() || '';
    currentUser.organization = $('organization')?.value.trim() || '';
    currentUser.position = $('position')?.value.trim() || '';
    currentUser.bio = $('bio')?.value.trim() || DEFAULT_USER.bio;
    currentUser.interests = $('interests')?.value.trim() || DEFAULT_USER.interests;

    saveCurrentUser(currentUser);
    renderProfile(currentUser);
    window.alert('个人资料已保存');
  });
}

function bindPreferenceForm() {
  return bindForm('preferenceForm', (event) => {
    event.preventDefault();
    const currentUser = safeReadCurrentUser();
    currentUser.defaultProvince = $('defaultProvince')?.value || DEFAULT_USER.defaultProvince;
    currentUser.defaultModule = $('defaultModule')?.value || DEFAULT_USER.defaultModule;
    currentUser.focusIndicator = $('focusIndicator')?.value || DEFAULT_USER.focusIndicator;
    currentUser.workspaceMode = $('workspaceMode')?.value || DEFAULT_USER.workspaceMode;

    saveCurrentUser(currentUser);
    renderProfile(currentUser);
    window.alert('使用偏好已保存');
  });
}

function bindChangePasswordForm() {
  return bindForm('changePasswordForm', (event) => {
    event.preventDefault();
    const currentPassword = $('currentPassword')?.value.trim();
    const newPassword = $('newPassword')?.value.trim();
    const confirmPassword = $('confirmPassword')?.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      window.alert('请完整填写密码信息');
      return;
    }

    if (newPassword !== confirmPassword) {
      window.alert('两次输入的新密码不一致');
      return;
    }

    window.alert('密码已更新');
    event.target.reset();
  });
}

function bindSecurityActions() {
  const buttons = [...document.querySelectorAll('[data-action="verify-email"], [data-action="verify-phone"]')];
  const handlers = buttons.map((button) => {
    const handler = () => {
      const action = button.getAttribute('data-action');
      const currentUser = safeReadCurrentUser();
      if (action === 'verify-email') currentUser.security.emailVerified = true;
      if (action === 'verify-phone') currentUser.security.phoneVerified = true;
      saveCurrentUser(currentUser);
      updateSecurityUI(currentUser);
      window.alert('状态已更新');
    };
    button.addEventListener('click', handler);
    return [button, handler];
  });

  const loginAlertToggle = $('loginAlertToggle');
  const onToggle = (event) => {
    const currentUser = safeReadCurrentUser();
    currentUser.security.loginAlert = event.target.checked;
    saveCurrentUser(currentUser);
  };
  loginAlertToggle?.addEventListener('change', onToggle);

  return () => {
    handlers.forEach(([button, handler]) => button.removeEventListener('click', handler));
    loginAlertToggle?.removeEventListener('change', onToggle);
  };
}

function bindProfileLogout() {
  const logoutLink = [...document.querySelectorAll('a[href="#"]')]
    .find((link) => link.querySelector('.fa-sign-out'));
  if (!logoutLink) return undefined;

  const onClick = (event) => {
    event.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = `${pageBase}index.html`;
  };

  logoutLink.addEventListener('click', onClick);
  return () => logoutLink.removeEventListener('click', onClick);
}

export function initProfilePageInteractions() {
  activeCleanup?.();

  const currentUser = safeReadCurrentUser();
  renderProfile(currentUser);

  const cleanups = [
    bindProfileForm(),
    bindPreferenceForm(),
    bindChangePasswordForm(),
    bindSecurityActions(),
    bindProfileLogout(),
  ];

  activeCleanup = () => {
    cleanups.forEach((cleanup) => cleanup?.());
    activeCleanup = null;
  };

  return activeCleanup;
}

import { ensureRuntimeBridge } from './runtimeBridge.js';
import { initParticles } from './particles.js';
import { pageBase } from './routing.js';

const navSearchRoutes = [
  { keys: ['首页', '主页', 'home'], url: 'index.html' },
  { keys: ['数据大屏', '大屏', 'dashboard'], url: 'dashboard.html' },
  { keys: ['沙盘', '推演', 'sandbox'], url: 'sandbox.html' },
  { keys: ['知识图谱', '图谱', 'graph'], url: 'knowledge-graph.html' },
  { keys: ['智能问答', '问答', 'chat'], url: 'chat.html' },
];

function getStoredUserInfo() {
  const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
  if (!raw) {
    return { username: '访客', role: '未登录' };
  }

  try {
    return JSON.parse(raw) || { username: '访客', role: '未登录' };
  } catch (error) {
    console.warn('无法读取本地用户信息:', error);
    return { username: '访客', role: '未登录' };
  }
}

function setTextIfExists(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function initNavSearch() {
  const forms = [...document.querySelectorAll('[data-nav-search]')];

  const submitSearch = (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector('input[type="search"], input[type="text"]');
    const query = input ? input.value.trim() : '';
    if (!query) return;

    const normalized = query.toLowerCase();
    const route = navSearchRoutes.find((item) => item.keys.some((key) => normalized.includes(key.toLowerCase())));

    if (route) {
      window.location.href = `${pageBase}${route.url}`;
      return;
    }

    const graphInput = document.getElementById('searchInput');
    const graphButton = document.getElementById('searchBtn');
    if (graphInput && graphButton) {
      graphInput.value = query;
      graphButton.click();
      graphInput.focus();
      return;
    }

    window.location.href = `${pageBase}knowledge-graph.html?search=${encodeURIComponent(query)}`;
  };

  forms.forEach((form) => form.addEventListener('submit', submitSearch));

  return () => {
    forms.forEach((form) => form.removeEventListener('submit', submitSearch));
  };
}

export function wireLegacyInteractions(pageName) {
  ensureRuntimeBridge();

  document.querySelectorAll('[data-page-link]').forEach((link) => {
    const target = link.getAttribute('data-page-link');
    if (target) link.setAttribute('href', `${pageBase}${target}`);
  });

  const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user') || localStorage.getItem('token')
    ? getStoredUserInfo()
    : { username: '访客', role: '未登录' };
  const displayName = String(currentUser.nickname || currentUser.name || currentUser.username || '访客')
    .replace(/\.?管理员/u, '')
    .trim();
  setTextIfExists('userName', displayName || '访客');

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenu = document.getElementById('userMenu');
  const logoutLinks = document.querySelectorAll('[data-logout-link]');

  const toggleMobileMenu = () => mobileMenu?.classList.toggle('hidden');
  const toggleUserMenu = () => userMenu?.classList.toggle('hidden');
  const closeMenus = (event) => {
    if (!event.target.closest('#userMenuBtn') && !event.target.closest('#userMenu')) {
      userMenu?.classList.add('hidden');
    }
    if (!event.target.closest('#mobileMenuBtn') && !event.target.closest('#mobileMenu')) {
      mobileMenu?.classList.add('hidden');
    }
  };
  const logout = (event) => {
    event?.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = `${pageBase}login.html`;
  };

  mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  userMenuBtn?.addEventListener('click', toggleUserMenu);
  document.addEventListener('click', closeMenus);
  logoutLinks.forEach((link) => link.addEventListener('click', logout));

  const cleanupParticles = initParticles();
  const cleanupNavSearch = initNavSearch();
  return () => {
    mobileMenuBtn?.removeEventListener('click', toggleMobileMenu);
    userMenuBtn?.removeEventListener('click', toggleUserMenu);
    document.removeEventListener('click', closeMenus);
    logoutLinks.forEach((link) => link.removeEventListener('click', logout));
    cleanupParticles?.();
    cleanupNavSearch?.();
  };
}

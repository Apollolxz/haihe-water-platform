import { initAuthPageInteractions } from '../features/auth/authController.js';
import { initChatPageInteractions } from '../features/chat/chatController.js';
import { loadHomeData, loadPlatformStats } from '../features/home/homeData.js';
import { initProfilePageInteractions } from '../features/profile/profileController.js';
import { ensureRuntimeBridge } from './runtimeBridge.js';
import { initParticles } from './particles.js';
import { getLegacyPage, pageBase } from './routing.js';
import { loadLegacyScripts } from './scriptLoader.js';

const navSearchRoutes = [
  { keys: ['首页', '主页', '海河', 'home'], url: 'index.html' },
  { keys: ['数据', '大屏', '监测', '指标', 'dashboard'], url: 'dashboard.html' },
  { keys: ['沙盘', '推演', '预测', '决策', 'sandbox'], url: 'sandbox.html' },
  { keys: ['知识', '图谱', '溯源', '节点', 'graph'], url: 'knowledge-graph.html' },
  { keys: ['问答', '智能', '助手', 'chat'], url: 'chat.html' },
];

const authPages = new Set(['login.html', 'register.html', 'forgot-password.html']);

function getStoredUserInfo() {
  const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
  if (!raw) {
    return { username: '访客', role: '未登录' };
  }

  try {
    return JSON.parse(raw) || { username: '访客', role: '未登录' };
  } catch (error) {
    console.warn('解析用户信息失败:', error);
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

function runPendingGraphSearch() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('search');
  const graphInput = document.getElementById('searchInput');
  const graphButton = document.getElementById('searchBtn');
  if (!query || !graphInput || !graphButton) return;
  graphInput.value = query;
  window.setTimeout(() => graphButton.click(), 500);
}

export function wireLegacyInteractions(pageName) {
  const page = getLegacyPage(pageName);
  ensureRuntimeBridge();

  document.querySelectorAll('[data-page-link]').forEach((link) => {
    const target = link.getAttribute('data-page-link');
    if (target) link.setAttribute('href', `${pageBase}${target}`);
  });

  const currentUser = localStorage.getItem('token')
    ? getStoredUserInfo()
    : { username: '访客', role: '未登录' };
  const displayName = String(currentUser.nickname || currentUser.name || currentUser.username || '访客')
    .replace(/\.?用户$/u, '')
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
    event.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = `${pageBase}login.html`;
  };

  mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  userMenuBtn?.addEventListener('click', toggleUserMenu);
  document.addEventListener('click', closeMenus);
  logoutLinks.forEach((link) => link.addEventListener('click', logout));

  const runLegacyClick = (event) => {
    if (event.defaultPrevented) return;
    const trigger = event.target.closest('[data-legacy-click]');
    if (!trigger) return;
    event.preventDefault();
    const expression = trigger.getAttribute('data-legacy-click');
    if (!expression) return;
    try {
      try {
        window.event = event;
      } catch {
        // Some legacy handlers read the browser's global event object.
      }
      Function(expression).call(window);
    } catch (error) {
      console.error('执行旧页面点击逻辑失败:', error);
    }
  };

  document.addEventListener('click', runLegacyClick);

  const cleanupParticles = initParticles();
  const cleanupNavSearch = initNavSearch();
  let cleanupPageInteractions;
  let cancelled = false;

  loadLegacyScripts(page).then(() => {
    if (cancelled) return;
    if (pageName === 'chat.html') {
      cleanupPageInteractions = initChatPageInteractions();
    }
    if (authPages.has(pageName)) {
      cleanupPageInteractions = initAuthPageInteractions(pageName);
    }
    if (pageName === 'profile.html') {
      cleanupPageInteractions = initProfilePageInteractions();
    }
    if (pageName === 'knowledge-graph.html') {
      runPendingGraphSearch();
    }
  }).catch((error) => {
    console.error('加载旧版页面脚本失败:', error);
  });

  if (pageName === 'index.html') {
    loadHomeData();
    loadPlatformStats();
  }

  return () => {
    cancelled = true;
    mobileMenuBtn?.removeEventListener('click', toggleMobileMenu);
    userMenuBtn?.removeEventListener('click', toggleUserMenu);
    document.removeEventListener('click', closeMenus);
    document.removeEventListener('click', runLegacyClick);
    logoutLinks.forEach((link) => link.removeEventListener('click', logout));
    cleanupParticles?.();
    cleanupNavSearch?.();
    cleanupPageInteractions?.();
  };
}

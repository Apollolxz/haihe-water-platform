import { loadHomeData, loadPlatformStats } from '../features/home/homeData.js';
import { ensureRuntimeBridge } from './runtimeBridge.js';
import { initParticles } from './particles.js';
import { getLegacyPage, pageBase } from './routing.js';
import { loadLegacyScripts } from './scriptLoader.js';

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

  const cleanupParticles = initParticles();
  loadLegacyScripts(page).catch((error) => {
    console.error('加载旧版页面脚本失败:', error);
  });

  if (pageName === 'index.html') {
    loadHomeData();
    loadPlatformStats();
  }

  return () => {
    mobileMenuBtn?.removeEventListener('click', toggleMobileMenu);
    userMenuBtn?.removeEventListener('click', toggleUserMenu);
    document.removeEventListener('click', closeMenus);
    logoutLinks.forEach((link) => link.removeEventListener('click', logout));
    cleanupParticles?.();
  };
}

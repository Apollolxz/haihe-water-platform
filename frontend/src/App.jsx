import { useEffect } from 'react';
import { resolveApiUrl } from './config/runtime.js';
import legacyPages from './generated/LegacyPages.jsx';
import './styles.css';

const basePath = import.meta.env.BASE_URL || '/';
const normalizedBasePath = basePath.replace(/\/$/, '');
const pageBase = `${normalizedBasePath}/pages/`;

function getCurrentPage() {
  const pathname = window.location.pathname;
  const withoutBase =
    normalizedBasePath && pathname.startsWith(normalizedBasePath)
      ? pathname.slice(normalizedBasePath.length)
      : pathname;
  const match = withoutBase.match(/\/pages\/([^/]+\.html)$/);

  if (match?.[1] && legacyPages[match[1]]) {
    return match[1];
  }

  return 'index.html';
}

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

function initParticles() {
  if (import.meta.env.MODE === 'test') return undefined;

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return undefined;

  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  let frameId = 0;
  const particles = [];
  const particleCount = 50;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();

  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(14, 165, 233, ${particle.opacity})`;
      ctx.fill();
    });

    frameId = requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resize);
  };
}

function loadPlatformStats() {
  fetch(resolveApiUrl('/api/graph/stats'))
    .then((response) => response.json())
    .then((result) => {
      if (!result?.success || !result.data) return;
      setTextIfExists('heroGraphNodeCount', result.data.nodeCount ?? '--');
      setTextIfExists('overviewGraphNodeCount', result.data.nodeCount ?? '--');
      setTextIfExists('overviewGraphLinkCount', result.data.linkCount ?? '--');
    })
    .catch((error) => {
      console.error('加载图谱统计失败:', error);
    });

  fetch(resolveApiUrl('/api/dashboard/overview-stats'))
    .then((response) => response.json())
    .then((result) => {
      if (!result?.success || !result.data) return;
      setTextIfExists('overviewStationCount', result.data.monitoring_stations ?? '--');
    })
    .catch((error) => {
      console.error('加载平台概览统计失败:', error);
    });
}

function loadHomeData() {
  fetch(resolveApiUrl('/api/water-quality/latest'))
    .then((response) => response.json())
    .then((data) => {
      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) return;

      const total = data.data.reduce(
        (acc, item) => ({
          cod: acc.cod + (item.cod || 0),
          ammonia: acc.ammonia + (item.ammonia_nitrogen || 0),
        }),
        { cod: 0, ammonia: 0 },
      );

      const avgCOD = total.cod / data.data.length;
      const avgAmmonia = total.ammonia / data.data.length;

      const codElement = document.querySelector('.stat-card:nth-child(1) .text-4xl');
      const codBar = document.querySelector('.stat-card:nth-child(1) .h-full');
      if (codElement) codElement.textContent = avgCOD.toFixed(0);
      if (codBar) codBar.style.width = `${Math.min((avgCOD / 40) * 100, 100)}%`;

      const ammoniaElement = document.querySelector('.stat-card:nth-child(2) .text-4xl');
      const ammoniaBar = document.querySelector('.stat-card:nth-child(2) .h-full');
      if (ammoniaElement) ammoniaElement.textContent = avgAmmonia.toFixed(2);
      if (ammoniaBar) ammoniaBar.style.width = `${Math.min((avgAmmonia / 5) * 100, 100)}%`;
    })
    .catch((error) => {
      console.error('加载水质数据失败:', error);
    });
}

function wireLegacyInteractions(pageName) {
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

export default function App() {
  const pageName = getCurrentPage();
  const page = legacyPages[pageName] || legacyPages['index.html'];
  const Page = page.Component;

  useEffect(() => {
    document.title = page.title;
    return wireLegacyInteractions(pageName);
  }, [page.title, pageName]);

  return <Page key={pageName} />;
}

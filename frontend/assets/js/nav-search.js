(function () {
  const routes = [
    { keys: ['首页', '主页', '海河', 'home'], url: 'index.html' },
    { keys: ['数据', '大屏', '监测', '指标', 'dashboard'], url: 'dashboard.html' },
    { keys: ['沙盘', '推演', '预测', '决策', 'sandbox'], url: 'sandbox.html' },
    { keys: ['知识', '图谱', '溯源', '节点', 'graph'], url: 'knowledge-graph.html' },
    { keys: ['问答', '智能', '助手', 'chat'], url: 'chat.html' }
  ];

  function getQuery(form) {
    const input = form.querySelector('input[type="search"], input[type="text"]');
    return input ? input.value.trim() : '';
  }

  function pickRoute(query) {
    const normalized = query.toLowerCase();
    return routes.find(route => route.keys.some(key => normalized.includes(key.toLowerCase())));
  }

  function submitSearch(event) {
    event.preventDefault();
    const query = getQuery(event.currentTarget);
    if (!query) return;

    const route = pickRoute(query);
    if (route) {
      window.location.href = route.url;
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

    window.location.href = `knowledge-graph.html?search=${encodeURIComponent(query)}`;
  }

  function initSearchForms() {
    document.querySelectorAll('[data-nav-search]').forEach(form => {
      form.addEventListener('submit', submitSearch);
    });
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

  function getStoredUser() {
    const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  function initUserName() {
    const userNameElement = document.getElementById('userName');
    if (!userNameElement || window.layout) return;
    const user = getStoredUser();
    const displayName = String(user?.nickname || user?.name || user?.username || userNameElement.textContent || '访客')
      .replace(/\.?用户$/u, '')
      .trim();
    userNameElement.textContent = displayName || '访客';
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSearchForms();
    initUserName();
    runPendingGraphSearch();
  });
})();

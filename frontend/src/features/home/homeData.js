import { resolveApiUrl } from '../../config/runtime.js';

function setTextIfExists(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

export function loadPlatformStats() {
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

export function loadHomeData() {
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

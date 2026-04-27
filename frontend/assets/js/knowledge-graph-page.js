'use strict';

function resolveApiPath(path) {
  if (window.HAIHE_RUNTIME?.resolveApi) {
    return window.HAIHE_RUNTIME.resolveApi(path);
  }
  if (window.location.protocol === 'file:') {
    return `http://127.0.0.1:5001${path}`;
  }
  return path;
}

const GRAPH_API = resolveApiPath('/api/graph/');
const GRAPH_TRACE_API = resolveApiPath('/api/graph/trace');
const GRAPH_UPSTREAM_API = resolveApiPath('/api/graph/upstream');
const GRAPH_EXCEEDANCE_API = resolveApiPath('/api/graph/exceedance');
const DECISION_CONTEXT_API = resolveApiPath('/api/decision/context');

let network;
let nodesDataSet;
let edgesDataSet;
let allNodes = [];
let allEdges = [];
let graphMeta = {};
let physicsEnabled = false;

const $ = id => document.getElementById(id);

const CATEGORY_ALIASES = {
  Region: '行政区划',
  River: '水系河流',
  Station: '监测站点',
  Pollutant: '污染物指标',
  WaterLevel: '水质等级',
  省份: '行政区划',
  河流: '水系河流',
  污染物: '污染物指标'
};

const CATEGORY_CONFIG = {
  '监测站点': { color: '#0ea5e9', icon: 'fa-map-marker' },
  '水系河流': { color: '#38bdf8', icon: 'fa-water' },
  '污染物指标': { color: '#22c55e', icon: 'fa-flask' },
  '行政区划': { color: '#f59e0b', icon: 'fa-map' },
  '水质等级': { color: '#10b981', icon: 'fa-tint' },
  '其他': { color: '#a855f7', icon: 'fa-circle' }
};

const RELATION_INFO = {
  BELONGS_TO: { label: '所属区域', color: '#0ea5e9' },
  ON_RIVER: { label: '所在河流', color: '#38bdf8' },
  HAS_LEVEL: { label: '水质等级', color: '#10b981' },
  EXCEEDS: { label: '超标记录', color: '#f43f5e' },
  UPSTREAM_OF: { label: '上游关联', color: '#22c55e' },
  MONITORS: { label: '监测指标', color: '#f59e0b' }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showLoading(show) {
  $('loadingMask').classList.toggle('hidden', !show);
}

function categoryName(name) {
  return CATEGORY_ALIASES[name] || name || '其他';
}

function categoryKind(name) {
  const text = String(name || '').toLowerCase();
  if (text === 'station' || text.includes('监测站点') || text.includes('鐩戞祴绔欑偣')) return 'station';
  if (text === 'region' || text.includes('行政区划') || text.includes('琛屾斂鍖哄垝')) return 'region';
  if (text === 'pollutant' || text.includes('污染物指标') || text.includes('姹℃煋鐗╂寚鏍')) return 'pollutant';
  if (text === 'river' || text.includes('水系河流') || text.includes('姘寸郴娌虫祦')) return 'river';
  if (text === 'waterlevel' || text.includes('水质等级') || text.includes('姘磋川绛夌骇')) return 'water-level';
  return 'other';
}

function categoryStyle(name) {
  return CATEGORY_CONFIG[categoryName(name)] || CATEGORY_CONFIG['其他'];
}

function relationLabel(type) {
  return (RELATION_INFO[type] || {}).label || type || '未知';
}

function relationColor(type) {
  return (RELATION_INFO[type] || {}).color || '#666';
}

function parseDescription(text) {
  if (!text || typeof text !== 'string') return {};
  return text.split('|').map(s => s.trim()).filter(Boolean).reduce((acc, item) => {
    const idx = item.indexOf(':');
    if (idx === -1) return acc;
    const key = item.slice(0, idx).trim();
    const value = item.slice(idx + 1).trim();
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

function graphDbName() {
  return graphMeta.database || graphMeta.configured_database || 'neo4j';
}

function findNodeByLabel(label) {
  return allNodes.find(item => item.label === label);
}

function setSelectValue(id, value) {
  if (!value) return false;
  const select = $(id);
  if (!select) return false;
  const matched = Array.from(select.options || []).find(option => option.value === value);
  if (!matched) return false;
  select.value = value;
  return true;
}

function isStationNode(node) {
  return node?.kind === 'station';
}

function isRegionNode(node) {
  return node?.kind === 'region';
}

function isPollutantNode(node) {
  return node?.kind === 'pollutant';
}

function syncTraceSelection(stationName, pollutantName, dateText) {
  if (stationName) {
    setSelectValue('traceStation', stationName);
  }
  if (pollutantName) {
    setSelectValue('tracePollutant', pollutantName);
  }
  if (dateText) {
    $('traceDate').value = dateText;
  }
}

function shiftDateText(dateText, dayOffset) {
  if (!dateText) return '';
  const base = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(base.getTime())) return '';
  base.setDate(base.getDate() + dayOffset);
  return base.toISOString().slice(0, 10);
}

function formatNumber(value, digits = 1) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '';
  return num.toFixed(digits);
}

function formatTraceMode(mode) {
  if (mode === '图谱链路') return '已有链路';
  if (mode === '同河道坐标推断') return '同河道';
  if (mode === '跨省拓扑推断') return '跨省链路';
  return '上游候选';
}

function renderTraceCandidateCard(item, index) {
  const title = escapeHtml(item.station || '未知站点');
  const score = formatNumber(item.source_score, 0) || '-';
  const subtitle = escapeHtml([item.province, item.river].filter(Boolean).join(' · '));
  const meta = [
    item.evidence_date ? `日期 ${escapeHtml(item.evidence_date)}` : '',
    item.distance_km != null ? `距离 ${escapeHtml(formatNumber(item.distance_km, 1))} km` : '',
    item.flow_days != null ? `流达 ${escapeHtml(String(item.flow_days))} 天` : '',
  ].filter(Boolean).join(' · ');
  const valueText = item.value != null && item.limit != null
    ? `数值 ${escapeHtml(formatNumber(item.value, 3))} / 参考 ${escapeHtml(formatNumber(item.limit, 3))}`
    : item.value != null
      ? `数值 ${escapeHtml(formatNumber(item.value, 3))}`
      : '';
  const tags = [
    formatTraceMode(item.topology_mode),
    item.confidence ? `${escapeHtml(item.confidence)}风险` : '',
  ].filter(Boolean);

  return `<button type="button" class="item-card p-3 text-sm text-left cursor-pointer" data-label="${escapeHtml(item.station || '')}">
    <div class="flex items-start justify-between gap-3 mb-1">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold" style="background:#0ea5e920;color:#0ea5e9">${index + 1}</span>
          <span class="font-medium truncate" style="color:#F8FAFC">${title}</span>
        </div>
        <div class="text-xs mt-1" style="color:#93a4bb">${subtitle || '上游站点'}</div>
      </div>
      <span class="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style="background:#f43f5e20;color:#fda4af">评分 ${escapeHtml(score)}</span>
    </div>
    ${tags.length ? `<div class="flex flex-wrap gap-2 mb-2">${tags.map(tag => `<span class="text-[11px] px-2 py-0.5 rounded-full" style="background:#ffffff10;color:#cbd5e1">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
    ${meta ? `<div class="text-xs mb-1" style="color:#E2E8F0">${meta}</div>` : ''}
    ${valueText ? `<div class="text-xs" style="color:#93a4bb">${valueText}</div>` : ''}
  </button>`;
}

function getLaunchContext() {
  const params = new URLSearchParams(window.location.search);
  const province = (params.get('province') || '').trim();
  if (!province) return null;
  return {
    source: (params.get('source') || '').trim(),
    province,
    date: (params.get('date') || '').trim(),
    modelType: (params.get('model_type') || 'LSTM').trim() || 'LSTM'
  };
}

function buildSandboxReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const sandboxParams = new URLSearchParams();
  const currentProvince = ($('exceedProvince')?.value || '').trim();
  const provinceSelection = currentProvince || (params.get('provinces') || params.get('province') || '').trim();
  const indicator = (params.get('indicator') || '').trim();
  const timeMode = (params.get('time_mode') || '').trim();
  const modelMode = (params.get('model_mode') || params.get('model_type') || '').trim();
  const radarProvince = currentProvince || (params.get('radar_province') || params.get('province') || '').trim();
  const days = (params.get('days') || '').trim();

  if (provinceSelection) sandboxParams.set('provinces', provinceSelection);
  if (indicator) sandboxParams.set('indicator', indicator);
  if (timeMode) sandboxParams.set('time_mode', timeMode);
  if (modelMode) sandboxParams.set('model_mode', modelMode);
  if (radarProvince) sandboxParams.set('radar_province', radarProvince);
  if (days) sandboxParams.set('days', days);
  sandboxParams.set('source', 'knowledge-graph');

  const query = sandboxParams.toString();
  const hash = (params.get('source') || '').trim() === 'sandbox' ? '#decisionPanel' : '';
  return `sandbox.html${query ? `?${query}` : ''}${hash}`;
}

function initReturnSandboxLink() {
  const link = $('returnSandboxBtn');
  if (!link) return;

  const sync = () => {
    const launch = getLaunchContext();
    const url = buildSandboxReturnUrl();
    link.setAttribute('href', url);
    link.setAttribute('title', launch?.province ? `返回沙盘并恢复 ${launch.province} 的筛选上下文` : '打开流域时空推演沙盘');
  };

  sync();
  link.addEventListener('click', event => {
    event.preventDefault();
    const url = buildSandboxReturnUrl();
    link.setAttribute('href', url);
    window.location.href = url;
  });
}

async function fetchDecisionContext(launch) {
  if (!launch?.province) return null;
  const params = new URLSearchParams({
    province: launch.province,
    model_type: launch.modelType
  });
  if (launch.date) {
    params.set('date', launch.date);
  }
  const res = await fetch(`${DECISION_CONTEXT_API}?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const payload = await res.json();
  if (!payload.success) throw new Error(payload.error || 'AI决策上下文接口返回失败');
  return payload.data?.context || null;
}

function collectLaunchLabels(launch, context, traceData) {
  const labels = new Set();
  const append = value => {
    if (value) labels.add(value);
  };

  append(launch?.province);

  (context?.upstream_network || []).forEach(item => {
    append(item.target_station);
    append(item.upstream_station);
    append(item.river);
  });

  (context?.upstream_traces || []).forEach(item => {
    append(item.target_station);
    append(item.upstream_station);
    append(item.pollutant);
    append(item.river);
  });

  (traceData?.upstream_exceedances || []).forEach(item => {
    append(item.station);
    append(item.pollutant);
  });

  (traceData?.upstream_paths || []).forEach(path => {
    (path.nodes || []).forEach(item => append(item.name));
    (path.relationships || []).forEach(item => append(item.river));
  });

  return labels;
}

function focusSubgraphByLabels(labels, statusText) {
  const visibleIds = new Set(allNodes.filter(node => labels.has(node.label)).map(node => node.id));
  if (!visibleIds.size) return false;

  nodesDataSet.update(allNodes.map(node => ({ id: node.id, hidden: !visibleIds.has(node.id) })));
  edgesDataSet.update(allEdges.map(edge => ({
    id: edge.id,
    hidden: !(visibleIds.has(edge.from) && visibleIds.has(edge.to))
  })));

  network.fit({
    nodes: [...visibleIds],
    animation: { duration: 800, easingFunction: 'easeInOutQuad' }
  });

  if (statusText) {
    setGraphStatus(statusText);
  }
  return true;
}

function normalizeNodes(rawNodes, rawCategories) {
  const rawCategoryNames = (rawCategories || []).map(item => item.name || '');
  return (rawNodes || []).map(node => {
    const rawCategory = typeof node.category === 'number' ? rawCategoryNames[node.category] : node.category;
    const group = categoryName(rawCategory);
    return {
      id: String(node.id),
      label: node.name || node.label || String(node.id),
      group,
      kind: categoryKind(rawCategory),
      properties: parseDescription(node.description),
      size: Math.max(18, Number(node.symbolSize) || 18)
    };
  });
}

function normalizeEdges(rawEdges) {
  return (rawEdges || []).map((edge, index) => {
    const type = edge.relation || edge.type || '';
    const label = edge.label ? edge.label.replace(type, relationLabel(type)) : relationLabel(type);
    return {
      id: `e${index}`,
      from: String(edge.source || edge.from),
      to: String(edge.target || edge.to),
      type,
      label,
      displayType: relationLabel(type),
      properties: edge.rel_props || edge.properties || {}
    };
  });
}

function tooltipHtml(node) {
  const entries = Object.entries(node.properties || {}).slice(0, 5);
  let html = `<strong style="color:#fff">${escapeHtml(node.label)}</strong><br><span style="color:#93a4bb">${escapeHtml(node.group)}</span>`;
  if (entries.length) {
    html += '<hr style="border-color:rgba(255,255,255,0.1);margin:6px 0">';
    html += entries.map(([k, v]) => `<span style="color:#93a4bb">${escapeHtml(k)}:</span> <span style="color:#fff">${escapeHtml(v)}</span>`).join('<br>');
  }
  return html;
}

function setGraphMetaText() {
  const meta = $('graphPanelMeta');
  if (!meta) return;
  meta.textContent = `${allNodes.length} 节点 · ${graphDbName()}`;
}

function setGraphStatus(text) {
  $('graphStatus').textContent = text;
}

function syncGraphViewport() {
  const graphContainer = $('knowledgeGraph');
  const graphStage = graphContainer?.closest('.graph-stage');
  if (!graphContainer || !graphStage) return;

  const stageRect = graphStage.getBoundingClientRect();
  const nextHeight = Math.max(520, Math.round(stageRect.height || window.innerHeight * 0.62));
  graphContainer.style.height = `${nextHeight}px`;

  if (network) {
    network.setSize('100%', `${nextHeight}px`);
    network.redraw();
  }
}

function fitGraph(delay = 0) {
  if (!network) return;
  window.setTimeout(() => {
    syncGraphViewport();
    network.fit({
      animation: { duration: 700, easingFunction: 'easeInOutQuad' }
    });
  }, delay);
}

async function fetchData() {
  showLoading(true);
  try {
    const res = await fetch(GRAPH_API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || '知识图谱接口返回失败');
    const data = payload.data || {};
    graphMeta = data.meta || {};
    allNodes = normalizeNodes(data.nodes, data.categories);
    allEdges = normalizeEdges(data.links);
  } catch (error) {
    console.error(error);
    setGraphStatus(`数据加载失败：${error.message}`);
  }
  initApp();
  await applyLaunchContext();
  showLoading(false);
}

function initApp() {
  initNetwork();
  initLegend();
  initCategoryList();
  initRelationStats();
  initExceedControls();
  initTraceControls();
  initSearch();
  initLayoutButtons();
  setGraphMetaText();
  initGraphResize();
  syncGraphViewport();
  requestAnimationFrame(() => fitGraph(80));
}

function initLegend() {
  const container = $('legendList');
  if (!container) return;
  const counts = {};
  allNodes.forEach(node => { counts[node.group] = (counts[node.group] || 0) + 1; });
  const html = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
    const cfg = categoryStyle(cat);
    return `<div class="flex items-center gap-3 text-sm cursor-pointer legend-item" data-cat="${escapeHtml(cat)}">
      <div class="w-3 h-3 rounded-full flex-shrink-0" style="background:${cfg.color};box-shadow:0 0 6px ${cfg.color}80"></div>
      <div class="flex-1 truncate" style="color:#E2E8F0">${escapeHtml(cat)}</div>
      <div class="text-xs" style="color:#94a3b8">${count}</div>
    </div>`;
  }).join('');
  container.innerHTML = html || '<div class="text-sm" style="color:#94a3b8">暂无数据</div>';
  container.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', () => filterByCategory(item.dataset.cat));
  });
}

function initNetwork() {
  syncGraphViewport();
  nodesDataSet = new vis.DataSet(allNodes.map(node => ({
    id: node.id,
    label: node.label,
    group: node.group,
    color: {
      background: categoryStyle(node.group).color,
      border: categoryStyle(node.group).color,
      highlight: { background: categoryStyle(node.group).color, border: '#fff' },
      hover: { background: categoryStyle(node.group).color, border: '#fff' }
    },
    font: { color: '#E2E8F0', size: 10, face: 'Noto Sans SC', strokeWidth: 3, strokeColor: 'rgba(0,0,0,0.6)' },
    shape: 'dot',
    size: Math.max(18, node.size * 0.9),
    borderWidth: 2,
    borderWidthSelected: 4,
    shadow: { enabled: true, color: 'rgba(0,0,0,0.35)', size: 6, x: 1, y: 1 }
  })));

  edgesDataSet = new vis.DataSet(allEdges.map(edge => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    label: '',
    title: Object.keys(edge.properties).length ? Object.entries(edge.properties).map(([k, v]) => `${propName(k)}: ${v}`).join('<br>') : edge.displayType,
    color: { color: relationColor(edge.type), highlight: '#fff', hover: '#fff', opacity: 0.22 },
    font: { color: '#93a4bb', size: 9, align: 'middle', strokeWidth: 0 },
    width: 0.8,
    smooth: { type: 'continuous', roundness: 0.2 },
    arrows: { to: { enabled: true, scaleFactor: 0.6 } }
  })));

  network = new vis.Network($('knowledgeGraph'), { nodes: nodesDataSet, edges: edgesDataSet }, {
    nodes: {
      chosen: {
        node(values, id, selected, hovering) {
          if (selected) {
            values.size *= 1.25;
            values.borderWidth = 4;
            values.borderColor = '#eee';
          }
          if (hovering) values.size *= 1.12;
        }
      }
    },
    edges: { chosen: { edge(values, id, selected) { if (selected) values.width *= 2.5; } } },
    interaction: { hover: false, tooltipDelay: 0, hideEdgesOnDrag: false, navigationButtons: false, keyboard: false },
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.003, springLength: 180, springConstant: 0.015, damping: 0.6, avoidOverlap: 0.25 },
      stabilization: { enabled: true, iterations: 180, updateInterval: 25, fit: true }
    },
    layout: { improvedLayout: true }
  });

  network.on('click', params => {
    if (params.nodes.length) {
      const selectedNode = allNodes.find(item => item.id === params.nodes[0]);
      if (!selectedNode) return;
      showNodeDetail(selectedNode.id);
      if (isStationNode(selectedNode)) {
        syncTraceSelection(selectedNode.label);
      }
      loadUpstream(selectedNode.id);
    }
  });

  network.on('stabilizationIterationsDone', () => {
    setGraphStatus(`节点 ${allNodes.length} 个 · 关系 ${allEdges.length} 条 · 数据库 ${graphDbName()} 已连接`);
    setGraphMetaText();
    setPhysicsEnabled(false);
    network.storePositions();
    fitGraph(40);
  });
}

function initCategoryList() {
  const counts = {};
  allNodes.forEach(node => { counts[node.group] = (counts[node.group] || 0) + 1; });
  $('categoryPanelMeta').textContent = `${Object.keys(counts).length} 类`;
  const html = [
    `<button class="category-button active w-full text-left px-3 py-2 text-sm flex items-center justify-between" data-cat="all"><span class="flex items-center gap-2"><i class="fa fa-th-large" style="color:#eee"></i> 全部分类</span><span class="text-xs" style="color:#93a4bb">${allNodes.length}</span></button>`,
    ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
      const cfg = categoryStyle(cat);
      return `<button class="category-button w-full text-left px-3 py-2 text-sm flex items-center justify-between" data-cat="${escapeHtml(cat)}"><span class="flex items-center gap-2"><i class="fa ${cfg.icon}" style="color:${cfg.color}"></i> ${escapeHtml(cat)}</span><span class="text-xs" style="color:#93a4bb">${count}</span></button>`;
    })
  ].join('');
  $('categoryList').innerHTML = html;
  $('categoryList').querySelectorAll('[data-cat]').forEach(btn => btn.addEventListener('click', () => filterByCategory(btn.dataset.cat)));
}

function filterByCategory(category) {
  $('categoryList').querySelectorAll('[data-cat]').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === category));
  if (category === 'all') {
    nodesDataSet.update(allNodes.map(node => ({ id: node.id, hidden: false })));
    edgesDataSet.update(allEdges.map(edge => ({ id: edge.id, hidden: false })));
    setGraphStatus('显示全部节点');
    return;
  }
  const visibleIds = new Set(allNodes.filter(node => node.group === category).map(node => node.id));
  nodesDataSet.update(allNodes.map(node => ({ id: node.id, hidden: !visibleIds.has(node.id) })));
  edgesDataSet.update(allEdges.map(edge => ({ id: edge.id, hidden: !(visibleIds.has(edge.from) && visibleIds.has(edge.to)) })));
  setGraphStatus(`已筛选：${category}（${visibleIds.size} 个）`);
}

function initRelationStats() {
  const counts = {};
  allEdges.forEach(edge => { counts[edge.displayType] = (counts[edge.displayType] || 0) + 1; });
  const total = allEdges.length;
  const max = Math.max(...Object.values(counts), 1);
  $('relationList').innerHTML = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
    const rawType = Object.keys(RELATION_INFO).find(key => RELATION_INFO[key].label === type) || type;
    const pct = total ? Math.round((count / total) * 100) : 0;
    const barW = Math.round((count / max) * 100);
    return `<div class="flex items-center gap-2 text-sm"><div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${relationColor(rawType)}"></div><div class="flex-1 truncate" style="color:#E2E8F0">${escapeHtml(type)}</div><div class="text-xs" style="color:#93a4bb">${count}</div><div class="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden flex-shrink-0"><div class="h-full rounded-full" style="width:${barW}%;background:${relationColor(rawType)}"></div></div><div class="text-xs w-8 text-right" style="color:#93a4bb">${pct}%</div></div>`;
  }).join('') || '<div class="text-sm" style="color:#93a4bb">暂无数据</div>';
}

const PROP_NAME_MAP = {
  name: '名称', province: '省份', city: '城市', river: '河流', basin: '流域',
  type: '类型', level: '等级', value: '数值', unit: '单位', date: '日期',
  standard: '标准限值', latitude: '纬度', longitude: '经度', address: '地址',
  code: '编码', category: '分类', status: '状态', description: '描述',
  source: '来源', target: '目标', distance: '距离', area: '面积',
  population: '人口', flow: '流量', ph: 'pH值', do: '溶解氧', cod: 'COD',
  nh3n: '氨氮', tp: '总磷', tn: '总氮', bod5: 'BOD5', conductivity: '电导率',
  turbidity: '浊度', temperature: '水温', chlorophyll: '叶绿素a',
  station: '监测站点', pollutant: '污染物', time: '时间', ratio: '倍数',
  concentration: '浓度', warn: '预警', trend: '趋势', quality: '水质',
  depth: '水深', elevation: '海拔', rainfall: '降雨量', velocity: '流速',
  width: '河宽', model: '模型', accuracy: '准确率', rmse: 'RMSE', mae: 'MAE',
  r2: 'R²', forecast: '预测值', monitor: '监测值', exceed: '超标倍数',
  limit: '限值', grade: '等级', period: '时段', region: '区域',
  segment: '河段', outlet: '排污口', enterprise: '企业', method: '方法'
};

function propName(key) {
  return PROP_NAME_MAP[key] || key;
}

let activePopover = null;

function showNodePopover(nodeId) {
  hideNodePopover();
  const node = allNodes.find(item => item.id === nodeId);
  if (!node) return;
  const cfg = categoryStyle(node.group);
  const props = Object.entries(node.properties || {});

  const popover = document.createElement('div');
  popover.id = 'nodePopover';
  popover.style.cssText = `
    position: absolute;
    z-index: 100;
    min-width: 220px;
    max-width: 300px;
    background: rgba(24, 34, 52, 0.96);
    border: 1px solid rgba(14, 165, 233, 0.3);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(14,165,233,0.1);
    backdrop-filter: blur(12px);
    pointer-events: auto;
    animation: popoverIn 0.25s ease-out;
  `;

  const arrow = document.createElement('div');
  arrow.style.cssText = `
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: rgba(24, 34, 52, 0.96);
    border-right: 1px solid rgba(14, 165, 233, 0.3);
    border-bottom: 1px solid rgba(14, 165, 233, 0.3);
  `;

  let html = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${cfg.color}22;color:${cfg.color};font-size:16px">
      <i class="fa ${cfg.icon}"></i>
    </div>
    <div style="min-width:0">
      <div style="color:#F8FAFC;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(node.label)}</div>
      <div style="color:#94a3b8;font-size:11px">${escapeHtml(node.group)}</div>
    </div>
  </div>`;

  if (props.length) {
    html += '<div style="display:grid;gap:4px">';
    props.forEach(([k, v]) => {
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <span style="color:#94a3b8;font-size:12px;flex-shrink:0;margin-right:8px">${escapeHtml(propName(k))}</span>
        <span style="color:#E2E8F0;font-size:12px;text-align:right;word-break:break-all">${escapeHtml(v)}</span>
      </div>`;
    });
    html += '</div>';
  } else {
    html += '<div style="color:#94a3b8;font-size:12px;padding-top:4px">暂无详细属性。</div>';
  }

  popover.innerHTML = html;
  popover.appendChild(arrow);

  const graphContainer = $('knowledgeGraph');
  const rect = graphContainer.getBoundingClientRect();
  const pos = network.getPositions([nodeId])[nodeId];
  const domPos = network.canvasToDOM(pos);

  let left = domPos.x - 120;
  let top = domPos.y - 200;

  if (left < 10) left = 10;
  if (left + 300 > rect.width) left = rect.width - 310;
  if (top < 10) top = domPos.y + 24;

  popover.style.left = left + 'px';
  popover.style.top = top + 'px';

  graphContainer.style.position = 'relative';
  graphContainer.appendChild(popover);
  activePopover = popover;
}

function hideNodePopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
}

function showNodeDetail(nodeId) {
  const node = allNodes.find(item => item.id === nodeId);
  if (!node) return;
  const cfg = categoryStyle(node.group);
  const props = Object.entries(node.properties || {});
  $('nodeDetailBody').innerHTML = `<div class="flex items-center gap-3 mb-3"><div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${cfg.color}20;color:${cfg.color}"><i class="fa ${cfg.icon}"></i></div><div><div class="font-semibold" style="color:#F8FAFC">${escapeHtml(node.label)}</div><div class="text-xs" style="color:#93a4bb">${escapeHtml(node.group)}</div></div></div>${props.length ? `<div class="grid gap-2">${props.map(([k, v]) => `<div class="flex justify-between items-center py-1.5 border-b border-white/5 text-sm"><span style="color:#93a4bb">${escapeHtml(propName(k))}</span><span style="color:#E2E8F0">${escapeHtml(v)}</span></div>`).join('')}</div>` : '<div class="text-sm" style="color:#93a4bb">暂无详细属性。</div>'}`;
}

function initExceedControls() {
  const provinces = [...new Set(allNodes.filter(isRegionNode).map(node => node.label))].sort();
  $('exceedProvince').innerHTML = provinces.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  if (provinces.length) $('exceedProvince').value = provinces[0];
  $('runExceedBtn').addEventListener('click', loadExceedEvents);
}

async function loadExceedEvents() {
  const params = new URLSearchParams({ province: $('exceedProvince').value, start: $('exceedStart').value, end: $('exceedEnd').value });
  $('exceedSummary').textContent = '查询中...';
  $('exceedList').innerHTML = '';
  try {
    const res = await fetch(`${GRAPH_EXCEEDANCE_API}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || '超标事件接口返回失败');
    const events = payload.data || [];
    if (!events.length) {
      $('exceedSummary').textContent = '当前省份和时间范围内未查询到超标事件，可尝试切换省份或放宽日期范围。';
      $('exceedPollutantTag').style.display = 'none';
      return [];
    }
    const pollutants = [...new Set(events.map(item => item.pollutant || '未知'))];
    $('exceedSummary').textContent = `已查询到 ${events.length} 条超标事件，点击卡片可定位对应站点。`;
    $('exceedPollutantTag').style.display = pollutants.length === 1 ? 'inline-block' : 'none';
    if (pollutants.length === 1) $('exceedPollutantTag').textContent = pollutants[0];
    $('exceedList').innerHTML = events.map(item => `<button type="button" class="item-card p-3 text-sm text-left cursor-pointer" data-station="${escapeHtml(item.station || '')}" data-pollutant="${escapeHtml(item.pollutant || '')}" data-date="${escapeHtml(item.date || '')}"><div class="flex items-center justify-between mb-1"><span class="font-medium" style="color:#F8FAFC">${escapeHtml(item.station || '未知站点')}</span><span class="text-xs px-2 py-0.5 rounded-full" style="background:#f43f5e20;color:#f43f5e">${escapeHtml(item.pollutant || '未知')}</span></div><div class="flex items-center justify-between text-xs" style="color:#93a4bb"><span>${escapeHtml(item.date || '')}</span><span>倍数 ${escapeHtml(item.ratio != null ? Number(item.ratio).toFixed(2) : '-')}x</span></div><div class="text-xs mt-1" style="color:#93a4bb">数值 ${escapeHtml(item.value != null ? Number(item.value).toFixed(3) : '-')} / 限值 ${escapeHtml(item.limit != null ? Number(item.limit).toFixed(3) : '-')}</div></button>`).join('');
    $('exceedList').querySelectorAll('[data-station]').forEach(item => {
      item.addEventListener('click', () => {
        syncTraceSelection(item.dataset.station, item.dataset.pollutant, item.dataset.date);
        focusNodeByLabel(item.dataset.station);
      });
    });
    return events;
  } catch (error) {
    console.error(error);
    $('exceedSummary').textContent = `查询失败：${error.message}`;
    $('exceedPollutantTag').style.display = 'none';
    return [];
  }
}

function initTraceControls() {
  const stations = allNodes.filter(isStationNode).map(node => node.label).sort();
  const pollutants = allNodes.filter(isPollutantNode).map(node => node.label).sort();
  $('traceStation').innerHTML = stations.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  $('tracePollutant').innerHTML = pollutants.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  if (stations.length) $('traceStation').value = stations[0];
  if (pollutants.length) $('tracePollutant').value = pollutants[0];
  $('runTraceBtn').addEventListener('click', runTrace);
}

async function runTrace() {
  const params = new URLSearchParams({ station: $('traceStation').value, pollutant: $('tracePollutant').value, date: $('traceDate').value });
  $('traceSummary').textContent = '溯源分析中...';
  $('traceList').innerHTML = '';
  try {
    const res = await fetch(`${GRAPH_TRACE_API}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || '污染溯源接口返回失败');
    const traceData = payload.data || {};
    const candidates = traceData.source_candidates || traceData.upstream_exceedances || [];
    if (!candidates.length) {
      $('traceSummary').textContent = '未识别到上游风险站点。';
      return traceData;
    }
    const highRiskCount = candidates.filter(item => Number(item.source_score) >= 60).length;
    $('traceSummary').textContent = `识别到 ${candidates.length} 个上游风险站点，较高风险 ${highRiskCount} 个。`;
    $('traceList').innerHTML = candidates.map((item, index) => renderTraceCandidateCard(item, index)).join('');
    $('traceList').querySelectorAll('[data-label]').forEach(item => {
      item.addEventListener('click', () => focusNodeByLabel(item.dataset.label));
    });
    return traceData;
  } catch (error) {
    console.error(error);
    $('traceSummary').textContent = `溯源失败：${error.message}`;
    return null;
  }
}

async function loadUpstream(nodeId) {
  const node = allNodes.find(item => item.id === nodeId);
  if (!node) {
    $('upstreamSummary').textContent = '请选择监测站点查看直接上游信息。';
    $('upstreamList').innerHTML = '';
    return;
  }
  if (!isStationNode(node)) {
    $('upstreamSummary').textContent = `当前选中“${node.label}”是${node.group}，只有监测站点节点支持直接上游查询。`;
    $('upstreamList').innerHTML = '';
    return;
  }
  syncTraceSelection(node.label);
  $('upstreamSummary').textContent = '查询上游站点...';
  $('upstreamList').innerHTML = '';
  try {
    const res = await fetch(`${GRAPH_UPSTREAM_API}?${new URLSearchParams({ station: node.label }).toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || '上游站点接口返回失败');
    const rows = payload.data || [];
    if (!rows.length) {
      $('upstreamSummary').textContent = `站点“${node.label}”当前未识别到上游站点。`;
      return;
    }
    $('upstreamSummary').textContent = `站点“${node.label}”查询到 ${rows.length} 个上游站点。`;
    $('upstreamList').innerHTML = rows.map(item => {
      const meta = [
        item.province,
        item.river,
        item.distance_km != null ? `${formatNumber(item.distance_km, 1)} km` : '',
        item.flow_days != null ? `${item.flow_days} 天` : '',
      ].filter(Boolean).join(' · ');
      return `<div class="item-card p-3 text-sm cursor-pointer" data-label="${escapeHtml(item.name || '')}">
        <div class="flex items-center justify-between">
          <span style="color:#E2E8F0">${escapeHtml(item.name || '未知站点')}</span>
          <i class="fa fa-crosshairs text-xs" style="color:#0ea5e9"></i>
        </div>
        <div class="text-xs mt-1" style="color:#93a4bb">${escapeHtml(meta)}</div>
      </div>`;
    }).join('');
    $('upstreamList').querySelectorAll('[data-label]').forEach(item => item.addEventListener('click', () => focusNodeByLabel(item.dataset.label)));
  } catch (error) {
    console.error(error);
    $('upstreamSummary').textContent = `查询失败：${error.message}`;
  }
}

async function focusNodeByLabel(label) {
  const node = allNodes.find(item => item.label === label);
  if (!node || !network) return;
  network.focus(node.id, { scale: 1.2, animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
  network.selectNodes([node.id]);
  showNodeDetail(node.id);
  if (isStationNode(node)) {
    syncTraceSelection(node.label);
  }
  await loadUpstream(node.id);
}

async function applyLaunchContext() {
  const launch = getLaunchContext();
  if (!launch || !network) return;

  const launchPrefix = launch.source === 'sandbox' ? '已从沙盘接入' : '已定位';
  if (launch.source === 'sandbox') {
    setPhysicsEnabled(false);
  }
  $('searchInput').value = launch.province;
  $('searchStatus').textContent = `${launchPrefix} ${launch.province}${launch.date ? ` · ${launch.date}` : ''}`;

  let context = null;
  try {
    context = await fetchDecisionContext(launch);
  } catch (error) {
    console.warn('Failed to fetch decision context:', error);
  }

  const analysisDate = context?.analysis_date || launch.date || $('traceDate').value;
  if (setSelectValue('exceedProvince', launch.province)) {
    if (analysisDate) {
      $('exceedEnd').value = analysisDate;
      $('exceedStart').value = context?.historical_range?.start_date || shiftDateText(analysisDate, -30) || $('exceedStart').value;
    }
    await loadExceedEvents();
  }

  const preferredTrace = context?.upstream_traces?.[0] || null;
  const preferredTarget = preferredTrace?.target_station || context?.upstream_network?.[0]?.target_station || '';
  const preferredPollutant = preferredTrace?.pollutant || '';

  setSelectValue('traceStation', preferredTarget);
  setSelectValue('tracePollutant', preferredPollutant);
  if (analysisDate) {
    $('traceDate').value = preferredTrace?.exceed_date || analysisDate;
  }

  let traceData = null;
  if ($('traceStation').value && $('traceDate').value) {
    traceData = await runTrace();
  }

  const labels = collectLaunchLabels(launch, context, traceData);
  const statusText = `${launchPrefix} ${launch.province} 的知识图谱溯源链路`;
  const focused = focusSubgraphByLabels(labels, statusText);

  const targetNode = findNodeByLabel(preferredTarget) || findNodeByLabel(launch.province);
  if (targetNode) {
    network.selectNodes([targetNode.id]);
    showNodeDetail(targetNode.id);
    await loadUpstream(targetNode.id);
    if (!focused) {
      network.focus(targetNode.id, {
        scale: 1.15,
        animation: { duration: 700, easingFunction: 'easeInOutQuad' }
      });
    }
  }

  if (launch.source === 'sandbox') {
    setTimeout(() => {
      network && network.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
    }, 80);
  }

  const returnSandboxBtn = $('returnSandboxBtn');
  if (returnSandboxBtn) {
    returnSandboxBtn.setAttribute('href', buildSandboxReturnUrl());
  }
}

function initSearch() {
  $('searchBtn').addEventListener('click', searchNodes);
  $('resetBtn').addEventListener('click', resetView);
  $('searchInput').addEventListener('keydown', event => { if (event.key === 'Enter') searchNodes(); });
}

function searchNodes() {
  const query = $('searchInput').value.trim().toLowerCase();
  if (!query) {
    $('searchStatus').textContent = '请输入搜索关键词。';
    return;
  }
  const ids = allNodes.filter(node => [node.label, node.group, ...Object.values(node.properties || {})].join(' ').toLowerCase().includes(query)).map(node => node.id);
  if (!ids.length) {
    $('searchStatus').textContent = '未找到匹配的节点。';
    return;
  }
  nodesDataSet.update(allNodes.map(node => ({ id: node.id, hidden: !ids.includes(node.id) })));
  edgesDataSet.update(allEdges.map(edge => ({ id: edge.id, hidden: !(ids.includes(edge.from) && ids.includes(edge.to)) })));
  network.fit({ nodes: ids, animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
  $('searchStatus').textContent = `找到 ${ids.length} 个节点`;
}

function resetView() {
  $('searchInput').value = '';
  $('searchStatus').textContent = '输入名称定位节点。';
  filterByCategory('all');
  network && network.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
}

function initLayoutButtons() {
  $('forceLayoutBtn').addEventListener('click', () => switchLayout('force'));
  $('hierarchyLayoutBtn').addEventListener('click', () => switchLayout('hierarchy'));
  $('circleLayoutBtn').addEventListener('click', () => switchLayout('circle'));
  $('physicsBtn').addEventListener('click', togglePhysics);
  $('fitBtn').addEventListener('click', () => fitGraph());
  $('fullscreenBtn').addEventListener('click', toggleFullscreen);
}

function initGraphResize() {
  window.addEventListener('resize', () => fitGraph(80));

  const graphStage = $('knowledgeGraph')?.closest('.graph-stage');
  if (graphStage && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(() => fitGraph(40));
    observer.observe(graphStage);
  }
}

function switchLayout(type) {
  if (!network) return;
    $('forceLayoutBtn').classList.toggle('active', type === 'force');
  $('hierarchyLayoutBtn').classList.toggle('active', type === 'hierarchy');
  $('circleLayoutBtn').classList.toggle('active', type === 'circle');
  if (type === 'hierarchy') {
    network.setOptions({ layout: { hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed', levelSeparation: 120, nodeSpacing: 180 } }, physics: { enabled: false } });
  } else if (type === 'circle') {
    network.setOptions({ layout: { hierarchical: false }, physics: { enabled: false } });
    applyCircleLayout();
  } else {
    network.setOptions({ layout: { hierarchical: false }, physics: { enabled: true, solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -30, centralGravity: 0.005, springLength: 220, springConstant: 0.008, damping: 0.65, avoidOverlap: 0.15 }, stabilization: { enabled: true, iterations: 180, fit: true } } });
    network.once('stabilizationIterationsDone', () => {
      setPhysicsEnabled(false);
      network.storePositions();
      fitGraph(40);
    });
  }
}

function applyCircleLayout() {
  if (!network || !allNodes.length) return;
  const r = Math.max(200, allNodes.length * 12);
  const cx = 0, cy = 0;
  const updates = allNodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / allNodes.length;
    return { id: node.id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  nodesDataSet.update(updates);
  setTimeout(() => network.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } }), 100);
}

function setPhysicsEnabled(enabled) {
  physicsEnabled = !!enabled;
  if (!network) return;
  network.setOptions({ physics: { enabled: physicsEnabled } });
  $('physicsBtn').innerHTML = physicsEnabled ? '<i class="fa fa-pause"></i>关闭物理模拟' : '<i class="fa fa-play"></i>开启物理模拟';
  $('physicsBtn').classList.toggle('active', physicsEnabled);
}

function togglePhysics() {
  if (!network) return;
  setPhysicsEnabled(!physicsEnabled);
}

function toggleFullscreen() {
  const el = $('knowledgeGraph');
  if (!document.fullscreenElement) {
    el.requestFullscreen && el.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

function initUserMenu() {
  const btn = $('userMenuBtn');
  const menu = $('userMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', event => { event.stopPropagation(); menu.classList.toggle('hidden'); });
  document.addEventListener('click', event => { if (!menu.contains(event.target) && event.target !== btn) menu.classList.add('hidden'); });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function initMobileMenu() {
  const btn = $('mobileMenuBtn');
  const menu = $('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
}

window.logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  initUserMenu();
  initMobileMenu();
  initReturnSandboxLink();
  fetchData();
});

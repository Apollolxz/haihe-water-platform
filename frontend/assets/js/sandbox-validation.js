const API_ROOT = (() => {
    if (window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5001';
    }
    return window.location.origin;
})();

const API_BASE = `${API_ROOT}/api`;
const DEFAULT_PROVINCES = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省'];
const DEFAULT_DAYS = 90;
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const GRID_LINE = 'rgba(148, 163, 184, 0.1)';
const AXIS_LINE = 'rgba(148, 163, 184, 0.2)';
const COLORS = {
    actual: '#f8fdff',
    arima: '#53d3ff',
    lstm: '#6f8cff',
    featurePrimary: '#53d3ff',
    featureSecondary: '#9cd9ff',
};

function getApiRoot() {
    if (window.HAIHE_RUNTIME?.apiBaseUrl) {
        return String(window.HAIHE_RUNTIME.apiBaseUrl).replace(/\/+$/, '');
    }
    return API_ROOT;
}

function getApiBase() {
    if (window.HAIHE_RUNTIME?.resolveApi) {
        return window.HAIHE_RUNTIME.resolveApi('/api');
    }
    return `${getApiRoot()}/api`;
}

const state = {
    payload: null,
    controls: {
        provinces: [...DEFAULT_PROVINCES],
        indicators: [],
        time_modes: [],
        model_modes: [],
    },
    selections: {
        provinces: [...DEFAULT_PROVINCES],
        indicator: 'ammonia_nitrogen',
        timeMode: 'history',
        modelMode: 'COMPARE',
        radarProvince: '河北省',
        days: DEFAULT_DAYS,
    },
    detail: {
        search: '',
        filter: 'all',
        sortKey: 'province',
        sortDir: 'asc',
    },
    charts: {},
    requestId: 0,
    exportNotice: '',
    decision: {
        key: '',
        loading: false,
        data: null,
        error: '',
    },
};

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
    applySelectionsFromUrl();
    initClock();
    initCharts();
    bindEvents();
    await loadOverview();
    window.addEventListener('resize', resizeCharts);
});

function initCharts() {
    state.charts.time = echarts.init($('timeChart'));
    state.charts.spatial = echarts.init($('spatialChart'));
    state.charts.radar = echarts.init($('radarChart'));
    state.charts.scatter = echarts.init($('scatterChart'));
    state.charts.feature = echarts.init($('featureChart'));
}

function bindEvents() {
    $('indicatorSelect').addEventListener('change', (event) => {
        state.selections.indicator = event.target.value;
        loadOverview();
    });

    $('refreshOverviewBtn').addEventListener('click', () => loadOverview());
    $('exportGlobalBtn').addEventListener('click', exportSelection);
    $('generateDecisionBtn').addEventListener('click', () => generateDecision(false));
    $('refreshDecisionBtn').addEventListener('click', () => generateDecision(true));

    function closeAllPopovers() {
        document.querySelectorAll('.filter-popover').forEach(p => { p.style.display = 'none'; p.classList.remove('open'); });
        document.querySelectorAll('.expand-btn.micro i').forEach(i => i.className = 'fa fa-chevron-down');
    }

    function setupPopover(btnId, popoverId) {
        const btn = $(btnId);
        const popover = $(popoverId);
        if (!btn || !popover) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = popover.style.display === 'block';
            closeAllPopovers();
            if (!isOpen) {
                popover.style.display = 'block';
                popover.classList.add('open');
                btn.querySelector('i').className = 'fa fa-chevron-up';
            }
        });
    }

    setupPopover('provinceExpandBtn', 'provincePopover');
    setupPopover('indicatorExpandBtn', 'indicatorPopover');

    document.addEventListener('click', () => closeAllPopovers());

    $('scopeToggleRow').addEventListener('click', (event) => {
        const button = event.target.closest('[data-scope]');
        if (!button || button.dataset.scope !== 'all') return;
        state.selections.provinces = [...getAllProvinces()];
        state.selections.radarProvince = pickRadarProvince();
        closeAllPopovers();
        loadOverview();
    });

    $('provinceGrid').addEventListener('click', (event) => {
        const pill = event.target.closest('[data-province]');
        if (!pill) return;
        const province = pill.dataset.province;
        if (state.selections.provinces.length === 1 && state.selections.provinces[0] === province) {
            closeAllPopovers();
            return;
        }
        state.selections.provinces = [province];
        state.selections.radarProvince = province;
        closeAllPopovers();
        loadOverview();
    });

    $('indicatorTagRow').addEventListener('click', (event) => {
        const button = event.target.closest('[data-indicator]');
        if (!button || button.dataset.indicator === state.selections.indicator) return;
        state.selections.indicator = button.dataset.indicator;
        $('indicatorSelect').value = state.selections.indicator;
        closeAllPopovers();
        loadOverview();
    });

    $('timeModeGroup').addEventListener('click', (event) => {
        const button = event.target.closest('[data-time-mode]');
        if (!button || button.dataset.timeMode === state.selections.timeMode) return;
        state.selections.timeMode = button.dataset.timeMode;
        loadOverview();
    });

    $('modelModeGroup').addEventListener('click', (event) => {
        const button = event.target.closest('[data-model-mode]');
        if (!button || button.dataset.modelMode === state.selections.modelMode) return;
        state.selections.modelMode = button.dataset.modelMode;
        loadOverview();
    });

    $('detailSearchInput').addEventListener('input', (event) => {
        state.detail.search = event.target.value.trim();
        renderDetailPanel();
    });

    $('detailFilterTabs').addEventListener('click', (event) => {
        const button = event.target.closest('[data-detail-filter]');
        if (!button || button.dataset.detailFilter === state.detail.filter) return;
        state.detail.filter = button.dataset.detailFilter;
        renderDetailPanel();
    });

    $('detailResetBtn').addEventListener('click', () => {
        state.detail = {
            search: '',
            filter: 'all',
            sortKey: 'province',
            sortDir: 'asc',
        };
        $('detailSearchInput').value = '';
        renderDetailPanel();
    });

    $('detailTableWrap').addEventListener('click', (event) => {
        const button = event.target.closest('[data-sort]');
        if (!button) return;
        updateSort(button.dataset.sort);
        renderDetailPanel();
    });
}

function applySelectionsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const provinces = parseProvinceSelection((params.get('provinces') || params.get('province') || '').trim());
    if (provinces?.length) {
        state.selections.provinces = provinces;
    }

    const indicator = (params.get('indicator') || '').trim();
    if (indicator) {
        state.selections.indicator = indicator;
    }

    const timeMode = (params.get('time_mode') || '').trim().toLowerCase();
    if (timeMode) {
        state.selections.timeMode = timeMode;
    }

    const modelMode = (params.get('model_mode') || params.get('model_type') || '').trim().toUpperCase();
    if (modelMode) {
        state.selections.modelMode = modelMode;
    }

    const radarProvince = (params.get('radar_province') || state.selections.provinces[0] || '').trim();
    if (radarProvince) {
        state.selections.radarProvince = radarProvince;
    }

    const days = Number.parseInt((params.get('days') || '').trim(), 10);
    if (Number.isFinite(days) && days > 0) {
        state.selections.days = days;
    }
}

function parseProvinceSelection(rawValue) {
    if (!rawValue) {
        return null;
    }
    if (rawValue.toLowerCase() === 'all') {
        return [...DEFAULT_PROVINCES];
    }

    const validProvinces = new Set(DEFAULT_PROVINCES);
    const provinces = rawValue
        .split(',')
        .map((item) => item.trim())
        .filter((item) => validProvinces.has(item));

    return provinces.length ? [...new Set(provinces)] : null;
}

function initClock() {
    const el = $('metaClock');
    if (!el) return;
    const render = () => {
        const now = new Date();
        el.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };
    render();
    window.setInterval(render, 1000);
}

async function loadOverview() {
    const currentRequestId = ++state.requestId;
    toggleLoading(true);
    state.exportNotice = '';

    try {
        const requestUrl = buildOverviewUrl();
        const response = await fetch(requestUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(buildHttpErrorMessage(response.status));
        }

        const body = await response.json();
        if (!body.success) {
            throw new Error(body.error || '页面数据加载失败');
        }

        if (currentRequestId !== state.requestId) {
            return;
        }

        state.payload = body.data;
        state.controls = body.data.controls || state.controls;
        syncSelections(body.data.selection);
        sanitizeDetailState();
        renderOverview();
    } catch (error) {
        console.error(error);
        renderFatalError(error.message || '页面数据加载失败');
    } finally {
        toggleLoading(false);
    }
}

function buildOverviewUrl() {
    state.selections.radarProvince = pickRadarProvince();
    const params = new URLSearchParams();
    params.set('provinces', isAllSelected() ? 'all' : state.selections.provinces.join(','));
    params.set('indicator', state.selections.indicator);
    params.set('time_mode', state.selections.timeMode);
    params.set('model_mode', state.selections.modelMode);
    params.set('radar_province', state.selections.radarProvince);
    params.set('days', String(state.selections.days || DEFAULT_DAYS));
    return `${getApiBase()}/dashboard/validation-overview?${params.toString()}`;
}

function syncSelections(selection) {
    state.selections.provinces = [...(selection?.provinces || getAllProvinces())];
    state.selections.indicator = selection?.indicator?.field || state.selections.indicator;
    state.selections.timeMode = selection?.time_mode || state.selections.timeMode;
    state.selections.modelMode = selection?.model_mode || state.selections.modelMode;
    state.selections.radarProvince = selection?.radar_province || pickRadarProvince();
    state.selections.days = selection?.days || DEFAULT_DAYS;
}

function renderOverview() {
    if (!state.payload) return;
    syncDecisionState();
    renderHeader();
    renderControls();
    applyScopeLayout();
    renderConclusionPanel();
    renderTimePanel();
    renderSpatialPanel();
    renderRadarPanel();
    renderAccuracyPanel();
    renderDecisionPanel();
    renderDetailPanel();
    requestAnimationFrame(() => {
        resizeCharts();
    });
}

function renderHeader() {
    const { selection } = state.payload;
    $('selectionSummary').textContent = [
        selection.scope_label,
        selection.indicator.label,
        labelForMode(state.controls.time_modes, selection.time_mode),
        labelForMode(state.controls.model_modes, selection.model_mode),
    ].join(' · ');
}

function renderControls() {
    const { controls, selection } = state.payload;
    $('historyRange').textContent = formatRange(controls.history_range);
    $('predictionRange').textContent = formatRange(controls.prediction_range);

    const provinceLabel = isAllSelected() ? '全流域' : selection.provinces.join('、');
    $('provinceCurrent').textContent = provinceLabel;

    const currentIndicator = controls.indicators.find(item => item.field === selection.indicator.field);
    $('indicatorCurrent').textContent = currentIndicator ? currentIndicator.label : '--';

    $('scopeToggleRow').innerHTML = `
        <button class="toggle-btn ${isAllSelected() ? 'active' : ''}" data-scope="all">全流域</button>
    `;

    $('provinceGrid').innerHTML = getAllProvinces().map((province) => `
        <button class="check-pill ${!isAllSelected() && selection.provinces.includes(province) ? 'active' : ''}" data-province="${escapeHtml(province)}">
            <span>${escapeHtml(province)}</span>
        </button>
    `).join('');

    $('indicatorTagRow').innerHTML = controls.indicators.map((item) => `
        <button class="toggle-btn ${item.field === selection.indicator.field ? 'active' : ''}" data-indicator="${escapeHtml(item.field)}">
            ${escapeHtml(item.label)}
        </button>
    `).join('');

    $('indicatorSelect').innerHTML = controls.indicators.map((item) => `
        <option value="${escapeHtml(item.field)}" ${item.field === selection.indicator.field ? 'selected' : ''}>
            ${escapeHtml(item.label)}
        </option>
    `).join('');

    $('timeModeGroup').innerHTML = controls.time_modes.map((item) => `
        <button class="toggle-btn ${item.value === selection.time_mode ? 'active' : ''}" data-time-mode="${escapeHtml(item.value)}">
            ${escapeHtml(displayModeLabel(item.value, item.label))}
        </button>
    `).join('');

    $('modelModeGroup').innerHTML = controls.model_modes.map((item) => `
        <button class="toggle-btn ${item.value === selection.model_mode ? 'active' : ''}" data-model-mode="${escapeHtml(item.value)}">
            ${escapeHtml(item.label)}
        </button>
    `).join('');
}

function renderConclusionPanel() {
    const cards = state.payload.accuracy_panel?.cards || [];
    const bestCard = getBestModelCard(cards);
    const bestScore = getAccuracyScore(bestCard);
    const scopeLabel = state.payload.selection.scope_label;
    const indicatorLabel = state.payload.selection.indicator.label;
    $('summaryBanner').textContent = bestCard
        ? `当前最优模型：${bestCard.model_name}。${scopeLabel}${indicatorLabel}预测中，核心误差指标 RMSE 为 ${formatNumber(bestScore, 4)}，数值越小表示预测越准。`
        : '当前暂无可展示的模型精度结论。';

    $('metricGrid').innerHTML = cards.length
        ? cards.map((item) => {
            const isBest = bestCard && item.model_name === bestCard.model_name;
            return `
                <article class="metric-card compact-metric ${isBest ? 'best' : ''} metric-tooltip">
                    <header>
                        <div>
                            <h3>${escapeHtml(item.model_name)}</h3>
                        </div>
                        <span class="metric-badge">${isBest ? '当前最优' : '对比模型'}</span>
                    </header>
                    <div class="metric-values">
                        <div>
                            <strong>${formatNumber(item.rmse, 4)}</strong>
                            <label>RMSE</label>
                        </div>
                    </div>
                    <div class="tooltip-body">
                        <div style="display:grid;gap:6px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08)">
                            <div style="display:flex;justify-content:space-between"><span style="color:#94a3b8">MAE</span><span>${formatNumber(item.mae, 4)}</span></div>
                            <div style="display:flex;justify-content:space-between"><span style="color:#94a3b8">MSE</span><span>${formatNumber(item.mse, 4)}</span></div>
                            <div style="display:flex;justify-content:space-between"><span style="color:#94a3b8">RMSE</span><span>${formatNumber(item.rmse, 4)}</span></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8">
                            <span>样本数 ${formatInteger(item.sample_count)}</span>
                            <span>数值越小越准</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('')
        : '<div class="empty">当前暂无可展示的模型精度数据。</div>';
}

function renderTimePanel() {
    const panel = state.payload.time_panel;
    $('timeTitle').textContent = panel.title || '真实监测值 VS 模型预测值';
    $('timeSubtitle').textContent = isAllSelected()
        ? ''
        : '';
    $('forecastChip').textContent = '3个月预测';
    $('historyChip').classList.toggle('active', state.payload.selection.time_mode === 'history');
    $('forecastChip').classList.toggle('active', state.payload.selection.time_mode === 'forecast');

    const series = [{
        name: '历史监测',
        type: 'line',
        smooth: true,
        connectNulls: false,
        showSymbol: false,
        symbolSize: 6,
        lineStyle: { width: 3, color: COLORS.actual },
        itemStyle: { color: COLORS.actual },
        areaStyle: { color: 'rgba(83, 211, 255, 0.08)' },
        data: panel.actual || [],
    }];

    if (state.payload.selection.model_mode !== 'LSTM') {
        series.push(createLineSeries('ARIMA 预测', panel.arima || [], COLORS.arima));
    }
    if (state.payload.selection.model_mode !== 'ARIMA') {
        series.push(createLineSeries('LSTM 预测', panel.lstm || [], COLORS.lstm));
    }

    state.charts.time.setOption({
        backgroundColor: 'transparent',
        animationDuration: 500,
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(12, 24, 34, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            formatter: (params) => params
                .filter((item) => item.value !== null && item.value !== undefined && item.value !== '')
                .map((item) => `${item.marker}${item.seriesName} ${formatNumber(item.value, 3)}`)
                .join('<br>'),
        },
        legend: {
            top: 0,
            textStyle: { color: TEXT_MUTED },
            data: series.map((item) => item.name),
        },
        grid: { left: 56, right: 24, top: 46, bottom: 40 },
        xAxis: {
            type: 'category',
            data: panel.dates || [],
            boundaryGap: false,
            axisLine: { lineStyle: { color: AXIS_LINE } },
            axisLabel: { color: TEXT_MUTED, fontSize: 12 },
        },
        yAxis: {
            type: 'value',
            name: panel.unit || '',
            nameTextStyle: { color: TEXT_MUTED, padding: [0, 0, 0, 10] },
            axisLabel: { color: TEXT_MUTED, fontSize: 12 },
            splitLine: { lineStyle: { color: GRID_LINE } },
        },
        series,
        graphic: buildEmptyGraphic((panel.dates || []).length > 0, '暂无时序数据'),
    }, true);
}

function renderSpatialPanel() {
    const panel = state.payload.spatial_panel;
    const visibleModels = getVisibleSpatialModels();
    const comparisonRows = getScopedComparisonRows();
    const provinceLabels = comparisonRows.map((item) => item.province);
    const heatmapData = comparisonRows.flatMap((item, provinceIndex) =>
        visibleModels.map((model, modelIndex) => [provinceIndex, modelIndex, item[model.key]])
    );
    const visibleValues = heatmapData
        .map((item) => Number(item[2]))
        .filter((value) => Number.isFinite(value));
    const minValue = visibleValues.length ? Math.min(...visibleValues) : 0;
    const maxValue = visibleValues.length ? Math.max(...visibleValues) : 1;

    $('spatialTitle').textContent = '省市对比热力图';
    $('spatialSubtitle').textContent = isAllSelected()
        ? '全流域视角下保留六省市拆分，不合并为单一全流域热力值。'
        : '';
    $('spatialMeta').textContent = panel.latest_date ? `最新日期：${panel.latest_date}` : '';

    state.charts.spatial.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            position: 'top',
            backgroundColor: 'rgba(12, 24, 34, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            formatter: (params) => {
                const province = provinceLabels[params.value[0]] || panel.provinces?.[params.value[0]] || '';
                const model = visibleModels[params.value[1]]?.label || '';
                return `${province}<br>${model} ${formatNumber(params.value[2], 3)}${panel.unit ? ` ${panel.unit}` : ''}`;
            },
        },
        grid: { left: 102, right: 22, top: 16, bottom: 52 },
        xAxis: {
            type: 'category',
            data: provinceLabels,
            axisLine: { lineStyle: { color: AXIS_LINE } },
            axisLabel: { color: TEXT_MUTED, fontSize: 12, interval: 0 },
            splitArea: { show: true, areaStyle: { color: ['rgba(83, 211, 255, 0.015)', 'rgba(111, 140, 255, 0.02)'] } },
        },
        yAxis: {
            type: 'category',
            data: visibleModels.map((item) => item.label),
            axisLine: { lineStyle: { color: AXIS_LINE } },
            axisLabel: { color: TEXT_PRIMARY, fontSize: 13, fontWeight: 700 },
        },
        visualMap: {
            min: minValue,
            max: maxValue || 1,
            orient: 'horizontal',
            left: 'center',
            bottom: 0,
            text: ['高', '低'],
            textStyle: { color: TEXT_MUTED },
            inRange: {
                color: ['#0a243a', '#144468', '#1d6e9f', '#2ba6db', '#72e0ff'],
            },
        },
        series: [{
            name: '省市热力矩阵',
            type: 'heatmap',
            data: heatmapData,
            label: {
                show: true,
                color: TEXT_PRIMARY,
                textBorderColor: 'rgba(3, 16, 24, 0.8)',
                textBorderWidth: 2,
                formatter: ({ value }) => formatNumber(value[2], 2),
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 14,
                    shadowColor: 'rgba(83, 211, 255, 0.26)',
                },
            },
        }],
        graphic: buildEmptyGraphic(heatmapData.length > 0, '暂无省市对比数据'),
    }, true);
}

function renderRadarPanel() {
    const panel = state.payload.radar_panel;
    const province = panel.province || pickRadarProvince();
    $('radarTitle').textContent = '多指标雷达';
    $('radarSubtitle').textContent = isAllSelected()
        ? `${province} · 3个月预测（全流域下按参考省展示）`
        : `${province} · 3个月预测`;
    $('radarMeta').textContent = isAllSelected() ? `参考省：${province}` : 'CV% 越低越稳';

    const series = [];
    if (state.payload.selection.model_mode !== 'LSTM') {
        series.push({
            name: 'ARIMA',
            type: 'radar',
            symbol: 'circle',
            data: [{
                value: (panel.arima || []).map((value) => value ?? 0),
                name: 'ARIMA',
                areaStyle: { color: withAlpha(COLORS.arima, 0.16) },
                lineStyle: { color: COLORS.arima, width: 2 },
                itemStyle: { color: COLORS.arima },
            }],
        });
    }
    if (state.payload.selection.model_mode !== 'ARIMA') {
        series.push({
            name: 'LSTM',
            type: 'radar',
            symbol: 'circle',
            data: [{
                value: (panel.lstm || []).map((value) => value ?? 0),
                name: 'LSTM',
                areaStyle: { color: withAlpha(COLORS.lstm, 0.16) },
                lineStyle: { color: COLORS.lstm, width: 2 },
                itemStyle: { color: COLORS.lstm },
            }],
        });
    }

    const radarLegendColors = series.map((item) => (item.name === 'ARIMA' ? COLORS.arima : COLORS.lstm));

    state.charts.radar.setOption({
        backgroundColor: 'transparent',
        color: radarLegendColors,
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(12, 24, 34, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
        },
        legend: {
            top: 0,
            data: series.map((item) => item.name),
            icon: 'roundRect',
            textStyle: { color: TEXT_MUTED },
        },
        radar: {
            radius: '64%',
            center: ['50%', '58%'],
            splitNumber: 5,
            indicator: (panel.indicators || []).map((name) => ({ name, max: panel.max_value || 100 })),
            axisName: { color: TEXT_PRIMARY, fontSize: 11 },
            splitLine: { lineStyle: { color: [GRID_LINE] } },
            splitArea: { areaStyle: { color: ['rgba(83, 211, 255, 0.01)', 'rgba(83, 211, 255, 0.03)'] } },
            axisLine: { lineStyle: { color: 'rgba(141, 174, 192, 0.14)' } },
        },
        series,
        graphic: buildEmptyGraphic((panel.indicators || []).length > 0, '暂无雷达分析数据'),
    }, true);
}

function renderAccuracyPanel() {
    const panel = state.payload.accuracy_panel;
    const scatter = panel.scatter || {};
    $('scatterTitle').textContent = '误差散点';
    $('scatterSubtitle').textContent = '';

    const scatterSeries = [];
    if (state.payload.selection.model_mode !== 'LSTM') {
        scatterSeries.push(createScatterSeries('ARIMA', scatter.arima || [], COLORS.arima));
    }
    if (state.payload.selection.model_mode !== 'ARIMA') {
        scatterSeries.push(createScatterSeries('LSTM', scatter.lstm || [], COLORS.lstm));
    }

    state.charts.scatter.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(12, 24, 34, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            formatter: (params) => {
                const point = params.data?.raw;
                if (!point) return params.seriesName;
                return [
                    params.seriesName,
                    `${formatNumber(point.x, 3)}${scatter.unit ? ` ${scatter.unit}` : ''}`,
                    `${formatNumber(point.y, 4)}`,
                ].join('<br>');
            },
        },
        legend: {
            top: 0,
            data: scatterSeries.map((item) => item.name),
            textStyle: { color: TEXT_MUTED },
        },
        grid: { left: 56, right: 18, top: 42, bottom: 38 },
        xAxis: {
            type: 'value',
            name: scatter.unit ? `真实值 (${scatter.unit})` : '真实值',
            nameLocation: 'middle',
            nameGap: 28,
            nameTextStyle: { color: TEXT_MUTED },
            axisLabel: { color: TEXT_MUTED, fontSize: 12 },
            splitLine: { lineStyle: { color: GRID_LINE } },
        },
        yAxis: {
            type: 'value',
            name: '误差',
            nameTextStyle: { color: TEXT_MUTED },
            axisLabel: { color: TEXT_MUTED, fontSize: 12 },
            splitLine: { lineStyle: { color: GRID_LINE } },
        },
        series: scatterSeries,
        graphic: buildEmptyGraphic(scatterSeries.some((item) => item.data.length > 0), '暂无误差散点数据'),
    }, true);

    const feature = panel.feature_importance || {};
    $('featureTitle').textContent = '特征重要性';
    $('featureSubtitle').textContent = isAllSelected()
        ? `${feature.province || pickRadarProvince()} · ${feature.indicator_label || state.payload.selection.indicator.label}（全流域下按参考省展示）`
        : `${feature.province || pickRadarProvince()} · ${feature.indicator_label || state.payload.selection.indicator.label}`;

    const featureSeries = [{
        name: '随机森林',
        type: 'bar',
        itemStyle: { color: COLORS.featurePrimary, borderRadius: [0, 10, 10, 0] },
        data: feature.rf || [],
        barMaxWidth: 16,
    }];
    if (feature.xgb_available) {
        featureSeries.push({
            name: 'XGBoost',
            type: 'bar',
            itemStyle: { color: COLORS.featureSecondary, borderRadius: [0, 10, 10, 0] },
            data: feature.xgb || [],
            barMaxWidth: 16,
        });
    }

    state.charts.feature.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(12, 24, 34, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#f8fafc' },
            formatter: (params) => [
                params[0]?.axisValue || '',
                ...params.map((item) => `${item.marker}${item.seriesName} ${formatNumber(item.value, 2)}%`),
            ].filter(Boolean).join('<br>'),
        },
        legend: {
            top: 0,
            data: featureSeries.map((item) => item.name),
            textStyle: { color: TEXT_MUTED },
        },
        grid: { left: 86, right: 18, top: 42, bottom: 18 },
        xAxis: {
            type: 'value',
            name: '权重占比 %',
            nameTextStyle: { color: TEXT_MUTED },
            axisLabel: { color: TEXT_MUTED, fontSize: 12 },
            splitLine: { lineStyle: { color: GRID_LINE } },
        },
        yAxis: {
            type: 'category',
            data: feature.features || [],
            axisLabel: { color: TEXT_PRIMARY, fontSize: 11 },
            axisLine: { lineStyle: { color: AXIS_LINE } },
        },
        series: featureSeries,
        graphic: buildEmptyGraphic(feature.available && (feature.features || []).length > 0, '暂无特征重要性数据'),
    }, true);

    $('featureTableBody').innerHTML = feature.available
        ? (feature.table || []).slice(0, 6).map((item) => `
            <tr>
                <td>${escapeHtml(item.feature)}</td>
                <td>${formatNumber(item.avg, 2)}%</td>
            </tr>
        `).join('')
        : '<tr><td colspan="2">当前条件下暂无可展示的核心权重结果。</td></tr>';
}

function syncDecisionState() {
    const key = getDecisionKey();
    if (state.decision.key === key) {
        return;
    }
    state.decision = {
        key,
        loading: false,
        data: null,
        error: '',
    };
}

function getDecisionProvince() {
    if (!state.payload || isAllSelected()) {
        return null;
    }
    return state.payload.selection?.provinces?.[0] || state.selections.provinces[0] || null;
}

function getDecisionModelType() {
    if (!state.payload) {
        return 'LSTM';
    }
    const currentMode = state.payload.selection?.model_mode || state.selections.modelMode;
    if (currentMode === 'ARIMA' || currentMode === 'LSTM') {
        return currentMode;
    }
    const bestCard = getBestModelCard(state.payload.accuracy_panel?.cards || []);
    return bestCard?.model_name || 'LSTM';
}

function getDecisionKey() {
    const province = getDecisionProvince() || 'ALL';
    const modelType = getDecisionModelType();
    const predictionEnd = state.payload?.controls?.prediction_range?.end || '';
    return `${province}|${modelType}|${predictionEnd}`;
}

function getDecisionAvailability() {
    const province = getDecisionProvince();
    if (!province) {
        return {
            enabled: false,
            province: null,
            modelType: getDecisionModelType(),
            reason: '全流域模式下不生成单独治理方案，请先选择单个省份。',
        };
    }
    return {
        enabled: true,
        province,
        modelType: getDecisionModelType(),
        reason: '',
    };
}

function getDecisionAnalysisDate() {
    return state.decision.data?.date || state.payload?.controls?.prediction_range?.end || '';
}

function getKnowledgeGraphLaunchSelection() {
    const selection = state.payload?.selection || {};
    const provinces = selection.provinces?.length ? selection.provinces : state.selections.provinces;
    return {
        provinces: provinces?.length ? provinces : [getDecisionProvince()].filter(Boolean),
        indicator: selection.indicator?.field || state.selections.indicator,
        timeMode: selection.time_mode || state.selections.timeMode,
        modelMode: selection.model_mode || state.selections.modelMode,
        radarProvince: selection.radar_province || state.selections.radarProvince || getDecisionProvince() || '',
        days: selection.days || state.selections.days || DEFAULT_DAYS,
    };
}

function buildKnowledgeGraphTraceUrl(availability) {
    const selection = getKnowledgeGraphLaunchSelection();
    const params = new URLSearchParams({
        source: 'sandbox',
        province: availability.province,
        model_type: availability.modelType,
        provinces: selection.provinces.join(',') || availability.province,
        indicator: selection.indicator,
        time_mode: selection.timeMode,
        model_mode: selection.modelMode,
        radar_province: selection.radarProvince || availability.province,
        days: String(selection.days || DEFAULT_DAYS),
    });
    const date = getDecisionAnalysisDate();
    if (date) {
        params.set('date', date);
    }
    return `knowledge-graph.html?${params.toString()}`;
}

function openKnowledgeGraphTrace() {
    const availability = getDecisionAvailability();
    if (!availability.enabled) {
        return;
    }
    window.location.href = buildKnowledgeGraphTraceUrl(availability);
}

function renderDecisionPanel() {
    const availability = getDecisionAvailability();
    const predictionRange = state.payload?.controls?.prediction_range || null;
    const summary = state.payload?.selection?.scope_label || '当前筛选';

    $('decisionTitle').textContent = 'AI治理决策';
    $('decisionSubtitle').textContent = availability.enabled
        ? `${availability.province} · ${availability.modelType} · 预测区间 ${formatRange(predictionRange)}`
        : '选择单个省份后，可结合预测数据与溯源图谱生成分省治理方案。';

    $('generateDecisionBtn').disabled = !availability.enabled || state.decision.loading;
    $('refreshDecisionBtn').disabled = !availability.enabled || state.decision.loading;

    if (!availability.enabled) {
        $('decisionStatus').textContent = availability.reason;
        $('decisionFacts').innerHTML = '';
        $('decisionReport').classList.add('empty');
        $('decisionReport').textContent = `${summary}下仅展示聚合类图表，不生成单独的分省治理报告。`;
        return;
    }

    if (state.decision.loading) {
        $('decisionStatus').textContent = `正在为 ${availability.province} 生成 ${availability.modelType} 决策建议...`;
    } else if (state.decision.error) {
        $('decisionStatus').textContent = state.decision.error;
    } else if (state.decision.data) {
        if (state.decision.data.source === 'cache' || state.decision.data.source === 'deepseek') {
            $('decisionStatus').textContent = `${availability.province} 治理方案已就绪`;
        } else {
            $('decisionStatus').textContent = `${availability.province} 治理方案已就绪 · 降级生成 · Prompt ${state.decision.data.prompt_version || '--'}`;
        }
    } else {
        $('decisionStatus').textContent = `当前已切换到 ${availability.province}，点击“生成决策”即可获取分省治理方案。`;
    }

    renderDecisionFacts(availability);

    if (state.decision.data?.report) {
        $('decisionReport').classList.remove('empty');
        $('decisionReport').textContent = state.decision.data.report;
    } else if (state.decision.loading) {
        $('decisionReport').classList.add('empty');
        $('decisionReport').textContent = '正在组装预测趋势、历史对比与图谱溯源上下文，请稍候...';
    } else if (state.decision.error) {
        $('decisionReport').classList.add('empty');
        $('decisionReport').textContent = state.decision.error;
    } else {
        $('decisionReport').classList.add('empty');
        $('decisionReport').textContent = '点击“生成决策”后，这里会展示基于 3 个月预测结果和 Neo4j 溯源图谱生成的分省治理方案。';
    }
}

function renderDecisionFacts(availability) {
    const data = state.decision.data;
    const predictionRange = data?.prediction_range || null;
    const historicalRange = data?.historical_range || null;
    const summary = data?.summary || null;
    const cards = [
        {
            label: '当前对象',
            value: `${availability.province} · ${availability.modelType}`,
            note: '',
        },
        {
            label: '预测区间',
            value: predictionRange ? `${predictionRange.start_date} 至 ${predictionRange.end_date}` : formatRange(state.payload?.controls?.prediction_range),
            note: predictionRange ? `${predictionRange.day_count || 0} 天样本` : '',
        },
        {
            label: '历史对齐',
            value: historicalRange?.start_date && historicalRange?.end_date
                ? `${historicalRange.start_date} 至 ${historicalRange.end_date}`
                : '待生成后展示',
            note: summary?.comparison_lines?.[0] || '生成后展示真实监测与预测的重叠情况',
        },
        {
            label: '图谱溯源',
            value: summary?.trace_lines?.[0] || '待生成后展示',
            note: summary?.water_level_lines?.[0] || '点击进入知识图谱页查看对应省份的上游链路与水质等级分布',
            action: 'open-graph-trace',
        },
    ];

    $('decisionFacts').innerHTML = cards.map((item) => `
        <article class="decision-fact ${item.action ? 'is-link' : ''}" ${item.action ? `data-decision-action="${escapeHtml(item.action)}" role="link" tabindex="0"` : ''}>
            <label>${escapeHtml(item.label)}</label>
            <strong>${escapeHtml(item.value || '--')}</strong>
            ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ''}
        </article>
    `).join('');

    $('decisionFacts').querySelectorAll('[data-decision-action="open-graph-trace"]').forEach((card) => {
        card.addEventListener('click', openKnowledgeGraphTrace);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openKnowledgeGraphTrace();
            }
        });
    });
}

async function generateDecision(forceRefresh) {
    const availability = getDecisionAvailability();
    if (!availability.enabled) {
        renderDecisionPanel();
        return;
    }

    state.decision.loading = true;
    state.decision.error = '';
    renderDecisionPanel();

    try {
        const response = await fetch(`${getApiBase()}/decision/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            body: JSON.stringify({
                province: availability.province,
                model_type: availability.modelType,
                force_refresh: !!forceRefresh,
            }),
        });
        if (!response.ok) {
            let message = buildHttpErrorMessage(response.status);
            try {
                const errorBody = await response.json();
                message = errorBody.error || message;
            } catch (parseError) {
                console.warn(parseError);
            }
            throw new Error(message);
        }
        const body = await response.json();
        if (!body.success) {
            throw new Error(body.error || '治理方案生成失败');
        }
        state.decision.data = body.data;
    } catch (error) {
        console.error(error);
        state.decision.error = error.message || '治理方案生成失败';
    } finally {
        state.decision.loading = false;
        renderDecisionPanel();
    }
}

function renderDetailPanel() {
    const rows = getFilteredDetailRows();
    const columns = getDetailColumns();
    const totalRows = getScopedComparisonRows().length;

    $('exportTitle').textContent = '数据明细表格';
    $('exportSubtitle').textContent = isAllSelected()
        ? '全流域模式下展示六省市最新对比明细，不生成单独“全流域”汇总行。'
        : '';
    $('exportMeta').textContent = state.exportNotice || `${rows.length} 条结果`;

    $('detailFilterTabs').innerHTML = [
        { key: 'all', label: '全部' },
        { key: 'ARIMA', label: 'ARIMA 更优' },
        { key: 'LSTM', label: 'LSTM 更优' },
    ].map((item) => `
        <button class="tab ${state.detail.filter === item.key ? 'active' : ''}" data-detail-filter="${item.key}">
            ${item.label}
        </button>
    `).join('');

    $('detailSummary').textContent = `${state.payload.selection.scope_label} · ${state.payload.selection.indicator.label} · ${rows.length}/${totalRows} 条`;

    if (!rows.length) {
        $('detailTableWrap').innerHTML = '<div class="empty">当前筛选条件下暂无明细结果。</div>';
        return;
    }

    const headers = columns.map((column) => `
        <th>
            <button class="sortable" data-sort="${column.key}">
                ${column.label}
                <span class="sort-indicator">${sortIndicator(column.key)}</span>
            </button>
        </th>
    `).join('');

    $('detailTableWrap').innerHTML = `
        <table>
            <thead>
                <tr>${headers}</tr>
            </thead>
            <tbody>
                ${rows.map((row) => renderDetailRow(row, columns)).join('')}
            </tbody>
        </table>
    `;
}

function renderDetailRow(row, columns) {
    const isSingleProvince = !isAllSelected() && state.payload.selection.provinces.includes(row.province);
    const cells = columns.map((column) => `<td>${formatDetailCell(row, column)}</td>`).join('');
    return `<tr class="${isSingleProvince ? 'row-highlight' : ''}">${cells}</tr>`;
}

function formatDetailCell(row, column) {
    if (column.key === 'best_model') {
        return `<span class="pill ${bestModelClass(row.best_model)}">${escapeHtml(row.best_model || '--')}</span>`;
    }
    if (column.type === 'number') {
        return formatNumber(row[column.key], 3);
    }
    return escapeHtml(row[column.key] ?? '--');
}

function getFilteredDetailRows() {
    const rows = [...getScopedComparisonRows()];
    const keyword = state.detail.search.trim().toLowerCase();

    const filtered = rows.filter((row) => {
        const matchFilter = state.detail.filter === 'all' || row.best_model === state.detail.filter;
        const matchKeyword = !keyword
            || String(row.province || '').toLowerCase().includes(keyword)
            || String(row.best_model || '').toLowerCase().includes(keyword);
        return matchFilter && matchKeyword;
    });

    return filtered.sort((left, right) => compareDetailRows(left, right, state.detail.sortKey, state.detail.sortDir));
}

function getScopedComparisonRows() {
    const rows = state.payload?.spatial_panel?.comparison || [];
    if (isAllSelected()) {
        return rows;
    }
    const selectedSet = new Set(state.payload.selection.provinces);
    return rows.filter((row) => selectedSet.has(row.province));
}

function getDetailColumns() {
    const columns = [
        { key: 'province', label: '省市', type: 'text' },
        { key: 'actual', label: '历史监测', type: 'number' },
    ];

    if (state.payload.selection.model_mode === 'ARIMA') {
        columns.push({ key: 'arima', label: 'ARIMA 预测', type: 'number' });
    } else if (state.payload.selection.model_mode === 'LSTM') {
        columns.push({ key: 'lstm', label: 'LSTM 预测', type: 'number' });
    } else {
        columns.push({ key: 'arima', label: 'ARIMA 预测', type: 'number' });
        columns.push({ key: 'lstm', label: 'LSTM 预测', type: 'number' });
    }

    columns.push({ key: 'best_model', label: '最优模型', type: 'text' });
    return columns;
}

function compareDetailRows(left, right, sortKey, sortDir) {
    const multiplier = sortDir === 'desc' ? -1 : 1;
    const leftValue = left?.[sortKey];
    const rightValue = right?.[sortKey];

    if (sortKey === 'province' || sortKey === 'best_model') {
        return String(leftValue || '').localeCompare(String(rightValue || ''), 'zh-CN') * multiplier;
    }

    const leftNumber = Number(leftValue);
    const rightNumber = Number(rightValue);
    const safeLeft = Number.isFinite(leftNumber) ? leftNumber : Number.NEGATIVE_INFINITY;
    const safeRight = Number.isFinite(rightNumber) ? rightNumber : Number.NEGATIVE_INFINITY;
    return (safeLeft - safeRight) * multiplier;
}

function updateSort(sortKey) {
    const validKeys = new Set(getDetailColumns().map((column) => column.key));
    if (!validKeys.has(sortKey)) {
        state.detail.sortKey = 'province';
        state.detail.sortDir = 'asc';
        return;
    }

    if (state.detail.sortKey === sortKey) {
        state.detail.sortDir = state.detail.sortDir === 'asc' ? 'desc' : 'asc';
        return;
    }

    state.detail.sortKey = sortKey;
    state.detail.sortDir = sortKey === 'province' || sortKey === 'best_model' ? 'asc' : 'desc';
}

function sanitizeDetailState() {
    const validKeys = new Set(getDetailColumns().map((column) => column.key));
    if (!validKeys.has(state.detail.sortKey)) {
        state.detail.sortKey = 'province';
        state.detail.sortDir = 'asc';
    }

    if (!['all', 'ARIMA', 'LSTM'].includes(state.detail.filter)) {
        state.detail.filter = 'all';
    }
}

function exportSelection() {
    const provinces = isAllSelected() ? getAllProvinces() : state.payload.selection.provinces;
    const modelTypes = getExportModelTypes();
    const tasks = provinces.flatMap((province) => modelTypes.map((modelType) => ({
        province,
        modelType,
        url: buildExportFileUrl(province, modelType),
    })));

    if (!tasks.length) {
        window.alert('当前暂无可导出的预测数据。');
        return;
    }

    tasks.forEach((task) => {
        const link = document.createElement('a');
        link.href = absoluteUrl(task.url);
        link.rel = 'noopener';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
    });

    state.exportNotice = `已发起 ${tasks.length} 份导出：${isAllSelected() ? '全流域批量导出' : `${provinces[0]}导出`} · ${modelTypes.join(' / ')}`;
    $('exportMeta').textContent = state.exportNotice;
}

function buildExportFileUrl(province, modelType) {
    const params = new URLSearchParams({
        province,
        model_type: modelType,
    });
    return `/api/dashboard/validation-export-file?${params.toString()}`;
}

function getExportModelTypes() {
    if (state.payload.selection.model_mode === 'ARIMA') {
        return ['ARIMA'];
    }
    if (state.payload.selection.model_mode === 'LSTM') {
        return ['LSTM'];
    }
    return ['ARIMA', 'LSTM'];
}

function createLineSeries(name, values, color) {
    return {
        name,
        type: 'line',
        smooth: true,
        connectNulls: false,
        showSymbol: false,
        symbolSize: 6,
        lineStyle: { width: 3, color },
        itemStyle: { color },
        areaStyle: { color: 'transparent' },
        data: values,
    };
}

function withAlpha(hex, alpha) {
    const normalized = String(hex || '').trim();
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    if (!match) {
        return normalized;
    }
    const [, r, g, b] = match;
    return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
}

function createScatterSeries(name, points, color) {
    return {
        name,
        type: 'scatter',
        symbolSize: 10,
        itemStyle: { color, opacity: 0.78 },
        markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: 'rgba(239, 68, 68, 0.55)', type: 'dashed' },
            data: [{ yAxis: 0 }],
        },
        data: (points || []).map((point) => ({
            value: [point.x, point.y],
            raw: point,
        })),
    };
}

function getVisibleSpatialModels() {
    const models = [{ key: 'actual', label: '历史监测' }];
    if (state.payload.selection.model_mode !== 'LSTM') {
        models.push({ key: 'arima', label: 'ARIMA 预测' });
    }
    if (state.payload.selection.model_mode !== 'ARIMA') {
        models.push({ key: 'lstm', label: 'LSTM 预测' });
    }
    return models;
}

function applyScopeLayout() {
    const aggregateOnly = isAllSelected();
    const mainVisuals = document.querySelector('.main-visuals');
    if (mainVisuals) {
        mainVisuals.classList.toggle('aggregate-only', aggregateOnly);
    }

    ['.spatial-panel', '.radar-panel', '.detail-panel'].forEach((selector) => {
        const panel = document.querySelector(selector);
        if (panel) {
            panel.hidden = aggregateOnly;
        }
    });
}

function pickRadarProvince() {
    if (!isAllSelected()) {
        return state.selections.provinces[0];
    }
    const all = getAllProvinces();
    if (all.includes(state.selections.radarProvince)) {
        return state.selections.radarProvince;
    }
    return all[0];
}

function getBestModelCard(cards) {
    if (!cards?.length) return null;
    return [...cards].sort((left, right) => getAccuracyScore(left) - getAccuracyScore(right))[0];
}

function getAccuracyScore(card) {
    if (!card) return Number.POSITIVE_INFINITY;
    if (Number.isFinite(Number(card.rmse))) return Number(card.rmse);
    if (Number.isFinite(Number(card.mae))) return Number(card.mae);
    if (Number.isFinite(Number(card.mse))) return Number(card.mse);
    return Number.POSITIVE_INFINITY;
}

function formatRange(range) {
    if (!range?.start || !range?.end) {
        return '--';
    }
    return `${range.start} 至 ${range.end}`;
}

function sortIndicator(key) {
    if (state.detail.sortKey !== key) {
        return '↕';
    }
    return state.detail.sortDir === 'asc' ? '↑' : '↓';
}

function bestModelClass(modelName) {
    if (modelName === 'ARIMA') return 'best-arima';
    if (modelName === 'LSTM') return 'best-lstm';
    return '';
}

function renderFatalError(message) {
    $('selectionSummary').textContent = message;
    $('summaryBanner').textContent = message;
    $('timeSubtitle').textContent = '';
    $('spatialSubtitle').textContent = '';
    $('radarSubtitle').textContent = '';
    $('scatterSubtitle').textContent = '';
    $('featureSubtitle').textContent = '';
    $('detailSummary').textContent = message;
    $('decisionStatus').textContent = message;
    $('decisionFacts').innerHTML = '';
    $('decisionReport').classList.add('empty');
    $('decisionReport').textContent = '治理方案模块暂时不可用，请稍后重试。';
    $('metricGrid').innerHTML = '<div class="empty">页面数据加载失败，请稍后重试。</div>';
    $('featureTableBody').innerHTML = '<tr><td colspan="2">暂无可展示数据。</td></tr>';
    $('detailTableWrap').innerHTML = '<div class="empty">页面加载失败，请稍后重试。</div>';

    Object.values(state.charts).forEach((chart) => {
        chart.clear();
        chart.setOption({
            graphic: buildEmptyGraphic(false, message),
        });
    });
}

function buildHttpErrorMessage(status) {
    if (status === 404) {
        return '数据暂未就绪';
    }
    return '页面数据加载失败';
}

function buildEmptyGraphic(hasData, message) {
    if (hasData) {
        return [];
    }
    return [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
            text: message,
            fill: TEXT_MUTED,
            fontSize: 14,
        },
    }];
}

function isAllSelected() {
    return state.selections.provinces.length === getAllProvinces().length;
}

function getAllProvinces() {
    return state.controls?.provinces?.length ? state.controls.provinces : DEFAULT_PROVINCES;
}

function labelForMode(options, value) {
    const match = (options || []).find((item) => item.value === value);
    return displayModeLabel(value, match ? match.label : value);
}

function displayModeLabel(value, label) {
    if (value === 'forecast') {
        return '3个月预测';
    }
    return label;
}

function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '--';
    }
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(Number(value));
}

function formatInteger(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '--';
    }
    return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(Number(value));
}

function absoluteUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) {
        return path;
    }
    return new URL(path, getApiRoot()).toString();
}

function resizeCharts() {
    Object.values(state.charts).forEach((chart) => chart.resize());
}

function toggleLoading(visible) {
    $('loadingMask').classList.toggle('hidden', !visible);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function pad(value) {
    return String(value).padStart(2, '0');
}

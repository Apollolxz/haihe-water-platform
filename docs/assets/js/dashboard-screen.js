const API_BASE = (() => {
    if (window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5001/api';
    }
    return `${window.location.origin}/api`;
})();

const PROVINCES = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省'];
const MAP_FOCUS = {
    center: [116.55, 37.8],
    zoom: 3.35,
};

const state = {
    province: 'all',
    payload: null,
    charts: {},
    geoReady: false,
    geoJson: null,
};

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
    initParticles();
    initClock();
    initCharts();
    bindStaticEvents();
    await loadOverview();
    window.addEventListener('resize', resizeCharts);
});

function initCharts() {
    state.charts.map = echarts.init($('mapChart'));
    state.charts.model = echarts.init($('modelChart'));
    state.charts.trend = echarts.init($('trendChart'));
    state.charts.provinceRank = echarts.init($('provinceRankChart'));
    state.charts.pollutant = echarts.init($('pollutantChart'));
    state.charts.indicatorRadar = echarts.init($('indicatorRadarChart'));
}

function bindStaticEvents() {
    $('mapChart').addEventListener('dblclick', () => setScope('all'));
}

function initClock() {
    const render = () => {
        const now = new Date();
        const text = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        $('metaClock').textContent = text;
    };
    render();
    setInterval(render, 1000);
}

async function loadOverview() {
    toggleLoading(true);
    try {
        const resp = await fetch(`${API_BASE}/dashboard/screen-overview?province=${encodeURIComponent(state.province)}`);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
        }
        const body = await resp.json();
        if (!body.success) {
            throw new Error(body.error || '数据加载失败');
        }
        state.payload = body.data;
        renderAll();
    } catch (error) {
        console.error(error);
        renderError(error.message || '数据加载失败');
    } finally {
        toggleLoading(false);
    }
}

function renderAll() {
    if (!state.payload) return;
    renderHeader();
    renderScopeButtons();
    renderSummary();
    renderIndicators();
    renderRankings();
    renderModelChart();
    renderTrendChart();
    renderMapChart();
    renderProvinceRankChart();
    renderPollutantChart();
    renderIndicatorRadar();
    renderNewLayout();
    // 确保图表尺寸正确
    setTimeout(resizeCharts, 100);
}

function renderHeader() {
    const { header, scope } = state.payload;
    $('pageTitle').textContent = header.title;
    $('currentScope').textContent = `${scope.label}宏观水质总览`;
    $('metaRange').textContent = header.monitor_range;
    $('metaIndicators').textContent = `${header.indicator_count} 项核心水质指标`;
    $('metaCycle').textContent = header.data_cycle;
}

function renderScopeButtons() {
    const wrap = $('provinceButtons');
    const current = state.payload.scope.province;
    const buttons = [{ label: '全流域', value: 'all' }, ...PROVINCES.map((name) => ({ label: name, value: name }))];
    wrap.innerHTML = buttons.map((item) => `
        <button class="province-btn ${current === item.value ? 'active' : ''}" data-province="${item.value}">
            ${item.label}
        </button>
    `).join('');
    wrap.querySelectorAll('.province-btn').forEach((button) => {
        button.addEventListener('click', () => setScope(button.dataset.province));
    });
}

function renderSummary() {
    const { summary, scope } = state.payload;
    $('scopeScore').textContent = formatValue(summary.composite_score, 1);
    $('scopeScoreFoot').textContent = '';
    $('scopeLevel').textContent = summary.quality_level;
    $('scopeLevelFoot').textContent = '';
    $('scopeStations').textContent = formatInteger(summary.station_count);
    $('scopeStationsFoot').textContent = '';
    $('scopeAlerts').textContent = formatInteger(summary.abnormal_events_30d);
    $('scopeAlertsFoot').textContent = '';
    $('indicatorWindow').textContent = '';
    $('indicatorNotes').textContent = '';
}

function renderIndicators() {
    const grid = $('indicatorGrid');
    grid.innerHTML = state.payload.indicators.map((item) => {
        const deltaClass = item.change_state === 'improved' ? 'delta-improved'
            : item.change_state === 'worsened' ? 'delta-worsened'
            : 'delta-neutral';
        const cardClass = item.change_state === 'improved' ? 'improved'
            : item.change_state === 'worsened' ? 'worsened'
            : '';
        return `
            <article class="indicator-card ${cardClass}">
                <div class="indicator-top">
                    <div class="indicator-name">${item.name}</div>
                </div>
                <div class="indicator-value">
                    <strong>${displayMetric(item.value)}</strong>
                    <span>${item.unit || '—'}</span>
                </div>
                <div class="indicator-meta">
                    <span>${item.rate_label}</span>
                    <strong>${displayPercent(item.exceed_rate)}</strong>
                </div>
                <div class="indicator-meta">
                    <span>同比变化</span>
                    <strong class="${deltaClass}">${displayDelta(item.yoy_change)}</strong>
                </div>
            </article>
        `;
    }).join('');
}

function renderRankings() {
    const provinceWrap = $('provinceRanking');
    provinceWrap.innerHTML = state.payload.rankings.province_ranking.map((item) => `
        <div class="ranking-item ${item.selected ? 'selected' : ''}" data-province="${item.province}">
            <div class="rank-no">${item.rank}</div>
            <div>
                <div class="rank-topline">
                    <span>${item.province}</span>
                    <strong>${formatValue(item.composite_score, 1)}</strong>
                </div>
                <div class="rank-subline">
                    <span>${item.level_name}</span>
                    <span>${item.dominant_pollutant}</span>
                </div>
                <div class="rank-bar"><span style="width:${Math.max(10, item.composite_score || 0)}%"></span></div>
            </div>
        </div>
    `).join('');
    provinceWrap.querySelectorAll('.ranking-item').forEach((el) => {
        el.addEventListener('click', () => setScope(el.dataset.province));
    });

    $('pollutantRanking').innerHTML = state.payload.rankings.pollutant_ranking.map((item, index) => `
        <div class="ranking-item">
            <div class="rank-no">${index + 1}</div>
            <div>
                <div class="rank-topline">
                    <span>${item.name}</span>
                    <strong>${displayPercent(item.rate)}</strong>
                </div>
                <div class="rank-subline">
                    <span>${item.threshold_display}</span>
                    <span>${item.exceed_count}/${item.sample_count}</span>
                </div>
                <div class="rank-bar"><span style="width:${Math.max(10, item.rate || 0)}%"></span></div>
            </div>
        </div>
    `).join('');
}

function renderModelChart() {
    const modelInfo = state.payload.model_accuracy;
    $('modelScope').textContent = '';
    $('modelMeta').innerHTML = '';

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            appendToBody: true,
            formatter: (params) => params.map((item) => `${item.seriesName}: ${formatSci(item.value)}`).join('<br>')
        },
        legend: {
            top: 4,
            right: 4,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: { color: '#94a3b8', fontSize: 10 },
            data: modelInfo.summary.map((item) => item.model_name),
        },
        grid: { top: 32, left: 14, right: 14, bottom: 24, containLabel: true },
        xAxis: {
            type: 'category',
            data: ['MAE', 'MSE'],
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'log',
            axisLabel: {
                color: '#94a3b8',
                fontSize: 9,
                formatter: (v) => {
                    const exp = Math.log10(v);
                    if (exp >= 12) return `${(v / 1e12).toFixed(1)}T`;
                    if (exp >= 9) return `${(v / 1e9).toFixed(1)}B`;
                    if (exp >= 6) return `${(v / 1e6).toFixed(1)}M`;
                    if (exp >= 3) return `${(v / 1e3).toFixed(1)}K`;
                    return v.toFixed(1);
                }
            },
            splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
            axisLine: { show: false },
        },
        series: modelInfo.summary.map((item, idx) => ({
            name: item.model_name,
            type: 'bar',
            barMaxWidth: 18,
            barGap: '30%',
            itemStyle: {
                color: idx === 0
                    ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(14,165,233,0.8)' }, { offset: 1, color: 'rgba(14,165,233,0.3)' }])
                    : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(34,197,94,0.8)' }, { offset: 1, color: 'rgba(34,197,94,0.3)' }]),
                borderRadius: [4, 4, 0, 0],
            },
            label: {
                show: true,
                position: 'top',
                color: '#e2e8f0',
                fontSize: 9,
                formatter: (p) => {
                    const v = p.value;
                    const exp = Math.log10(v);
                    if (exp >= 12) return `${(v / 1e12).toFixed(1)}T`;
                    if (exp >= 9) return `${(v / 1e9).toFixed(1)}B`;
                    if (exp >= 6) return `${(v / 1e6).toFixed(1)}M`;
                    if (exp >= 3) return `${(v / 1e3).toFixed(1)}K`;
                    return v.toFixed(1);
                }
            },
            data: [item.avg_mae, item.avg_mse],
        })),
    };
    state.charts.model.setOption(option, true);
}

function renderTrendChart() {
    const trend = state.payload.trend;
    $('trendMeta').textContent = '';
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            appendToBody: true,
            formatter: (params) => {
                const point = params[0];
                return `${point.axisValue}<br>${trend.series_name}: ${point.value}`;
            }
        },
        grid: { top: 34, left: 20, right: 16, bottom: 24, containLabel: true },
        xAxis: {
            type: 'category',
            data: trend.dates,
            boundaryGap: false,
            axisLabel: { color: '#8daec0' },
            axisLine: { lineStyle: { color: 'rgba(141,174,192,0.24)' } },
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { color: '#8daec0' },
            splitLine: { lineStyle: { color: 'rgba(141,174,192,0.08)' } },
        },
        series: [{
            name: trend.series_name,
            type: 'line',
            smooth: true,
            symbolSize: 7,
            lineStyle: { color: '#53d3ff', width: 3 },
            itemStyle: { color: '#53d3ff' },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(83, 211, 255, 0.34)' },
                    { offset: 1, color: 'rgba(83, 211, 255, 0.02)' },
                ]),
            },
            markLine: {
                symbol: 'none',
                label: { color: '#8daec0' },
                lineStyle: { color: 'rgba(255, 207, 95, 0.42)', type: 'dashed' },
                data: [{ yAxis: trend.average_score }],
            },
            markPoint: {
                symbol: 'pin',
                symbolSize: 38,
                label: { color: '#07121f', fontSize: 10, formatter: (p) => Math.round(p.value) },
                data: trend.anomaly_points.map((item) => ({
                    name: item.label,
                    coord: [item.date, item.value],
                    value: item.value,
                    itemStyle: { color: '#ffcf5f' },
                })),
            },
            data: trend.scores,
        }],
    };
    state.charts.trend.setOption(option, true);
}

async function renderMapChart() {
    try {
        const mapData = state.payload.map;
        await ensureGeoJson();
        const scopeProvince = state.payload.scope?.province || 'all';
        const mapFocus = resolveMapFocus(mapData, scopeProvince);
        const focusProvinceOutlines = getFocusProvinceOutlines(scopeProvince);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                appendToBody: true,
                formatter: (params) => {
                    const data = params.data || {};
                    if (params.seriesType === 'effectScatter') {
                        return [
                            `<strong style="color:#38bdf8">${data.name}</strong>`,
                            `省份：${data.province}`,
                            `综合指数：${displayMetric(data.composite_score)}`,
                            `等级：${data.level_name}`,
                            `溶解氧：${displayMetric(data.dissolved_oxygen)}`,
                            `氨氮：${displayMetric(data.ammonia_nitrogen)}`,
                        ].join('<br>');
                    }
                    if (data.province) {
                        return [
                            `<strong style="color:#38bdf8">${data.province}</strong>`,
                            `综合指数：${displayMetric(data.composite_score)}`,
                            `等级：${data.level_name}`,
                            `主导因子：${data.dominant_pollutant}`,
                            `站点数：${data.station_count}`,
                        ].join('<br>');
                    }
                    return params.name;
                }
            },
            geo: {
                map: 'china-dashboard',
                roam: true,
                zoom: mapFocus.zoom,
                center: mapFocus.center,
                scaleLimit: {
                    min: 1.1,
                    max: 6,
                },
                itemStyle: {
                    areaColor: '#111d2e',
                    borderColor: 'rgba(14, 165, 233, 0.35)',
                    borderWidth: 1.2,
                    shadowColor: 'rgba(0,0,0,0.4)',
                    shadowBlur: 8,
                },
                emphasis: {
                    itemStyle: {
                        areaColor: 'rgba(14, 165, 233, 0.35)',
                        borderColor: 'rgba(56, 189, 248, 0.8)',
                        borderWidth: 1.5,
                        shadowColor: 'rgba(14, 165, 233, 0.5)',
                        shadowBlur: 15,
                    },
                    label: { color: '#fff', fontWeight: 'bold' },
                },
                select: {
                    itemStyle: {
                        areaColor: 'rgba(14, 165, 233, 0.45)',
                        borderColor: '#38bdf8',
                        borderWidth: 2,
                        shadowColor: 'rgba(14, 165, 233, 0.6)',
                        shadowBlur: 20,
                    },
                    label: { color: '#fff', fontWeight: 'bold' },
                },
                label: {
                    show: true,
                    fontSize: 11,
                    color: '#b7c9da',
                    formatter: ({ name }) => PROVINCES.includes(name) ? name.replace(/(省|市)$/u, '') : '',
                },
            },
            series: [
                {
                    name: '省域等级',
                    type: 'map',
                    geoIndex: 0,
                    selectedMode: 'single',
                    data: mapData.provinces.map((item) => ({
                        name: item.province,
                        province: item.province,
                        value: item.level_index,
                        composite_score: item.composite_score,
                        level_name: item.level_name,
                        station_count: item.station_count,
                        dominant_pollutant: item.dominant_pollutant,
                        selected: state.payload.scope.province === item.province,
                        itemStyle: {
                            areaColor: state.payload.scope.province === item.province
                                ? 'rgba(14, 165, 233, 0.4)'
                                : (item.level_index <= 2
                                    ? 'rgba(14, 165, 233, 0.15)'
                                    : item.level_index === 3
                                        ? 'rgba(14, 165, 233, 0.08)'
                                        : 'rgba(244, 63, 94, 0.12)'),
                        }
                    })),
                },
                {
                    name: '重点省域光晕',
                    type: 'lines',
                    coordinateSystem: 'geo',
                    polyline: true,
                    silent: true,
                    zlevel: 2,
                    lineStyle: {
                        color: 'rgba(56, 189, 248, 0.26)',
                        width: 5.5,
                        opacity: 1,
                        shadowBlur: 12,
                        shadowColor: 'rgba(56, 189, 248, 0.42)',
                    },
                    data: focusProvinceOutlines,
                },
                {
                    name: '重点省域描边',
                    type: 'lines',
                    coordinateSystem: 'geo',
                    polyline: true,
                    silent: true,
                    zlevel: 3,
                    effect: {
                        show: true,
                        constantSpeed: 18,
                        trailLength: 0.08,
                        symbol: 'circle',
                        symbolSize: 3.5,
                        color: '#c9f7ff',
                    },
                    lineStyle: {
                        color: '#67e8f9',
                        width: 1.8,
                        opacity: 0.95,
                        cap: 'round',
                        join: 'round',
                    },
                    data: focusProvinceOutlines,
                },
                {
                    name: '监测站点',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 4,
                    showEffectOn: 'emphasis',
                    rippleEffect: {
                        scale: 2.4,
                        brushType: 'stroke',
                        period: 4.2,
                    },
                    symbolSize: (val) => {
                        const score = Number(val?.[2] || 0);
                        return Math.max(4, Math.min(6.2, 3.8 + score / 50));
                    },
                    label: {
                        show: false,
                    },
                    itemStyle: {
                        color: '#0ea5e9',
                        opacity: 0.9,
                        borderColor: 'rgba(226, 232, 240, 0.75)',
                        borderWidth: 0.9,
                        shadowBlur: 10,
                        shadowColor: 'rgba(14, 165, 233, 0.28)',
                    },
                    emphasis: {
                        scale: true,
                        itemStyle: {
                            color: '#7dd3fc',
                            borderColor: '#f8fafc',
                            borderWidth: 1.1,
                            shadowBlur: 18,
                            shadowColor: 'rgba(56, 189, 248, 0.72)',
                        },
                        label: {
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                        }
                    },
                    data: mapData.stations.map(s => ({
                        ...s,
                        itemStyle: { color: s.color || '#0ea5e9' }
                    })),
                },
            ],
        };
        state.charts.map.off('click');
        state.charts.map.setOption(option, true);
        state.charts.map.on('click', (params) => {
            const next = params.data?.province || params.name;
            if (PROVINCES.includes(next)) {
                setScope(next);
            }
        });
    } catch (error) {
        console.error('地图边界加载失败，已回退到省份摘要视图', error);
        renderMapFallback();
    }
}

async function ensureGeoJson() {
    if (state.geoReady) return;
    const resp = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    const geoJson = await resp.json();
    echarts.registerMap('china-dashboard', geoJson);
    state.geoJson = geoJson;
    state.geoReady = true;
}

function resolveMapFocus(mapData, scopeProvince = 'all') {
    const stations = Array.isArray(mapData?.stations) ? mapData.stations : [];
    const coords = stations
        .map((station) => [Number(station?.value?.[0]), Number(station?.value?.[1])])
        .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

    if (!coords.length) {
        return MAP_FOCUS;
    }

    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const lngSpan = Math.max(maxLng - minLng, 0.45);
    const latSpan = Math.max(maxLat - minLat, 0.35);
    const span = Math.max(lngSpan, latSpan * 1.25);
    const minZoom = scopeProvince === 'all' ? MAP_FOCUS.zoom : 4.3;

    return {
        center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
        zoom: clamp(1.4 + (23 / span), minZoom, 5.8),
    };
}

function getFocusProvinceOutlines(scopeProvince = 'all') {
    if (!state.geoJson?.features) return [];
    const focusedProvinces = scopeProvince === 'all' ? PROVINCES : [scopeProvince];
    return state.geoJson.features
        .filter((feature) => focusedProvinces.includes(feature?.properties?.name))
        .flatMap((feature) => extractProvinceOutline(feature.geometry, feature.properties.name));
}

function extractProvinceOutline(geometry, provinceName) {
    if (!geometry) return [];
    if (geometry.type === 'Polygon') {
        return geometry.coordinates
            .slice(0, 1)
            .map((ring) => ({
                province: provinceName,
                coords: ring,
            }));
    }
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates
            .map((polygon) => polygon?.[0])
            .filter(Boolean)
            .map((ring) => ({
                province: provinceName,
                coords: ring,
            }));
    }
    return [];
}

function renderMapFallback() {
    const data = state.payload.map.provinces;
    state.charts.map.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const item = params[0]?.dataRef;
                if (!item) return '';
                return `${item.province}<br>综合指数：${displayMetric(item.composite_score)}<br>等级：${item.level_name}<br>主导因子：${item.dominant_pollutant}`;
            }
        },
        grid: { top: 26, left: 18, right: 14, bottom: 20, containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((item) => item.province),
            axisLabel: { color: '#8daec0' },
            axisLine: { lineStyle: { color: 'rgba(141,174,192,0.24)' } },
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { color: '#8daec0' },
            splitLine: { lineStyle: { color: 'rgba(141,174,192,0.08)' } },
        },
        series: [{
            type: 'scatter',
            symbolSize: 18,
            itemStyle: {
                color: (params) => params.data.dataRef.color,
            },
            data: data.map((item) => ({
                value: item.composite_score,
                name: item.province,
                dataRef: item,
            })),
        }],
    }, true);
}

function renderProvinceRankChart() {
    const data = state.payload.rankings.province_ranking;
    if (!data || data.length === 0) return;
    const sorted = [...data].sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0));
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            appendToBody: true,
            formatter: (params) => {
                const p = params[0];
                const item = sorted[p.dataIndex];
                return `${item.province}<br/>综合指数: ${item.composite_score}<br/>等级: ${item.level_name}`;
            }
        },
        grid: { top: 10, left: 10, right: 30, bottom: 10, containLabel: true },
        xAxis: {
            type: 'value',
            max: 100,
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
            axisLine: { show: false },
        },
        yAxis: {
            type: 'category',
            data: sorted.map(item => item.province),
            axisLabel: { color: '#e2e8f0', fontSize: 11 },
            axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
            axisTick: { show: false },
        },
        series: [{
            type: 'bar',
            data: sorted.map((item, idx) => ({
                value: item.composite_score || 0,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: `rgba(14, 165, 233, ${0.5 + idx * 0.08})` },
                        { offset: 1, color: `rgba(6, 182, 212, ${0.25 + idx * 0.06})` },
                    ]),
                    borderRadius: [0, 6, 6, 0],
                }
            })),
            barWidth: 14,
            label: {
                show: true,
                position: 'right',
                color: '#e2e8f0',
                fontSize: 11,
                fontFamily: 'Rajdhani',
                formatter: '{c}'
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(14,165,233,0.4)'
                }
            }
        }]
    };
    state.charts.provinceRank.setOption(option, true);
}

function renderPollutantChart() {
    const data = state.payload.rankings.pollutant_ranking;
    if (!data || data.length === 0) return;
    const sorted = [...data].filter(d => (d.rate || 0) > 0).sort((a, b) => (a.rate || 0) - (b.rate || 0));
    if (sorted.length === 0) return;
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            appendToBody: true,
            formatter: (params) => {
                const p = params[0];
                const item = sorted[p.dataIndex];
                return `${item.name}<br/>超标率: ${item.rate}%<br/>样本: ${item.exceed_count}/${item.sample_count}`;
            }
        },
        grid: { top: 6, left: 10, right: 50, bottom: 18, containLabel: true },
        xAxis: {
            type: 'value',
            max: 100,
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%', interval: 24 },
            splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
            axisLine: { show: false },
        },
        yAxis: {
            type: 'category',
            data: sorted.map(item => item.name),
            axisLabel: { color: '#e2e8f0', fontSize: 11 },
            axisLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
            axisTick: { show: false },
        },
        series: [{
            type: 'bar',
            data: sorted.map((item) => ({
                value: item.rate || 0,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: 'rgba(244,63,94,0.7)' },
                        { offset: 1, color: 'rgba(245,158,11,0.4)' },
                    ]),
                    borderRadius: [0, 6, 6, 0],
                }
            })),
            barWidth: 16,
            label: {
                show: true,
                position: 'right',
                color: '#e2e8f0',
                fontSize: 10,
                fontFamily: 'Rajdhani',
                formatter: '{c}%'
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(244,63,94,0.4)'
                }
            }
        }]
    };
    state.charts.pollutant.setOption(option, true);
}

function renderIndicatorRadar() {
    const indicators = state.payload.indicators;
    if (!indicators || indicators.length === 0) return;
    // 选取6个核心指标做雷达图
    const coreFields = ['ph', 'ammonia_nitrogen', 'dissolved_oxygen', 'permanganate_index', 'total_phosphorus', 'total_nitrogen'];
    const coreNames = ['pH', '氨氮', '溶解氧', '高锰酸钾', '总磷', '总氮'];
    const maxVals = [14, 2, 15, 10, 1, 2];
    
    const radarData = [];
    const radarIndicators = [];
    
    coreFields.forEach((field, idx) => {
        const item = indicators.find(i => i.field === field);
        if (item && item.value !== null && item.value !== undefined) {
            const val = Math.abs(Number(item.value));
            const max = maxVals[idx];
            radarData.push(Math.min(100, (val / max) * 100));
            radarIndicators.push({ name: coreNames[idx], max: 100 });
        }
    });
    
    if (radarData.length < 3) return;
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            appendToBody: true,
            formatter: () => {
                let html = '核心指标雷达';
                coreFields.forEach((field, idx) => {
                    const item = indicators.find(i => i.field === field);
                    if (item) html += `<br/>${coreNames[idx]}: ${displayMetric(item.value)} ${item.unit}`;
                });
                return html;
            }
        },
        radar: {
            indicator: radarIndicators,
            radius: '65%',
            center: ['50%', '52%'],
            axisName: {
                color: '#cbd5e1',
                fontSize: 11,
                fontWeight: 500
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(14,165,233,0.02)', 'rgba(14,165,233,0.04)', 'rgba(14,165,233,0.06)', 'rgba(14,165,233,0.08)']
                }
            },
            axisLine: {
                lineStyle: { color: 'rgba(148,163,184,0.15)' }
            },
            splitLine: {
                lineStyle: { color: 'rgba(148,163,184,0.1)' }
            }
        },
        series: [{
            type: 'radar',
            data: [{
                value: radarData,
                name: '当前值',
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: {
                    color: '#0ea5e9',
                    width: 2
                },
                areaStyle: {
                    color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                        { offset: 0, color: 'rgba(14,165,233,0.3)' },
                        { offset: 1, color: 'rgba(14,165,233,0.05)' }
                    ])
                },
                itemStyle: {
                    color: '#0ea5e9',
                    borderColor: '#fff',
                    borderWidth: 1
                }
            }]
        }]
    };
    state.charts.indicatorRadar.setOption(option, true);
}

function renderNewLayout() {
    const { summary, trend, model_accuracy, rankings } = state.payload;
    
    // KPI 卡片
    const scoreEl = $('kpiScore');
    const scoreBar = $('kpiScoreBar');
    const levelEl = $('kpiLevel');
    const levelDot = $('kpiLevelDot');
    const stationsEl = $('kpiStations');
    const alertsEl = $('kpiAlerts');
    
    if (scoreEl) scoreEl.textContent = formatValue(summary.composite_score, 1);
    if (scoreBar) scoreBar.style.width = `${Math.max(5, Math.min(100, summary.composite_score || 0))}%`;
    if (levelEl) levelEl.textContent = summary.quality_level;
    if (levelDot) levelDot.style.background = summary.quality_color || '#22c55e';
    if (levelDot) levelDot.style.boxShadow = `0 0 8px ${summary.quality_color || '#22c55e'}`;
    if (stationsEl) stationsEl.textContent = formatInteger(summary.station_count);
    if (alertsEl) alertsEl.textContent = formatInteger(summary.abnormal_events_30d);
    
    // 快捷入口数据摘要
    const qTrend = $('qTrend');
    const qBox = $('qBox');
    const qCorr = $('qCorr');
    const qCompare = $('qCompare');
    const qSandbox = $('qSandbox');
    const qGraph = $('qGraph');
    
    if (qTrend && trend && trend.scores && trend.scores.length > 0) {
        qTrend.textContent = `最新 ${trend.scores[trend.scores.length - 1]}`;
    }
    if (qBox && rankings && rankings.pollutant_ranking && rankings.pollutant_ranking.length > 0) {
        const top = rankings.pollutant_ranking[0];
        qBox.textContent = `${top.name} ${displayPercent(top.rate)}`;
    }
    if (qCompare && rankings && rankings.province_ranking && rankings.province_ranking.length > 0) {
        const best = rankings.province_ranking[0];
        qCompare.textContent = `${best.province} ${formatValue(best.composite_score, 1)}`;
    }
    if (qSandbox && model_accuracy && model_accuracy.best_mae_model) {
        qSandbox.textContent = `${model_accuracy.best_mae_model} 最优`;
    }
    if (qCorr) qCorr.textContent = '9项指标';
    if (qGraph) qGraph.textContent = '图谱探索';
}

function setScope(province) {
    if (state.province === province) return;
    state.province = province;
    loadOverview();
}

function renderError(message) {
    ['mapChart', 'modelChart', 'trendChart'].forEach((id) => {
        $(id).innerHTML = `<div class="empty-state">${message}</div>`;
    });
    $('indicatorGrid').innerHTML = `<div class="empty-state">${message}</div>`;
    $('provinceRanking').innerHTML = `<div class="empty-state">${message}</div>`;
    $('pollutantRanking').innerHTML = `<div class="empty-state">${message}</div>`;
}

function resizeCharts() {
    Object.values(state.charts).forEach((chart) => chart && chart.resize && chart.resize());
}

/* 粒子背景动画 */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            color: Math.random() > 0.6 ? '14,165,233' : Math.random() > 0.5 ? '34,197,94' : '6,182,212'
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            ctx.fill();
            
            // 连线
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(14,165,233, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });
        
        animationId = requestAnimationFrame(animate);
    }
    animate();
}

function toggleLoading(show) {
    $('loadingMask').classList.toggle('hidden', !show);
}

function pill(text) {
    return `<span class="pill">${text}</span>`;
}

function formatValue(value, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

function displayMetric(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const abs = Math.abs(Number(value));
    if (abs >= 1000) return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
    if (abs >= 100) return formatValue(value, 1);
    if (abs >= 1) return formatValue(value, 2).replace(/\.00$/, '');
    return formatValue(value, 3).replace(/0+$/, '').replace(/\.$/, '');
}

function displayPercent(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `${Number(value).toFixed(1)}%`;
}

function displayDelta(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const num = Number(value);
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
}

function formatInteger(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function formatSci(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const num = Number(value);
    if (num === 0) return '0';
    if (Math.abs(num) >= 1000 || Math.abs(num) < 0.01) {
        return num.toExponential(2);
    }
    return num.toFixed(2);
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

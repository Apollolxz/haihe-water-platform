import * as echarts from 'echarts';

export function initProvinceComparisonRuntime() {

// API基础URL
        const API_BASE = (() => {
            if (window.HAIHE_RUNTIME?.resolveApi) {
                return window.HAIHE_RUNTIME.resolveApi('/api').replace(/\/$/, '');
            }
            if (window.location.protocol === 'file:') {
                return 'http://127.0.0.1:5001/api';
            }
            return `${window.location.origin}/api`;
        })();
        
        let charts = {};
        let provinceData = [];
        let mapData = [];
        let sortField = 'score';
        let sortAsc = false;
        
        // 水质等级标准
        const waterQualityStandards = {
            do: { level1: 7.5, level2: 6.0, level3: 5.0 },
            nh: { level1: 0.15, level2: 0.5, level3: 1.0 },
            tp: { level1: 0.02, level2: 0.1, level3: 0.2 }
        };
        
        const provinceTrendCache = {};
        
        
        
        // 更新时间
        function updateTime() {
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('currentTime').textContent = timeStr;
        }
        
        // 返回大屏
        function goBack() {
            window.location.href = 'dashboard.html';
        }
        
        // 初始化图表
        function initCharts() {
            charts.bar = echarts.init(document.getElementById('barChart'));
            charts.map = echarts.init(document.getElementById('mapChart'));
        }
        
        // 加载真实数据
        async function loadRealData() {
            try {
                showLoading();
                console.log('[DEBUG] Starting to load data from:', API_BASE);
                
                // 并行加载数据
                const [provinceRes, mapRes, overviewRes] = await Promise.all([
                    fetch(`${API_BASE}/dashboard/province-comparison`).then(r => {
                        console.log('[DEBUG] Province comparison response:', r.status);
                        return r.json();
                    }).catch(e => {
                        console.error('[DEBUG] Province comparison error:', e);
                        return { success: false, error: e.message };
                    }),
                    fetch(`${API_BASE}/dashboard/map-data`).then(r => {
                        console.log('[DEBUG] Map data response:', r.status);
                        return r.json();
                    }).catch(e => {
                        console.error('[DEBUG] Map data error:', e);
                        return { success: false, error: e.message };
                    }),
                    fetch(`${API_BASE}/dashboard/overview-stats`).then(r => {
                        console.log('[DEBUG] Overview stats response:', r.status);
                        return r.json();
                    }).catch(e => {
                        console.error('[DEBUG] Overview stats error:', e);
                        return { success: false, error: e.message };
                    })
                ]);
                
                console.log('[DEBUG] Province response:', provinceRes);
                console.log('[DEBUG] Map response:', mapRes);
                
                // 处理省份对比数据
                if (provinceRes.success && provinceRes.data && provinceRes.data.provinces && provinceRes.data.provinces.length > 0) {
                    console.log('[DEBUG] Processing province data:', provinceRes.data);
                    processProvinceData(provinceRes.data);
                    renderBarChart();
                    updateRankingTable();
                    updateSuggestions();
                } else {
                    const message = (provinceRes.data && provinceRes.data.message) || provinceRes.error || '暂无真实省份对比数据';
                    provinceData = [];
                    console.error('[DEBUG] Province comparison unavailable:', message);
                    renderBarEmptyState(message);
                    updateRankingTable();
                    updateSuggestions();
                    showToast(message);
                }
                
                // 处理地图数据
                if (mapRes.success && mapRes.data && mapRes.data.length > 0) {
                    mapData = mapRes.data;
                    renderMap();
                } else {
                    console.warn('[DEBUG] Map data unavailable');
                    mapData = [];
                    renderMapFallback((mapRes.data && mapRes.data.message) || mapRes.error || '暂无真实站点地图数据');
                }
                
                hideLoading();
            } catch (error) {
                console.error('[DEBUG] Global error:', error);
                provinceData = [];
                mapData = [];
                renderBarEmptyState('数据加载失败，未加载到真实省份对比数据');
                renderMapFallback('数据加载失败，未加载到真实站点地图数据');
                updateRankingTable();
                updateSuggestions();
                showToast('数据加载失败，未加载到真实省份对比数据');
                hideLoading();
            }
        }

        function renderChartEmpty(chart, title, message) {
            if (!chart) return;
            chart.clear();
            chart.setOption({
                backgroundColor: 'transparent',
                title: {
                    text: title,
                    subtext: message,
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#e2e8f0', fontSize: 16 },
                    subtextStyle: { color: '#94a3b8', fontSize: 12 }
                }
            }, true);
        }

        function renderBarEmptyState(message) {
            renderChartEmpty(charts.bar, '六省市水质对比', message);
            closePopup();
        }

        function getProvinceSuggestion(province) {
            const data = provinceData.find(item => item.province === province);
            if (!data) {
                return {
                    advantage: '暂无真实评估结果',
                    weakness: '暂无真实评估结果',
                    priority: '待补充',
                    tags: ['暂无真实数据']
                };
            }

            const rank = provinceData.findIndex(item => item.province === province) + 1;
            const strengths = [
                {
                    key: 'do',
                    score: data.do / waterQualityStandards.do.level1,
                    advantage: `溶解氧均值为 ${data.do} mg/L，是当前最突出的优势指标`,
                    weakness: `溶解氧距离Ⅰ类目标仍差 ${(waterQualityStandards.do.level1 - data.do).toFixed(2)} mg/L`
                },
                {
                    key: 'nh',
                    score: waterQualityStandards.nh.level1 / Math.max(data.nh, 0.001),
                    advantage: `氨氮均值为 ${data.nh} mg/L，污染控制表现较好`,
                    weakness: `氨氮较Ⅰ类目标高出 ${(data.nh - waterQualityStandards.nh.level1).toFixed(3)} mg/L`
                },
                {
                    key: 'tp',
                    score: waterQualityStandards.tp.level1 / Math.max(data.tp, 0.001),
                    advantage: `总磷均值为 ${data.tp} mg/L，营养盐控制相对稳定`,
                    weakness: `总磷较Ⅰ类目标高出 ${(data.tp - waterQualityStandards.tp.level1).toFixed(3)} mg/L`
                }
            ];

            const sortedByStrength = [...strengths].sort((a, b) => b.score - a.score);
            const bestMetric = sortedByStrength[0];
            const weakestMetric = sortedByStrength[sortedByStrength.length - 1];

            let priority = '提升';
            if (rank <= 2 && data.level === 'Ⅰ类') {
                priority = '维持';
            } else if (rank >= Math.max(4, provinceData.length - 1) || data.level === 'Ⅲ类') {
                priority = '重点整治';
            }

            const tags = [];
            if (bestMetric.key === 'do') tags.push('溶解氧优势');
            if (bestMetric.key === 'nh') tags.push('氨氮稳控');
            if (bestMetric.key === 'tp') tags.push('总磷稳控');
            if (weakestMetric.key === 'do' && data.do < waterQualityStandards.do.level1) tags.push('补氧提升');
            if (weakestMetric.key === 'nh' && data.nh > waterQualityStandards.nh.level1) tags.push('氨氮削减');
            if (weakestMetric.key === 'tp' && data.tp > waterQualityStandards.tp.level1) tags.push('总磷治理');
            tags.push(rank <= 3 ? '保持优势' : '持续优化');

            return {
                advantage: bestMetric.advantage,
                weakness: weakestMetric.score >= 1 ? '各核心指标整体稳定，建议保持现有治理节奏' : weakestMetric.weakness,
                priority,
                tags
            };
        }
        
        // 处理省份数据
        function processProvinceData(data) {
            provinceData = data.provinces.map((province, index) => {
                const do_value = Number(data.dissolved_oxygen[index] ?? 0);
                const nh_value = Number(data.ammonia_nitrogen[index] ?? 0);
                const tp_value = Number(data.total_phosphorus[index] ?? 0);
                
                // 计算综合得分（满分100）
                // DO: 满分30分（>=7.5得30分）
                // NH: 满分40分（<=0.15得40分）
                // TP: 满分30分（<=0.02得30分）
                const do_score = Math.min(30, (do_value / 7.5) * 30);
                const nh_score = nh_value <= 0.15 ? 40 : Math.max(0, 40 - (nh_value - 0.15) * 20);
                const tp_score = tp_value <= 0.02 ? 30 : Math.max(0, 30 - (tp_value - 0.02) * 100);
                const total_score = do_score + nh_score + tp_score;
                
                // 判断水质等级
                let level = 'Ⅲ类';
                let levelClass = 'level-3';
                if (do_value >= 7.5 && nh_value <= 0.15 && tp_value <= 0.02) {
                    level = 'Ⅰ类';
                    levelClass = 'level-1';
                } else if (do_value >= 6.0 && nh_value <= 0.5 && tp_value <= 0.1) {
                    level = 'Ⅱ类';
                    levelClass = 'level-2';
                }
                
                return {
                    province,
                    do: do_value,
                    nh: nh_value,
                    tp: tp_value,
                    score: total_score,
                    level,
                    levelClass
                };
            });
            
            // 按综合得分排序
            provinceData.sort((a, b) => b.score - a.score);
        }
        
        // 渲染柱状图
        function renderBarChart() {
            const provinces = provinceData.map(d => d.province.replace('省', '').replace('市', ''));
            const doData = provinceData.map(d => ({
                value: d.do,
                itemStyle: { color: d.do >= 7.5 ? '#00e400' : d.do >= 6.0 ? '#ffff00' : '#ff7e00' }
            }));
            const nhData = provinceData.map(d => ({
                value: d.nh,
                itemStyle: { color: d.nh <= 0.15 ? '#00e400' : d.nh <= 0.5 ? '#ffff00' : '#ff7e00' }
            }));
            const tpData = provinceData.map(d => ({
                value: d.tp,
                itemStyle: { color: d.tp <= 0.02 ? '#00e400' : d.tp <= 0.1 ? '#ffff00' : '#ff7e00' }
            }));
            
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: function(params) {
                        const index = params[0].dataIndex;
                        const data = provinceData[index];
                        let html = `<div style="font-weight:bold;margin-bottom:5px">${data.province}</div>`;
                        params.forEach(p => {
                            const indicator = p.seriesName;
                            const value = p.value;
                            let level = '';
                            let diff = '';
                            if (indicator === '溶解氧') {
                                level = value >= 7.5 ? 'Ⅰ类' : value >= 6.0 ? 'Ⅱ类' : 'Ⅲ类';
                                diff = value >= 7.5 ? '达标' : `距Ⅰ类差${(7.5 - value).toFixed(2)}`;
                            } else if (indicator === '氨氮') {
                                level = value <= 0.15 ? 'Ⅰ类' : value <= 0.5 ? 'Ⅱ类' : 'Ⅲ类';
                                diff = value <= 0.15 ? '达标' : `距Ⅰ类差${(value - 0.15).toFixed(3)}`;
                            } else {
                                level = value <= 0.02 ? 'Ⅰ类' : value <= 0.1 ? 'Ⅱ类' : 'Ⅲ类';
                                diff = value <= 0.02 ? '达标' : `距Ⅰ类差${(value - 0.02).toFixed(3)}`;
                            }
                            html += `<div style="display:flex;align-items:center;gap:8px;margin:3px 0">
                                <span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:2px"></span>
                                <span>${indicator}: <b>${value}</b> (${level}, ${diff})
                            </div>`;
                        });
                        return html;
                    }
                },
                legend: {
                    data: ['溶解氧', '氨氮', '总磷'],
                    textStyle: { color: '#94a3b8', fontSize: 12 },
                    top: 0
                },
                grid: {
                    top: '15%',
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: provinces,
                    axisLabel: {
                        color: '#e2e8f0',
                        fontSize: 13,
                        fontWeight: 'bold'
                    },
                    axisLine: { lineStyle: { color: 'rgba(14, 165, 233, 0.3)' } }
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '溶解氧(mg/L)',
                        position: 'left',
                        axisLabel: { color: '#94a3b8', fontSize: 11 },
                        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
                        nameTextStyle: { color: '#0ea5e9' }
                    },
                    {
                        type: 'value',
                        name: '氨氮/总磷(mg/L)',
                        position: 'right',
                        axisLabel: { color: '#94a3b8', fontSize: 11 },
                        nameTextStyle: { color: '#f59e0b' }
                    }
                ],
                series: [
                    {
                        name: '溶解氧',
                        type: 'bar',
                        data: doData,
                        barWidth: '20%',
                        label: {
                            show: true,
                            position: 'top',
                            color: '#0ea5e9',
                            fontSize: 10,
                            formatter: '{c}'
                        }
                    },
                    {
                        name: '氨氮',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: nhData,
                        barWidth: '20%',
                        label: {
                            show: true,
                            position: 'top',
                            color: '#f59e0b',
                            fontSize: 10,
                            formatter: '{c}'
                        }
                    },
                    {
                        name: '总磷',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: tpData,
                        barWidth: '20%',
                        label: {
                            show: true,
                            position: 'top',
                            color: '#8b5cf6',
                            fontSize: 10,
                            formatter: '{c}'
                        }
                    }
                ]
            };
            
            charts.bar.setOption(option);
            
            // 点击事件
            charts.bar.on('click', function(params) {
                const index = params.dataIndex;
                const province = provinceData[index].province;
                focusMapOnProvince(province);
                showProvincePopup(province);
            });
        }
        
        // 渲染地图
        function renderMap() {
            fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
                .then(res => res.json())
                .then(geoJson => {
                    echarts.registerMap('china', geoJson);
                    
                    // 高亮六省市
                    const highlightProvinces = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省'];
                    
                    const option = {
                        backgroundColor: 'transparent',
                        tooltip: {
                            trigger: 'item',
                            formatter: function(params) {
                                if (params.dataType === 'geo') {
                                    return highlightProvinces.includes(params.name) ? 
                                        `<b>${params.name}</b><br/>点击查看详情` : params.name;
                                }
                                const d = params.data;
                                return `<div style="font-weight:bold">${d.name}</div>
                                        <div>溶解氧: ${d.dissolved_oxygen} mg/L</div>
                                        <div>氨氮: ${d.ammonia_nitrogen} mg/L</div>
                                        <div>等级: ${d.level}</div>`;
                            }
                        },
                        geo: {
                            map: 'china',
                            roam: true,
                            zoom: 5,
                            center: [115, 37],
                            label: {
                                show: true,
                                color: '#e2e8f0',
                                fontSize: 11,
                                fontWeight: 'bold'
                            },
                            itemStyle: {
                                areaColor: 'rgba(30, 41, 59, 0.8)',
                                borderColor: 'rgba(14, 165, 233, 0.3)',
                                borderWidth: 1
                            },
                            emphasis: {
                                label: { color: '#fff' },
                                itemStyle: {
                                    areaColor: 'rgba(14, 165, 233, 0.4)'
                                }
                            },
                            select: {
                                itemStyle: {
                                    areaColor: 'rgba(34, 197, 94, 0.5)'
                                }
                            },
                            regions: highlightProvinces.map(p => ({
                                name: p,
                                itemStyle: {
                                    areaColor: 'rgba(14, 165, 233, 0.2)',
                                    borderColor: '#0ea5e9',
                                    borderWidth: 2
                                },
                                emphasis: {
                                    itemStyle: {
                                        areaColor: 'rgba(14, 165, 233, 0.5)'
                                    }
                                }
                            }))
                        },
                        series: [{
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            data: mapData,
                            symbolSize: function(val) {
                                return Math.max(8, Math.min(20, val[2] || 8));
                            },
                            showEffectOn: 'render',
                            rippleEffect: {
                                brushType: 'stroke',
                                scale: 3
                            },
                            itemStyle: {
                                color: function(params) {
                                    return params.data.color || '#0ea5e9';
                                }
                            }
                        }]
                    };
                    
                    charts.map.setOption(option);
                    
                    // 地图点击事件
                    charts.map.on('click', function(params) {
                        if (highlightProvinces.includes(params.name)) {
                            showProvincePopup(params.name);
                        }
                    });
                })
                .catch(err => {
                    console.error('[DEBUG] Map load failed:', err);
                    renderMapFallback('地图底图加载失败，暂无法展示真实站点分布');
                });
        }
        
        // 地图加载失败时的回退显示
        function renderMapFallback(message = '暂无真实站点地图数据') {
            console.log('[DEBUG] Rendering map empty state');
            charts.map.clear();
            charts.map.setOption({
                backgroundColor: 'transparent',
                title: {
                    text: '六省市监测站点分布',
                    subtext: message,
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#e2e8f0', fontSize: 16 },
                    subtextStyle: { color: '#64748b', fontSize: 12 }
                }
            }, true);
        }
        
        // 聚焦地图到指定省份
        function focusMapOnProvince(province) {
            // 地图聚焦逻辑
            const provinceCenters = {
                '北京市': [116.4, 39.9],
                '天津市': [117.2, 39.1],
                '河北省': [114.5, 38.0],
                '山西省': [112.5, 37.9],
                '山东省': [117.0, 36.7],
                '河南省': [113.6, 34.8]
            };
            
            const center = provinceCenters[province];
            if (center) {
                charts.map.setOption({
                    geo: {
                        center: center,
                        zoom: 7
                    }
                });
            }
        }
        
        // 显示省份弹窗
        function showProvincePopup(province) {
            const data = provinceData.find(d => d.province === province);
            if (!data) return;
            
            const popup = document.getElementById('mapPopup');
            const title = document.getElementById('popupTitle');
            const content = document.getElementById('popupContent');
            
            title.textContent = province;
            
            const rank = provinceData.findIndex(d => d.province === province) + 1;
            const suggestion = getProvinceSuggestion(province);
            
            content.innerHTML = `
                <div class="indicator-row">
                    <div class="indicator-info">
                        <div class="indicator-icon do"><i class="fa fa-tint"></i></div>
                        <div class="indicator-name-popup">溶解氧</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="indicator-value" style="color:#0ea5e9">${data.do}</div>
                        <div class="indicator-level ${data.do >= 7.5 ? 'level-1' : data.do >= 6.0 ? 'level-2' : 'level-3'}">
                            ${data.do >= 7.5 ? 'Ⅰ类' : data.do >= 6.0 ? 'Ⅱ类' : 'Ⅲ类'}
                        </div>
                    </div>
                </div>
                <div class="indicator-row">
                    <div class="indicator-info">
                        <div class="indicator-icon nh"><i class="fa fa-filter"></i></div>
                        <div class="indicator-name-popup">氨氮</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="indicator-value" style="color:#f59e0b">${data.nh}</div>
                        <div class="indicator-level ${data.nh <= 0.15 ? 'level-1' : data.nh <= 0.5 ? 'level-2' : 'level-3'}">
                            ${data.nh <= 0.15 ? 'Ⅰ类' : data.nh <= 0.5 ? 'Ⅱ类' : 'Ⅲ类'}
                        </div>
                    </div>
                </div>
                <div class="indicator-row">
                    <div class="indicator-info">
                        <div class="indicator-icon tp"><i class="fa fa-flask"></i></div>
                        <div class="indicator-name-popup">总磷</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="indicator-value" style="color:#8b5cf6">${data.tp}</div>
                        <div class="indicator-level ${data.tp <= 0.02 ? 'level-1' : data.tp <= 0.1 ? 'level-2' : 'level-3'}">
                            ${data.tp <= 0.02 ? 'Ⅰ类' : data.tp <= 0.1 ? 'Ⅱ类' : 'Ⅲ类'}
                        </div>
                    </div>
                </div>
                <div class="rank-info">
                    <div class="rank-box">
                        <div class="rank-label">综合排名</div>
                        <div class="rank-value">第${rank}名</div>
                    </div>
                    <div class="rank-box">
                        <div class="rank-label">综合得分</div>
                        <div class="rank-value">${data.score.toFixed(1)}</div>
                    </div>
                </div>
                <div style="margin-top:10px;padding:10px;background:rgba(14,165,233,0.1);border-radius:8px">
                    <div style="font-size:12px;color:#94a3b8;margin-bottom:5px"><i class="fa fa-star" style="color:#f59e0b;margin-right:5px"></i>核心优势</div>
                    <div style="font-size:13px;color:#e2e8f0">${suggestion.advantage}</div>
                </div>
                <div style="padding:10px;background:rgba(239,68,68,0.1);border-radius:8px">
                    <div style="font-size:12px;color:#94a3b8;margin-bottom:5px"><i class="fa fa-exclamation-circle" style="color:#ef4444;margin-right:5px"></i>提升短板</div>
                    <div style="font-size:13px;color:#e2e8f0">${suggestion.weakness}</div>
                </div>
                <div class="mini-chart" id="miniChart_${province}"></div>
            `;
            
            popup.classList.add('active');
            popup.style.left = '50%';
            popup.style.top = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            
            // 渲染迷你趋势图
            setTimeout(() => renderMiniChart(province), 100);
        }
        
        // 关闭弹窗
        function closePopup() {
            document.getElementById('mapPopup').classList.remove('active');
        }
        
        async function fetchProvinceTrendData(province) {
            if (Object.prototype.hasOwnProperty.call(provinceTrendCache, province)) {
                return provinceTrendCache[province];
            }

            try {
                const response = await fetch(`${API_BASE}/dashboard/data-by-province?province=${encodeURIComponent(province)}`);
                const result = await response.json();
                if (result.success && result.data && result.data.line && result.data.line.dates && result.data.line.dates.length > 0) {
                    provinceTrendCache[province] = result.data.line;
                    return provinceTrendCache[province];
                }
            } catch (error) {
                console.error('[DEBUG] Province mini trend load failed:', error);
            }

            provinceTrendCache[province] = null;
            return null;
        }

        // 渲染迷你趋势图
        async function renderMiniChart(province) {
            const chartDom = document.getElementById(`miniChart_${province}`);
            if (!chartDom) return;
            
            const miniChart = echarts.init(chartDom);
            const lineData = await fetchProvinceTrendData(province);
            if (!lineData) {
                miniChart.setOption({
                    backgroundColor: 'transparent',
                    graphic: {
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        style: {
                            text: '暂无真实时序数据',
                            fill: '#94a3b8',
                            font: '12px "Microsoft YaHei"',
                            textAlign: 'center'
                        }
                    }
                }, true);
                return;
            }

            let seriesName = '溶解氧';
            let seriesData = lineData.dissolved_oxygen || [];
            let lineColor = '#0ea5e9';
            if (!seriesData.length && lineData.ammonia_nitrogen && lineData.ammonia_nitrogen.length) {
                seriesName = '氨氮';
                seriesData = lineData.ammonia_nitrogen;
                lineColor = '#f59e0b';
            } else if (!seriesData.length && lineData.ph && lineData.ph.length) {
                seriesName = 'PH';
                seriesData = lineData.ph;
                lineColor = '#22c55e';
            }

            const axisLabels = (lineData.dates || []).map(date => String(date).slice(5, 10));
            const option = {
                backgroundColor: 'transparent',
                grid: { top: 10, left: 10, right: 10, bottom: 20 },
                tooltip: {
                    trigger: 'axis',
                    formatter: params => `${seriesName}: ${params[0].value}`
                },
                xAxis: {
                    type: 'category',
                    data: axisLabels,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: '#64748b', fontSize: 9 }
                },
                yAxis: {
                    type: 'value',
                    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } },
                    axisLabel: { show: false }
                },
                series: [{
                    type: 'line',
                    smooth: true,
                    data: seriesData,
                    lineStyle: { color: lineColor, width: 2 },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: `${lineColor}4D` },
                                { offset: 1, color: `${lineColor}00` }
                            ]
                        }
                    },
                    symbol: 'none'
                }]
            };
            miniChart.setOption(option);
        }
        
        // 更新排名表
        function updateRankingTable() {
            const tbody = document.getElementById('rankingTableBody');
            
            // 排序数据
            let sortedData = [...provinceData];
            if (sortField === 'do') {
                sortedData.sort((a, b) => sortAsc ? a.do - b.do : b.do - a.do);
            } else if (sortField === 'nh') {
                sortedData.sort((a, b) => sortAsc ? a.nh - b.nh : b.nh - a.nh);
            } else if (sortField === 'tp') {
                sortedData.sort((a, b) => sortAsc ? a.tp - b.tp : b.tp - a.tp);
            } else {
                sortedData.sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);
            }

            if (!sortedData.length) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;color:#94a3b8;padding:24px 12px;">暂无真实省份对比数据</td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = sortedData.map((data, index) => `
                <tr>
                    <td>
                        <span class="rank-badge ${index < 3 ? `rank-${index + 1}` : 'rank-other'}">${index + 1}</span>
                    </td>
                    <td>
                        <div class="province-name">
                            <i class="fa fa-map-marker" style="color: #0ea5e9;"></i>
                            ${data.province}
                        </div>
                    </td>
                    <td style="color: ${data.do >= 7.5 ? '#22c55e' : '#f59e0b'}; font-weight: 600;">${data.do}</td>
                    <td style="color: ${data.nh <= 0.15 ? '#22c55e' : '#f59e0b'}; font-weight: 600;">${data.nh}</td>
                    <td style="color: ${data.tp <= 0.02 ? '#22c55e' : '#f59e0b'}; font-weight: 600;">${data.tp}</td>
                    <td style="color: #0ea5e9; font-weight: bold;">${data.score.toFixed(1)}</td>
                    <td>
                        <span class="indicator-level ${data.levelClass}">${data.level}</span>
                    </td>
                </tr>
            `).join('');
        }
        
        // 初始化排序处理器
        function initSortHandlers() {
            document.querySelectorAll('.ranking-table th.sortable').forEach(th => {
                th.addEventListener('click', function() {
                    const field = this.dataset.sort;
                    if (sortField === field) {
                        sortAsc = !sortAsc;
                    } else {
                        sortField = field;
                        sortAsc = true;
                    }
                    
                    // 更新排序指示器
                    document.querySelectorAll('.ranking-table th').forEach(h => {
                        h.classList.remove('sort-asc', 'sort-desc');
                    });
                    this.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');
                    
                    updateRankingTable();
                });
            });
        }
        
        // 更新管控建议
        function updateSuggestions() {
            const container = document.getElementById('suggestionsContainer');
            if (!provinceData.length) {
                container.innerHTML = `
                    <div class="suggestion-card">
                        <div class="suggestion-title">
                            <i class="fa fa-info-circle"></i>
                            暂无真实建议
                        </div>
                        <div class="suggestion-content">当前数据库暂无足够的省份对比样本，无法生成治理建议。</div>
                    </div>
                `;
                return;
            }
            
            // 根据排名显示建议
            const top3 = provinceData.slice(0, 3);
            const bottom3 = provinceData.slice(3);
            
            let html = '';
            
            // 表现优秀的省份
            top3.forEach(data => {
                const suggestion = getProvinceSuggestion(data.province);
                if (suggestion) {
                    html += `
                        <div class="suggestion-card">
                            <div class="suggestion-title">
                                <i class="fa fa-check-circle"></i>
                                ${data.province} - 优秀示范
                            </div>
                            <div class="suggestion-content">${suggestion.advantage}</div>
                            <div>
                                <span class="suggestion-tag tag-maintain">维持现状</span>
                                ${suggestion.tags.map(t => `<span class="suggestion-tag tag-improve">${t}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }
            });
            
            // 需要改进的省份
            bottom3.forEach(data => {
                const suggestion = getProvinceSuggestion(data.province);
                if (suggestion) {
                    html += `
                        <div class="suggestion-card" style="border-left-color: #ef4444;">
                            <div class="suggestion-title" style="color: #ef4444;">
                                <i class="fa fa-exclamation-triangle"></i>
                                ${data.province} - 重点整改
                            </div>
                            <div class="suggestion-content">${suggestion.weakness}</div>
                            <div>
                                <span class="suggestion-tag tag-priority">${suggestion.priority}</span>
                                ${suggestion.tags.map(t => `<span class="suggestion-tag tag-improve">${t}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }
            });
            
            container.innerHTML = html;
        }
        
        // 导出数据
        function exportData() {
            if (!provinceData.length) {
                showToast('暂无真实数据可导出');
                return;
            }
            const headers = ['排名', '省市', '溶解氧(mg/L)', '氨氮(mg/L)', '总磷(mg/L)', '综合得分', '水质等级'];
            const rows = provinceData.map((data, index) => [
                index + 1,
                data.province,
                data.do,
                data.nh,
                data.tp,
                data.score.toFixed(1),
                data.level
            ]);
            
            let csv = '\uFEFF' + headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.join(',') + '\n';
            });
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `津水流域六省市水质对比_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            
            showToast('数据导出成功');
        }
        
        // 显示加载状态
        function showLoading() {
            document.body.style.cursor = 'wait';
        }
        
        // 隐藏加载状态
        function hideLoading() {
            document.body.style.cursor = 'default';
        }
        
        // Toast提示
        function showToast(message) {
            const existing = document.querySelector('.toast-message');
            if (existing) existing.remove();
            
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.innerHTML = `
                <div style="
                    position: fixed;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(34, 197, 94, 0.9));
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                ">${message}</div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
        

  const resizeCharts = () => {
    Object.values(charts).forEach((chart) => chart && chart.resize());
  };
  const closePopupFromBackdrop = (event) => {
    const popup = document.getElementById('mapPopup');
    const mapChart = document.getElementById('mapChart');
    if (popup?.classList.contains('active') && !popup.contains(event.target) && !mapChart?.contains(event.target)) {
      closePopup();
    }
  };

  const handleAnalysisClick = (event) => {
    const button = event.target.closest('[data-analysis-action]');
    if (!button) return;

    const action = button.dataset.analysisAction;
    if (action === 'go-back') {
      event.preventDefault();
      goBack();
    } else if (action === 'close-popup') {
      event.preventDefault();
      closePopup();
    } else if (action === 'export-data') {
      event.preventDefault();
      exportData();
    }
  };

  initCharts();
  loadRealData();
  updateTime();
  const timeTimer = window.setInterval(updateTime, 1000);
  initSortHandlers();
  window.addEventListener('resize', resizeCharts);
  document.addEventListener('click', closePopupFromBackdrop);
  document.addEventListener('click', handleAnalysisClick);

  return () => {
    window.clearInterval(timeTimer);
    window.removeEventListener('resize', resizeCharts);
    document.removeEventListener('click', closePopupFromBackdrop);
    document.removeEventListener('click', handleAnalysisClick);
    Object.values(charts).forEach((chart) => chart && chart.dispose());
    charts = {};
    document.body.style.cursor = 'default';
    document.querySelector('.toast-message')?.remove();
  };
}

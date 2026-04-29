import * as echarts from 'echarts';

export function initTrendAnalysisRuntime() {

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
        let currentView = 'all';
        
        // 真实数据存储
        const timeSeriesData = {
            dates: [],
            dissolved_oxygen: [],
            ph: [],
            ammonia_nitrogen: []
        };
        
        // 统计数据存储
        const statsData = {
            do: { max: 0, min: 0, avg: 0, median: 0, compliance: 0 },
            ph: { max: 0, min: 0, avg: 0, median: 0, compliance: 0 },
            nh: { max: 0, min: 0, avg: 0, median: 0, compliance: 0 }
        };
        
        
        
        // 加载真实数据
        async function loadRealData() {
            try {
                showLoading();
                console.log('[DEBUG] Loading trend analysis data from:', API_BASE);
                
                // 并行加载时序数据和统计数据
                const [timeseriesRes, overviewRes, boxplotRes] = await Promise.all([
                    fetch(`${API_BASE}/dashboard/timeseries-data`).then(r => {
                        console.log('[DEBUG] Timeseries response status:', r.status);
                        return r.json();
                    }).catch(e => {
                        console.error('[DEBUG] Timeseries fetch error:', e);
                        return { success: false, error: e.message };
                    }),
                    fetch(`${API_BASE}/dashboard/overview-stats`).then(r => r.json()).catch(e => {
                        console.error('[DEBUG] Overview fetch error:', e);
                        return { success: false };
                    }),
                    fetch(`${API_BASE}/dashboard/boxplot-data`).then(r => r.json()).catch(e => {
                        console.error('[DEBUG] Boxplot fetch error:', e);
                        return { success: false };
                    })
                ]);
                
                console.log('[DEBUG] Timeseries response:', timeseriesRes);
                
                if (timeseriesRes.success && timeseriesRes.data && timeseriesRes.data.dates && timeseriesRes.data.dates.length > 0) {
                    console.log('[DEBUG] Processing timeseries data:', timeseriesRes.data);
                    timeSeriesData.dates = timeseriesRes.data.dates;
                    timeSeriesData.dissolved_oxygen = timeseriesRes.data.dissolved_oxygen;
                    timeSeriesData.ph = timeseriesRes.data.ph;
                    timeSeriesData.ammonia_nitrogen = timeseriesRes.data.ammonia_nitrogen;
                    
                    // 更新图表
                    renderDOChart();
                    renderPHChart();
                    renderNHChart();
                    
                    // 计算并更新统计数据
                    calculateStats();
                    updateStatsTable();
                    
                    // 更新分时段对比图
                    renderSeasonChart();
                    
                    // 更新趋势检验结果
                    updateTrendAnalysis();
                    
                    if (timeseriesRes.data.message) {
                        showToast(timeseriesRes.data.message);
                    }
                } else {
                    const message = (timeseriesRes.data && timeseriesRes.data.message) || timeseriesRes.error || '暂无真实时序数据';
                    console.warn('[DEBUG] No valid timeseries data:', message);
                    renderNoDataState(message);
                    showToast(message);
                }
                
                // 处理箱线图数据（用于极值统计）
                if (boxplotRes.success && boxplotRes.data && timeSeriesData.dates.length > 0) {
                    updateStatsFromBoxplot(boxplotRes.data);
                }
                
                hideLoading();
            } catch (error) {
                console.error('[DEBUG] Global error:', error);
                renderNoDataState('数据加载失败，未加载到真实时序数据');
                showToast('数据加载失败，未加载到真实时序数据');
                hideLoading();
            }
        }

        function setStatsPlaceholder() {
            statsData.do = { max: '--', min: '--', avg: '--', median: '--', compliance: '--' };
            statsData.ph = { max: '--', min: '--', avg: '--', median: '--', compliance: '--' };
            statsData.nh = { max: '--', min: '--', avg: '--', median: '--', compliance: '--' };
        }

        function renderChartEmpty(chart, message) {
            if (!chart) return;
            chart.clear();
            chart.setOption({
                backgroundColor: 'transparent',
                graphic: {
                    type: 'text',
                    left: 'center',
                    top: 'middle',
                    style: {
                        text: message,
                        fill: '#94a3b8',
                        font: '14px "Microsoft YaHei"',
                        textAlign: 'center'
                    }
                }
            }, true);
        }

        function renderNoDataState(message) {
            timeSeriesData.dates = [];
            timeSeriesData.dissolved_oxygen = [];
            timeSeriesData.ph = [];
            timeSeriesData.ammonia_nitrogen = [];

            setStatsPlaceholder();
            updateStatsTable();
            updateConclusionBar(true);

            const emptyMessage = message || '暂无真实时序数据';
            renderChartEmpty(charts.do, emptyMessage);
            renderChartEmpty(charts.ph, emptyMessage);
            renderChartEmpty(charts.nh, emptyMessage);
            renderChartEmpty(charts.season, emptyMessage);

            const doEl = document.getElementById('doTrend');
            const phEl = document.getElementById('phTrend');
            const nhEl = document.getElementById('nhTrend');
            const conclusionEl = document.getElementById('trendConclusion');

            if (doEl) doEl.innerHTML = '<i class="fa fa-minus" style="color: #64748b;"></i> 暂无真实趋势数据 <span class="trend-status status-stable">待补充</span>';
            if (phEl) phEl.innerHTML = '<i class="fa fa-minus" style="color: #64748b;"></i> 暂无真实趋势数据 <span class="trend-status status-stable">待补充</span>';
            if (nhEl) nhEl.innerHTML = '<i class="fa fa-minus" style="color: #64748b;"></i> 暂无真实趋势数据 <span class="trend-status status-stable">待补充</span>';
            if (conclusionEl) {
                conclusionEl.innerHTML = `
                    <i class="fa fa-info-circle" style="color: #64748b; margin-right: 5px;"></i>
                    ${emptyMessage}
                `;
            }
        }
        
        // 显示加载状态
        function showLoading() {
            document.body.style.cursor = 'wait';
        }
        
        // 隐藏加载状态
        function hideLoading() {
            document.body.style.cursor = 'default';
        }
        
        // 计算统计数据
        function calculateStats() {
            // 溶解氧统计
            const doValues = timeSeriesData.dissolved_oxygen;
            statsData.do.max = Math.max(...doValues);
            statsData.do.min = Math.min(...doValues);
            statsData.do.avg = (doValues.reduce((a, b) => a + b, 0) / doValues.length).toFixed(2);
            statsData.do.median = calculateMedian(doValues);
            // 计算达标率（>= 7.5 为 I 类）
            statsData.do.compliance = ((doValues.filter(v => v >= 7.5).length / doValues.length) * 100).toFixed(1);
            
            // PH统计
            const phValues = timeSeriesData.ph;
            statsData.ph.max = Math.max(...phValues);
            statsData.ph.min = Math.min(...phValues);
            statsData.ph.avg = (phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(2);
            statsData.ph.median = calculateMedian(phValues);
            // 计算达标率（6-9 为达标）
            statsData.ph.compliance = ((phValues.filter(v => v >= 6 && v <= 9).length / phValues.length) * 100).toFixed(1);
            
            // 氨氮统计
            const nhValues = timeSeriesData.ammonia_nitrogen;
            statsData.nh.max = Math.max(...nhValues);
            statsData.nh.min = Math.min(...nhValues);
            statsData.nh.avg = (nhValues.reduce((a, b) => a + b, 0) / nhValues.length).toFixed(3);
            statsData.nh.median = calculateMedian(nhValues);
            // 计算达标率（<= 0.5 为 II 类）
            statsData.nh.compliance = ((nhValues.filter(v => v <= 0.5).length / nhValues.length) * 100).toFixed(1);
        }
        
        // 计算中位数
        function calculateMedian(arr) {
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
        }
        
        // Mann-Kendall趋势检验（简化版）
        function calculateMannKendall(data) {
            const n = data.length;
            if (n < 3) return { trend: 'stable', pValue: 1 };
            
            let s = 0;
            for (let i = 0; i < n - 1; i++) {
                for (let j = i + 1; j < n; j++) {
                    s += Math.sign(data[j] - data[i]);
                }
            }
            
            // 计算方差
            const varS = n * (n - 1) * (2 * n + 5) / 18;
            
            // 计算Z值
            let z = 0;
            if (s > 0) {
                z = (s - 1) / Math.sqrt(varS);
            } else if (s < 0) {
                z = (s + 1) / Math.sqrt(varS);
            }
            
            // 判断趋势
            const absZ = Math.abs(z);
            let trend = 'stable';
            if (absZ > 1.96) {
                trend = z > 0 ? 'increasing' : 'decreasing';
            }
            
            // 寻找突变点（简化：找到趋势变化最大的位置）
            let changePoint = -1;
            let maxChange = 0;
            for (let i = 1; i < n; i++) {
                const change = Math.abs(data[i] - data[i-1]);
                if (change > maxChange) {
                    maxChange = change;
                    changePoint = i;
                }
            }
            
            return { trend, z, changePoint: changePoint > 0 ? changePoint : -1 };
        }
        
        // 更新趋势检验结果
        function updateTrendAnalysis() {
            // 溶解氧趋势
            const doResult = calculateMannKendall(timeSeriesData.dissolved_oxygen);
            const doEl = document.getElementById('doTrend');
            if (doEl) {
                const doIcon = doResult.trend === 'increasing' ? 'fa-arrow-up' : 
                              doResult.trend === 'decreasing' ? 'fa-arrow-down' : 'fa-minus';
                const doColor = doResult.trend === 'increasing' ? '#22c55e' : 
                               doResult.trend === 'decreasing' ? '#ef4444' : '#0ea5e9';
                const doText = doResult.trend === 'increasing' ? '整体呈上升趋势' :
                              doResult.trend === 'decreasing' ? '整体呈下降趋势' : '整体保持稳定';
                const doStatus = doResult.trend === 'increasing' ? '显著改善' :
                                 doResult.trend === 'decreasing' ? '需关注' : '高度稳定';
                const doStatusClass = doResult.trend === 'increasing' ? 'status-improving' :
                                      doResult.trend === 'decreasing' ? 'status-stable' : 'status-stable';
                
                doEl.innerHTML = `
                    <i class="fa ${doIcon}" style="color: ${doColor};"></i>
                    ${doText}
                    <span class="trend-status ${doStatusClass}">${doStatus}</span>
                `;
            }
            
            // PH趋势
            const phResult = calculateMannKendall(timeSeriesData.ph);
            const phEl = document.getElementById('phTrend');
            if (phEl) {
                const phIcon = phResult.trend === 'stable' ? 'fa-minus' : 
                              phResult.trend === 'increasing' ? 'fa-arrow-up' : 'fa-arrow-down';
                const phText = phResult.trend === 'stable' ? '波动幅度小' :
                              phResult.trend === 'increasing' ? '略有上升' : '略有下降';
                
                phEl.innerHTML = `
                    <i class="fa ${phIcon}" style="color: #0ea5e9;"></i>
                    ${phText}
                    <span class="trend-status status-stable">高度稳定</span>
                `;
            }
            
            // 氨氮趋势
            const nhResult = calculateMannKendall(timeSeriesData.ammonia_nitrogen);
            const nhEl = document.getElementById('nhTrend');
            if (nhEl) {
                const nhIcon = nhResult.trend === 'decreasing' ? 'fa-arrow-down' :
                              nhResult.trend === 'increasing' ? 'fa-arrow-up' : 'fa-minus';
                const nhColor = nhResult.trend === 'decreasing' ? '#22c55e' :
                               nhResult.trend === 'increasing' ? '#ef4444' : '#0ea5e9';
                const nhText = nhResult.trend === 'decreasing' ? '浓度逐步降低' :
                              nhResult.trend === 'increasing' ? '浓度有所上升' : '浓度保持稳定';
                const nhStatus = nhResult.trend === 'decreasing' ? '持续改善' :
                                 nhResult.trend === 'increasing' ? '需关注' : '基本稳定';
                const nhStatusClass = nhResult.trend === 'decreasing' ? 'status-improving' :
                                      nhResult.trend === 'increasing' ? 'status-stable' : 'status-stable';
                
                nhEl.innerHTML = `
                    <i class="fa ${nhIcon}" style="color: ${nhColor};"></i>
                    ${nhText}
                    <span class="trend-status ${nhStatusClass}">${nhStatus}</span>
                `;
            }
            
            // 更新结论
            const conclusionEl = document.getElementById('trendConclusion');
            if (conclusionEl && doResult.changePoint > 0) {
                const changeDate = timeSeriesData.dates[doResult.changePoint] || '未知';
                conclusionEl.innerHTML = `
                    <i class="fa fa-info-circle" style="color: #0ea5e9; margin-right: 5px;"></i>
                    检验结果：${changeDate} 前后出现水质变化趋势拐点，可能与季节变化或治理措施有关
                `;
            }
        }
        
        // 从箱线图数据更新统计
        function updateStatsFromBoxplot(data) {
            if (data.indicators && data.indicators.length > 0) {
                const indicatorMap = {};
                data.indicators.forEach(item => {
                    indicatorMap[item.name] = item.statistics || {};
                });

                const doStats = indicatorMap['溶解氧'];
                const phStats = indicatorMap['PH'];
                const nhStats = indicatorMap['氨氮'];

                if (doStats) {
                    statsData.do.min = doStats.min;
                    statsData.do.max = doStats.max;
                    statsData.do.median = doStats.median;
                }
                if (phStats) {
                    statsData.ph.min = phStats.min;
                    statsData.ph.max = phStats.max;
                    statsData.ph.median = phStats.median;
                }
                if (nhStats) {
                    statsData.nh.min = nhStats.min;
                    statsData.nh.max = nhStats.max;
                    statsData.nh.median = nhStats.median;
                }
            }
            updateStatsTable();
        }
        
        // 更新统计表格
        function updateStatsTable() {
            const tbody = document.querySelector('.stats-table tbody');
            if (tbody) {
                const formatCompliance = value => value === '--' ? '--' : `${value}%`;
                tbody.innerHTML = `
                    <tr>
                        <td>
                            <div class="stats-indicator do">
                                <i class="fa fa-tint"></i>溶解氧
                            </div>
                        </td>
                        <td style="color: #22c55e;">${statsData.do.max}</td>
                        <td style="color: #f59e0b;">${statsData.do.min}</td>
                        <td>${statsData.do.avg}</td>
                        <td>${statsData.do.median}</td>
                        <td style="color: #22c55e; font-weight: bold;">${formatCompliance(statsData.do.compliance)}</td>
                    </tr>
                    <tr>
                        <td>
                            <div class="stats-indicator ph">
                                <i class="fa fa-flask"></i>PH
                            </div>
                        </td>
                        <td style="color: #22c55e;">${statsData.ph.max}</td>
                        <td style="color: #22c55e;">${statsData.ph.min}</td>
                        <td>${statsData.ph.avg}</td>
                        <td>${statsData.ph.median}</td>
                        <td style="color: #22c55e; font-weight: bold;">${formatCompliance(statsData.ph.compliance)}</td>
                    </tr>
                    <tr>
                        <td>
                            <div class="stats-indicator nh">
                                <i class="fa fa-filter"></i>氨氮
                            </div>
                        </td>
                        <td style="color: #f59e0b;">${statsData.nh.max}</td>
                        <td style="color: #22c55e;">${statsData.nh.min}</td>
                        <td>${statsData.nh.avg}</td>
                        <td>${statsData.nh.median}</td>
                        <td style="color: #22c55e; font-weight: bold;">${formatCompliance(statsData.nh.compliance)}</td>
                    </tr>
                `;
            }
            
            // 更新顶部结论栏
            updateConclusionBar();
        }
        
        // 更新顶部结论栏
        function updateConclusionBar(isEmpty = false) {
            const tags = document.querySelectorAll('.conclusion-tag');
            if (tags.length >= 3) {
                if (isEmpty) {
                    tags[0].querySelector('.tag-value').innerHTML = '暂无真实数据';
                    tags[1].querySelector('.tag-value').innerHTML = '暂无真实数据';
                    tags[2].querySelector('.tag-value').innerHTML = '暂无真实数据';
                    return;
                }
                tags[0].querySelector('.tag-value').innerHTML = `
                    <span class="tag-highlight">${statsData.do.compliance}%</span> 以上时间达 <span class="tag-highlight">Ⅰ类</span> 标准
                `;
                tags[1].querySelector('.tag-value').innerHTML = `
                    全程稳定在 <span class="tag-highlight">${statsData.ph.min}-${statsData.ph.max}</span>，${statsData.ph.compliance}% 符合国标
                `;
                tags[2].querySelector('.tag-value').innerHTML = `
                    <span class="tag-highlight">${statsData.nh.compliance}%</span> 以上时间达 <span class="tag-highlight">Ⅱ类</span> 标准，无超标
                `;
            }
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
                    background: rgba(239, 68, 68, 0.9);
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
            charts.do = echarts.init(document.getElementById('doChart'));
            charts.ph = echarts.init(document.getElementById('phChart'));
            charts.nh = echarts.init(document.getElementById('nhChart'));
            charts.season = echarts.init(document.getElementById('seasonChart'));
        }
        
        // 渲染溶解氧图表
        function renderDOChart() {
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        const data = params[0];
                        const value = data.value;
                        let level = 'Ⅰ类';
                        if (value < 7.5) level = 'Ⅱ类';
                        if (value < 6.0) level = 'Ⅲ类';
                        
                        let reason = '正常运行';
                        const month = parseInt(data.name.split('-')[1]);
                        if (month >= 6 && month <= 8) reason = '夏季水温升高，溶解氧自然降低';
                        if (month >= 12 || month <= 2) reason = '冬季水温低，溶解氧饱和度高';
                        
                        return `<div style="font-weight:bold">${data.name}</div>
                                <div>溶解氧: <span style="color:#0ea5e9;font-weight:bold">${value}</span> mg/L</div>
                                <div>水质等级: <span style="color:#00e400">${level}</span></div>
                                <div style="color:#94a3b8;font-size:12px;margin-top:5px">${reason}</div>`;
                    }
                },
                grid: {
                    top: '10%',
                    left: '3%',
                    right: '4%',
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: timeSeriesData.dates,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10,
                        rotate: 30
                    },
                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                yAxis: {
                    type: 'value',
                    min: 5,
                    max: 13,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10,
                        formatter: '{value} mg/L'
                    },
                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
                },
                series: [
                    // Ⅰ类水质区间背景
                    {
                        type: 'line',
                        markArea: {
                            silent: true,
                            itemStyle: {
                                color: 'rgba(0, 228, 0, 0.1)'
                            },
                            data: [[{
                                yAxis: 7.5
                            }, {
                                yAxis: 13
                            }]]
                        }
                    },
                    // Ⅱ类水质区间背景
                    {
                        type: 'line',
                        markArea: {
                            silent: true,
                            itemStyle: {
                                color: 'rgba(255, 255, 0, 0.1)'
                            },
                            data: [[{
                                yAxis: 6.0
                            }, {
                                yAxis: 7.5
                            }]]
                        }
                    },
                    // Ⅲ类水质区间背景
                    {
                        type: 'line',
                        markArea: {
                            silent: true,
                            itemStyle: {
                                color: 'rgba(255, 126, 0, 0.1)'
                            },
                            data: [[{
                                yAxis: 5.0
                            }, {
                                yAxis: 6.0
                            }]]
                        }
                    },
                    // 国标限值线
                    {
                        type: 'line',
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            lineStyle: {
                                type: 'dashed',
                                width: 1
                            },
                            data: [
                                { yAxis: 7.5, lineStyle: { color: '#00e400' }, label: { formatter: 'Ⅰ类线', color: '#00e400', fontSize: 10 } },
                                { yAxis: 6.0, lineStyle: { color: '#ffff00' }, label: { formatter: 'Ⅱ类线', color: '#ffff00', fontSize: 10 } },
                                { yAxis: 5.0, lineStyle: { color: '#ff7e00' }, label: { formatter: 'Ⅲ类线', color: '#ff7e00', fontSize: 10 } }
                            ]
                        }
                    },
                    // 数据折线
                    {
                        name: '溶解氧',
                        type: 'line',
                        smooth: true,
                        data: timeSeriesData.dissolved_oxygen,
                        lineStyle: { color: '#0ea5e9', width: 2 },
                        itemStyle: { color: '#0ea5e9' },
                        symbol: 'circle',
                        symbolSize: 6,
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值', itemStyle: { color: '#22c55e' } },
                                { type: 'min', name: '最小值', itemStyle: { color: '#f59e0b' } }
                            ],
                            label: { color: '#fff', fontSize: 10 }
                        }
                    }
                ]
            };
            
            charts.do.setOption(option);
        }
        
        // 渲染PH图表
        function renderPHChart() {
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        const data = params[0];
                        const value = data.value;
                        let status = '符合国标';
                        if (value < 6 || value > 9) status = '超标';
                        
                        return `<div style="font-weight:bold">${data.name}</div>
                                <div>PH值: <span style="color:#22c55e;font-weight:bold">${value}</span></div>
                                <div>状态: <span style="color:#22c55e">${status}</span></div>
                                <div style="color:#94a3b8;font-size:12px;margin-top:5px">水质酸碱度稳定</div>`;
                    }
                },
                grid: {
                    top: '10%',
                    left: '3%',
                    right: '4%',
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: timeSeriesData.dates,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10,
                        rotate: 30
                    },
                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                yAxis: {
                    type: 'value',
                    min: 7.5,
                    max: 9.0,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10
                    },
                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
                },
                series: [
                    // 国标区间背景
                    {
                        type: 'line',
                        markArea: {
                            silent: true,
                            itemStyle: {
                                color: 'rgba(34, 197, 94, 0.1)'
                            },
                            data: [[{
                                yAxis: 6
                            }, {
                                yAxis: 9
                            }]]
                        }
                    },
                    // 国标限值线
                    {
                        type: 'line',
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            lineStyle: {
                                type: 'dashed',
                                width: 1,
                                color: '#22c55e'
                            },
                            data: [
                                { yAxis: 6, label: { formatter: '国标下限', color: '#22c55e', fontSize: 10 } },
                                { yAxis: 9, label: { formatter: '国标上限', color: '#22c55e', fontSize: 10 } }
                            ]
                        }
                    },
                    // 数据折线
                    {
                        name: 'PH',
                        type: 'line',
                        smooth: true,
                        data: timeSeriesData.ph,
                        lineStyle: { color: '#22c55e', width: 2 },
                        itemStyle: { color: '#22c55e' },
                        symbol: 'circle',
                        symbolSize: 6,
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值', itemStyle: { color: '#0ea5e9' } },
                                { type: 'min', name: '最小值', itemStyle: { color: '#0ea5e9' } }
                            ],
                            label: { color: '#fff', fontSize: 10 }
                        }
                    }
                ]
            };
            
            charts.ph.setOption(option);
        }
        
        // 渲染氨氮图表
        function renderNHChart() {
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        const data = params[0];
                        const value = data.value;
                        let level = 'Ⅰ类';
                        if (value > 0.15) level = 'Ⅱ类';
                        if (value > 0.5) level = 'Ⅲ类';
                        if (value > 1.0) level = 'Ⅳ类';
                        
                        let reason = '正常运行';
                        const month = parseInt(data.name.split('-')[1]);
                        if (month >= 6 && month <= 8) reason = '雨季水量大，稀释作用明显';
                        if (month <= 2 || month >= 11) reason = '枯水期，水体自净能力减弱';
                        
                        return `<div style="font-weight:bold">${data.name}</div>
                                <div>氨氮: <span style="color:#f59e0b;font-weight:bold">${value}</span> mg/L</div>
                                <div>水质等级: <span style="color:${value <= 0.15 ? '#00e400' : value <= 0.5 ? '#ffff00' : '#ff7e00'}">${level}</span></div>
                                <div style="color:#94a3b8;font-size:12px;margin-top:5px">${reason}</div>`;
                    }
                },
                grid: {
                    top: '10%',
                    left: '3%',
                    right: '4%',
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: timeSeriesData.dates,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10,
                        rotate: 30
                    },
                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                yAxis: {
                    type: 'value',
                    max: 0.6,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10,
                        formatter: '{value} mg/L'
                    },
                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
                },
                series: [
                    // Ⅰ类水质区间背景
                    {
                        type: 'line',
                        markArea: {
                            silent: true,
                            itemStyle: {
                                color: 'rgba(0, 228, 0, 0.1)'
                            },
                            data: [[{
                                yAxis: 0
                            }, {
                                yAxis: 0.15
                            }]]
                        }
                    },
                    // Ⅱ类水质区间背景
                    {
                        type: 'line',
                        markArea: {
                            silent: true,
                            itemStyle: {
                                color: 'rgba(255, 255, 0, 0.1)'
                            },
                            data: [[{
                                yAxis: 0.15
                            }, {
                                yAxis: 0.5
                            }]]
                        }
                    },
                    // 国标限值线
                    {
                        type: 'line',
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            lineStyle: {
                                type: 'dashed',
                                width: 1
                            },
                            data: [
                                { yAxis: 0.15, lineStyle: { color: '#00e400' }, label: { formatter: 'Ⅰ类线', color: '#00e400', fontSize: 10 } },
                                { yAxis: 0.5, lineStyle: { color: '#ffff00' }, label: { formatter: 'Ⅱ类线', color: '#ffff00', fontSize: 10 } }
                            ]
                        }
                    },
                    // 数据折线
                    {
                        name: '氨氮',
                        type: 'line',
                        smooth: true,
                        data: timeSeriesData.ammonia_nitrogen,
                        lineStyle: { color: '#f59e0b', width: 2 },
                        itemStyle: { color: '#f59e0b' },
                        symbol: 'circle',
                        symbolSize: 6,
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值', itemStyle: { color: '#ef4444' } },
                                { type: 'min', name: '最小值', itemStyle: { color: '#22c55e' } }
                            ],
                            label: { color: '#fff', fontSize: 10 }
                        }
                    }
                ]
            };
            
            charts.nh.setOption(option);
        }
        
        // 渲染分时段对比图表
        function renderSeasonChart() {
            // 计算汛期/非汛期数据
            const seasonData = calculateSeasonData();
            
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                legend: {
                    data: ['汛期(6-9月)', '非汛期', '年度均值'],
                    textStyle: { color: '#94a3b8', fontSize: 10 },
                    top: 0,
                    itemWidth: 12,
                    itemHeight: 10
                },
                grid: {
                    top: '20%',
                    left: '3%',
                    right: '4%',
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: seasonData.years,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 11
                    },
                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                yAxis: {
                    type: 'value',
                    name: '综合水质指数',
                    nameTextStyle: { color: '#64748b', fontSize: 10 },
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10
                    },
                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
                },
                series: [
                    {
                        name: '汛期(6-9月)',
                        type: 'bar',
                        data: seasonData.floodSeason,
                        itemStyle: { color: '#0ea5e9' }
                    },
                    {
                        name: '非汛期',
                        type: 'bar',
                        data: seasonData.nonFloodSeason,
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: '年度均值',
                        type: 'line',
                        data: seasonData.annualAvg,
                        lineStyle: { color: '#f59e0b', width: 2 },
                        itemStyle: { color: '#f59e0b' },
                        symbol: 'circle',
                        symbolSize: 8
                    }
                ]
            };
            
            charts.season.setOption(option);
        }
        
        // 计算汛期/非汛期数据
        function calculateSeasonData() {
            const yearData = {};
            
            // 按年份分组
            timeSeriesData.dates.forEach((date, index) => {
                const year = date.slice(0, 4);
                const month = parseInt(date.slice(5, 7));
                
                if (!yearData[year]) {
                    yearData[year] = {
                        flood: [],
                        nonFlood: []
                    };
                }
                
                // 计算综合水质指数（基于三个指标）
                const doScore = Math.min(timeSeriesData.dissolved_oxygen[index] / 10, 1);
                const phScore = 1 - Math.abs(timeSeriesData.ph[index] - 8) / 2;
                const nhScore = 1 - Math.min(timeSeriesData.ammonia_nitrogen[index] / 0.5, 1);
                const compositeScore = (doScore + phScore + nhScore) / 3;
                
                // 6-9月为汛期
                if (month >= 6 && month <= 9) {
                    yearData[year].flood.push(compositeScore);
                } else {
                    yearData[year].nonFlood.push(compositeScore);
                }
            });
            
            const years = Object.keys(yearData).sort();
            const floodSeason = [];
            const nonFloodSeason = [];
            const annualAvg = [];
            
            years.forEach(year => {
                const floodAvg = yearData[year].flood.length > 0 
                    ? yearData[year].flood.reduce((a, b) => a + b, 0) / yearData[year].flood.length 
                    : 0;
                const nonFloodAvg = yearData[year].nonFlood.length > 0 
                    ? yearData[year].nonFlood.reduce((a, b) => a + b, 0) / yearData[year].nonFlood.length 
                    : 0;
                const all = [...yearData[year].flood, ...yearData[year].nonFlood];
                const avg = all.length > 0 ? all.reduce((a, b) => a + b, 0) / all.length : 0;
                
                floodSeason.push(Number(floodAvg.toFixed(2)));
                nonFloodSeason.push(Number(nonFloodAvg.toFixed(2)));
                annualAvg.push(Number(avg.toFixed(2)));
            });
            
            return { years, floodSeason, nonFloodSeason, annualAvg };
        }
        
        // 切换视图
        function switchView(view) {
            currentView = view;
            
            // 更新按钮状态
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            event.target.closest('.tool-btn').classList.add('active');
            
            const doContainer = document.getElementById('doChartContainer');
            const phContainer = document.getElementById('phChartContainer');
            const nhContainer = document.getElementById('nhChartContainer');
            
            if (view === 'all') {
                doContainer.style.display = 'flex';
                phContainer.style.display = 'flex';
                nhContainer.style.display = 'flex';
                doContainer.style.height = '280px';
                phContainer.style.height = '280px';
                nhContainer.style.height = '280px';
            } else if (view === 'do') {
                doContainer.style.display = 'flex';
                phContainer.style.display = 'none';
                nhContainer.style.display = 'none';
                doContainer.style.height = '600px';
            } else if (view === 'ph') {
                doContainer.style.display = 'none';
                phContainer.style.display = 'flex';
                nhContainer.style.display = 'none';
                phContainer.style.height = '600px';
            } else if (view === 'nh') {
                doContainer.style.display = 'none';
                phContainer.style.display = 'none';
                nhContainer.style.display = 'flex';
                nhContainer.style.height = '600px';
            }
            
            // 重新调整图表大小
            setTimeout(() => {
                Object.values(charts).forEach(chart => chart && chart.resize());
            }, 100);
        }
        
        // 切换对比模式
        function toggleCompare() {
            // 更新按钮状态
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            event.target.closest('.tool-btn').classList.add('active');
            
            // 创建对比图表
            const compareChart = echarts.init(document.getElementById('doChart'));
            
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['溶解氧', 'PH', '氨氮'],
                    textStyle: { color: '#94a3b8', fontSize: 10 },
                    top: 0
                },
                grid: {
                    top: '15%',
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: timeSeriesData.dates,
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 10,
                        rotate: 30
                    }
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'DO/PH',
                        position: 'left',
                        axisLabel: { color: '#94a3b8', fontSize: 10 },
                        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
                    },
                    {
                        type: 'value',
                        name: '氨氮',
                        position: 'right',
                        axisLabel: { color: '#94a3b8', fontSize: 10 }
                    }
                ],
                dataZoom: [
                    { type: 'inside', start: 0, end: 100 },
                    { type: 'slider', start: 0, end: 100, bottom: 5, height: 20 }
                ],
                series: [
                    {
                        name: '溶解氧',
                        type: 'line',
                        smooth: true,
                        data: timeSeriesData.dissolved_oxygen,
                        lineStyle: { color: '#0ea5e9', width: 2 },
                        itemStyle: { color: '#0ea5e9' }
                    },
                    {
                        name: 'PH',
                        type: 'line',
                        smooth: true,
                        data: timeSeriesData.ph,
                        lineStyle: { color: '#22c55e', width: 2 },
                        itemStyle: { color: '#22c55e' }
                    },
                    {
                        name: '氨氮',
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 1,
                        data: timeSeriesData.ammonia_nitrogen,
                        lineStyle: { color: '#f59e0b', width: 2 },
                        itemStyle: { color: '#f59e0b' }
                    }
                ]
            };
            
            compareChart.setOption(option);
            
            // 隐藏其他图表容器，放大溶解氧容器用于显示对比图
            const doContainer = document.getElementById('doChartContainer');
            doContainer.style.display = 'flex';
            doContainer.style.height = '600px';
            document.getElementById('phChartContainer').style.display = 'none';
            document.getElementById('nhChartContainer').style.display = 'none';
            
            // 重新调整图表大小
            setTimeout(() => {
                compareChart.resize();
            }, 100);
        }

  const resizeCharts = () => {
    Object.values(charts).forEach((chart) => chart && chart.resize());
  };

  const handleAnalysisClick = (event) => {
    const button = event.target.closest('[data-analysis-action]');
    if (!button) return;

    const action = button.dataset.analysisAction;
    if (action === 'go-back') {
      event.preventDefault();
      goBack();
    } else if (action === 'switch-view') {
      event.preventDefault();
      switchView(button.dataset.view || 'all');
    } else if (action === 'toggle-compare') {
      event.preventDefault();
      toggleCompare();
    }
  };

  initCharts();
  loadRealData();
  updateTime();
  const timeTimer = window.setInterval(updateTime, 1000);
  window.addEventListener('resize', resizeCharts);
  document.addEventListener('click', handleAnalysisClick);

  return () => {
    window.clearInterval(timeTimer);
    window.removeEventListener('resize', resizeCharts);
    document.removeEventListener('click', handleAnalysisClick);
    Object.values(charts).forEach((chart) => chart && chart.dispose());
    charts = {};
    document.body.style.cursor = 'default';
    document.querySelector('.toast-message')?.remove();
  };
}

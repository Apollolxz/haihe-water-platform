import * as echarts from 'echarts';

export function initCorrelationAnalysisRuntime() {

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
        let correlationData = null;
        let rawData = [];
        
        // 指标分类
        const categoryMap = {
            'physical': ['水温', '溶解氧', 'PH'],
            'nutrient': ['氨氮', '总磷', '总氮'],
            'pollution': ['电导率', '浊度', '高锰酸盐指数']
        };
        
        // 指标英文名映射（用于显示）
        const indicatorNames = ['水温', 'PH', '溶解氧', '电导率', '浊度', '高锰酸盐指数', '氨氮', '总磷', '总氮'];
        
        
        
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
            charts.heatmap = echarts.init(document.getElementById('heatmapChart'));
        }
        
        // 加载真实数据
        async function loadRealData() {
            try {
                showLoading();
                console.log('[DEBUG] Loading correlation data from:', API_BASE);
                
                const response = await fetch(`${API_BASE}/dashboard/correlation-heatmap`);
                const result = await response.json();
                
                console.log('[DEBUG] Correlation response:', result);
                
                if (result.success && result.data && result.data.values && result.data.values.length > 0) {
                    correlationData = result.data;
                    rawData = result.data.values;
                    
                    renderHeatmap();
                    updateFeatureRecommendations();
                    updateControlList();
                    
                    if (result.data.message) {
                        showToast(result.data.message);
                    }
                } else {
                    const message = (result.data && result.data.message) || result.error || '暂无真实相关性数据';
                    console.warn('[DEBUG] No valid correlation data:', message);
                    renderNoDataState(message);
                    showToast(message);
                }
                
                hideLoading();
            } catch (error) {
                console.error('[DEBUG] Error loading data:', error);
                renderNoDataState('数据加载失败，未加载到真实相关性数据');
                showToast('数据加载失败，未加载到真实相关性数据');
                hideLoading();
            }
        }

        function makePairKey(indicator1, indicator2) {
            return [indicator1, indicator2].sort().join(' | ');
        }

        function getPairSampleCount(indicator1, indicator2) {
            if (!correlationData || !correlationData.pair_sample_counts) return 0;
            return correlationData.pair_sample_counts[makePairKey(indicator1, indicator2)] || 0;
        }

        function getPairScatterSamples(indicator1, indicator2) {
            if (!correlationData || !correlationData.scatter_samples) return [];
            return correlationData.scatter_samples[makePairKey(indicator1, indicator2)] || [];
        }

        function renderHeatmapEmpty(message) {
            charts.heatmap.clear();
            charts.heatmap.setOption({
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

        function renderFeatureTags(selector, features, className, emptyLabel) {
            const container = document.querySelector(selector);
            if (!container) return;
            if (features && features.length > 0) {
                container.innerHTML = features.map(item => `<span class="feature-tag ${className}">${item}</span>`).join('');
            } else {
                container.innerHTML = `<span class="feature-tag ${className}">${emptyLabel}</span>`;
            }
        }

        function generateCorrelationInterpretation(indicator1, indicator2, correlation, sampleCount) {
            const absCorr = Math.abs(correlation);
            const strength = absCorr >= 0.7 ? '强' : absCorr >= 0.4 ? '中等' : '弱';
            const direction = correlation > 0 ? '正相关' : '负相关';
            return {
                analysis: `${indicator1} 与 ${indicator2} 基于 ${sampleCount} 组真实配对样本呈${strength}${direction}（r=${correlation}）`,
                environment: correlation > 0
                    ? '两项指标通常同步变化，建议结合排放过程、季节因素和上下游扰动共同分析'
                    : '两项指标在真实样本中存在反向联动，建议重点排查温度、水动力或治理措施带来的耦合影响',
                application: absCorr >= 0.5
                    ? '建议将这两项指标纳入联动监测清单，作为同源波动或治理成效复核的重要参考'
                    : '建议持续积累样本并结合站点、时段和污染类型做分组复核，避免单次相关性被偶然波动放大'
            };
        }

        function renderNoDataState(message) {
            correlationData = {
                indicators: indicatorNames,
                values: [],
                feature_recommendations: {
                    core_features: [],
                    pollution_features: [],
                    auxiliary_features: [],
                    redundant_pairs: []
                },
                pollution_control: {},
                pair_sample_counts: {},
                scatter_samples: {}
            };
            rawData = [];
            renderHeatmapEmpty(message);
            updateFeatureRecommendations();
            updateControlList();
            closeDetail();
        }
        
        // 渲染热力图
        function renderHeatmap(categoryFilter = 'all') {
            if (!correlationData) return;
            
            let indicators = correlationData.indicators;
            let values = correlationData.values;
            
            // 如果有过滤，重新组织数据
            if (categoryFilter !== 'all' && categoryMap[categoryFilter]) {
                const filteredIndicators = categoryMap[categoryFilter];
                const indices = filteredIndicators.map(name => indicators.indexOf(name)).filter(i => i >= 0);
                
                indicators = filteredIndicators;
                values = [];
                for (let i of indices) {
                    for (let j of indices) {
                        const origValue = rawData.find(v => v[0] === i && v[1] === j);
                        if (origValue) {
                            values.push([indices.indexOf(i), indices.indexOf(j), origValue[2]]);
                        }
                    }
                }
            }
            
            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    position: 'top',
                    formatter: function(params) {
                        const val = params.data[2];
                        const currentIndicator1 = indicators[params.data[0]];
                        const currentIndicator2 = indicators[params.data[1]];
                        const sampleCount = getPairSampleCount(currentIndicator1, currentIndicator2);
                        const strength = Math.abs(val) > 0.5 ? '强' : Math.abs(val) > 0.3 ? '中等' : '弱';
                        const direction = val > 0 ? '正' : '负';
                        return `<div style="font-weight:bold">${currentIndicator1} × ${currentIndicator2}</div>
                                <div>相关系数: <b style="color:${val > 0 ? '#ef4444' : '#3b82f6'}">${val}</b></div>
                                <div>相关强度: ${strength}${direction}相关</div>
                                <div>配对样本: ${sampleCount}</div>
                                <div style="color:#64748b;font-size:12px;margin-top:5px">点击查看详情</div>`;
                    }
                },
                grid: {
                    top: '10%',
                    left: '15%',
                    right: '10%',
                    bottom: '15%'
                },
                xAxis: {
                    type: 'category',
                    data: indicators,
                    splitArea: { show: true },
                    axisLabel: {
                        color: '#e2e8f0',
                        fontSize: 11,
                        rotate: 45
                    },
                    axisLine: { show: false }
                },
                yAxis: {
                    type: 'category',
                    data: indicators,
                    splitArea: { show: true },
                    axisLabel: {
                        color: '#e2e8f0',
                        fontSize: 11
                    },
                    axisLine: { show: false }
                },
                visualMap: {
                    min: -1,
                    max: 1,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '0%',
                    itemWidth: 15,
                    itemHeight: 100,
                    inRange: {
                        color: ['#3b82f6', '#ffffff', '#ef4444']
                    },
                    textStyle: { color: '#94a3b8', fontSize: 10 }
                },
                series: [{
                    name: '相关性',
                    type: 'heatmap',
                    data: values,
                    label: {
                        show: true,
                        color: function(params) {
                            const val = params.data[2];
                            return Math.abs(val) > 0.5 ? '#fff' : '#1e293b';
                        },
                        fontSize: 10,
                        fontWeight: 'bold',
                        formatter: function(params) {
                            return params.data[2].toFixed(2);
                        }
                    },
                    itemStyle: {
                        borderColor: function(params) {
                            const val = params.data[2];
                            // 强相关单元格高亮边框
                            return Math.abs(val) > 0.5 ? '#f59e0b' : 'transparent';
                        },
                        borderWidth: function(params) {
                            const val = params.data[2];
                            return Math.abs(val) > 0.5 ? 2 : 0;
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            
            charts.heatmap.setOption(option, true);
            
            // 点击事件
            charts.heatmap.off('click');
            charts.heatmap.on('click', function(params) {
                const i = params.data[0];
                const j = params.data[1];
                const val = params.data[2];
                
                showDetail(indicators[i], indicators[j], val);
            });
        }
        
        // 显示详情
        function showDetail(indicator1, indicator2, correlation) {
            if (indicator1 === indicator2) return;
            
            const panel = document.getElementById('detailPanel');
            const title = document.getElementById('detailTitle');
            const sampleCount = getPairSampleCount(indicator1, indicator2);
            
            title.innerHTML = `${indicator1} × ${indicator2} <span style="color:${correlation > 0 ? '#ef4444' : '#3b82f6'};margin-left:10px">r=${correlation}</span><span style="color:#94a3b8;margin-left:10px">n=${sampleCount}</span>`;
            
            const interp = generateCorrelationInterpretation(indicator1, indicator2, correlation, sampleCount);
            
            document.getElementById('corrAnalysis').textContent = interp.analysis;
            document.getElementById('envInterpretation').textContent = interp.environment;
            document.getElementById('applicationAdvice').textContent = interp.application;
            
            panel.classList.add('active');
            
            // 渲染散点图
            setTimeout(() => renderScatterChart(indicator1, indicator2, correlation), 100);
            
            // 滚动到详情面板
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // 关闭详情
        function closeDetail() {
            document.getElementById('detailPanel').classList.remove('active');
        }
        
        // 渲染散点图
        function renderScatterChart(indicator1, indicator2, correlation) {
            const chartDom = document.getElementById('scatterChart');
            if (!chartDom) return;
            
            if (charts.scatter) {
                charts.scatter.dispose();
            }
            charts.scatter = echarts.init(chartDom);
            
            const scatterData = getPairScatterSamples(indicator1, indicator2);
            if (!scatterData.length) {
                charts.scatter.setOption({
                    backgroundColor: 'transparent',
                    graphic: {
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        style: {
                            text: '暂无真实配对散点样本',
                            fill: '#94a3b8',
                            font: '14px "Microsoft YaHei"',
                            textAlign: 'center'
                        }
                    }
                }, true);
                return;
            }

            const xValues = scatterData.map(item => item[0]);
            const yValues = scatterData.map(item => item[1]);
            const meanX = xValues.reduce((sum, value) => sum + value, 0) / xValues.length;
            const meanY = yValues.reduce((sum, value) => sum + value, 0) / yValues.length;
            let numerator = 0;
            let denominator = 0;
            xValues.forEach((value, index) => {
                numerator += (value - meanX) * (yValues[index] - meanY);
                denominator += (value - meanX) * (value - meanX);
            });

            let trendLine = [];
            if (denominator > 0) {
                const slope = numerator / denominator;
                const intercept = meanY - slope * meanX;
                const minX = Math.min(...xValues);
                const maxX = Math.max(...xValues);
                trendLine = [
                    [minX, slope * minX + intercept],
                    [maxX, slope * maxX + intercept]
                ];
            }
            
            const option = {
                backgroundColor: 'transparent',
                grid: { top: 30, left: 50, right: 20, bottom: 40 },
                xAxis: {
                    type: 'value',
                    name: indicator1,
                    nameLocation: 'middle',
                    nameGap: 25,
                    nameTextStyle: { color: '#94a3b8', fontSize: 11 },
                    axisLabel: { color: '#64748b', fontSize: 9 },
                    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } }
                },
                yAxis: {
                    type: 'value',
                    name: indicator2,
                    nameLocation: 'middle',
                    nameGap: 35,
                    nameTextStyle: { color: '#94a3b8', fontSize: 11 },
                    axisLabel: { color: '#64748b', fontSize: 9 },
                    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } }
                },
                series: [{
                    type: 'scatter',
                    data: scatterData,
                    symbolSize: 8,
                    itemStyle: {
                        color: correlation > 0 ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.6)',
                        borderColor: correlation > 0 ? '#ef4444' : '#3b82f6',
                        borderWidth: 1
                    }
                }, {
                    type: 'line',
                    data: trendLine,
                    smooth: false,
                    symbol: 'none',
                    lineStyle: {
                        color: correlation > 0 ? '#ef4444' : '#3b82f6',
                        width: 2,
                        type: 'dashed'
                    }
                }]
            };
            
            charts.scatter.setOption(option);
        }
        
        // 筛选分类
        function filterCategory(category) {
            // 更新按钮状态
            document.querySelectorAll('.category-tag').forEach(tag => {
                tag.classList.remove('active');
            });
            document.querySelector(`[data-category="${category}"]`).classList.add('active');
            
            // 更新描述
            const descMap = {
                'all': '显示全部9项指标的相关性分析',
                'physical': '物理生态类指标：水温、溶解氧、PH',
                'nutrient': '营养盐类指标：氨氮、总磷、总氮',
                'pollution': '污染类指标：电导率、浊度、高锰酸盐指数'
            };
            document.getElementById('categoryDesc').textContent = descMap[category];
            
            // 重新渲染热力图
            renderHeatmap(category);
            
            // 关闭详情面板
            closeDetail();
        }
        
        // 更新特征推荐
        function updateFeatureRecommendations() {
            if (!correlationData || !correlationData.feature_recommendations) return;
            
            const rec = correlationData.feature_recommendations;
            const redundantList = document.getElementById('redundantList');
            renderFeatureTags('.feature-item.core .feature-tags', rec.core_features, 'tag-core', '暂无真实推荐');
            renderFeatureTags('.feature-item.pollution .feature-tags', rec.pollution_features, 'tag-pollution', '暂无真实推荐');
            renderFeatureTags('.feature-item.auxiliary .feature-tags', rec.auxiliary_features, 'tag-auxiliary', '暂无真实推荐');
            
            if (rec.redundant_pairs && rec.redundant_pairs.length > 0) {
                redundantList.innerHTML = rec.redundant_pairs.map(pair => `
                    <div class="redundant-item">
                        <b>保留 ${pair.keep}</b>，剔除 ${pair.remove}<br/>
                        <span style="color:#64748b">原因：${pair.reason}</span>
                    </div>
                `).join('');
            } else {
                redundantList.innerHTML = '<div class="redundant-item">暂无冗余特征建议</div>';
            }
        }
        
        // 更新管控清单
        function updateControlList() {
            const pc = correlationData.pollution_control;
            const container = document.getElementById('controlContainer');
            if (!pc || Object.keys(pc).length === 0) {
                container.innerHTML = `
                    <div class="control-list">
                        <div class="control-item">
                            <div class="control-header">
                                <div class="control-type">暂无真实联动关系</div>
                            </div>
                            <div class="control-suggestion">当前数据库样本不足以生成联动管控建议</div>
                        </div>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="control-list">';
            
            Object.entries(pc).forEach(([key, item]) => {
                html += `
                    <div class="control-item">
                        <div class="control-header">
                            <div class="control-type">${item.title || (key === 'organic_pollution' ? '有机污染同源' : key === 'nutrient_pollution' ? '营养盐污染同源' : '物理生态关联')}</div>
                            <div class="control-corr">r=${item.correlation}</div>
                        </div>
                        <div class="control-indicators">${item.indicators.join(' × ')}</div>
                        <div class="control-suggestion" style="margin-bottom:6px;color:#64748b">配对样本: ${item.sample_count || 0}</div>
                        <div class="control-suggestion">${item.suggestion}</div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
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

  const handleAnalysisClick = (event) => {
    const button = event.target.closest('[data-analysis-action]');
    if (!button) return;

    const action = button.dataset.analysisAction;
    if (action === 'go-back') {
      event.preventDefault();
      goBack();
    } else if (action === 'close-detail') {
      event.preventDefault();
      closeDetail();
    } else if (action === 'filter-category') {
      event.preventDefault();
      filterCategory(button.dataset.category || 'all');
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

import * as echarts from 'echarts';

export function initBoxplotAnalysisRuntime() {
const API_BASE = window.HAIHE_RUNTIME?.resolveApi
                        ? window.HAIHE_RUNTIME.resolveApi('/api').replace(/\/$/, '')
                        : window.location.protocol === 'file:'
                            ? 'http://127.0.0.1:5001/api'
                            : `${window.location.origin}/api`;
        
        let charts = {};
        let boxplotData = null;
        
        const indicatorConfig = {
            '溶解氧': { unit: 'mg/L', level1: 7.5, level2: 6.0, level3: 5.0, higherBetter: true },
            '氨氮': { unit: 'mg/L', level1: 0.15, level2: 0.5, level3: 1.0, higherBetter: false },
            '总磷': { unit: 'mg/L', level1: 0.02, level2: 0.1, level3: 0.2, higherBetter: false },
            '高锰酸盐指数': { unit: 'mg/L', level1: 2.0, level2: 4.0, level3: 6.0, higherBetter: false },
            'PH': { unit: '', min: 6.0, max: 9.0, higherBetter: null }
        };
        
        
        
        function updateTime() {
            const now = new Date();
            document.getElementById('currentTime').textContent = now.toLocaleString('zh-CN');
        }
        
        function goBack() {
            window.location.href = 'dashboard.html';
        }
        
        async function loadData() {
            try {
                console.log('Loading data from:', API_BASE);
                const response = await fetch(API_BASE + '/dashboard/boxplot-data');
                const result = await response.json();
                console.log('Response:', result);
                
                if (result.success && result.data && result.data.indicators && result.data.indicators.length > 0) {
                    boxplotData = result.data;
                    renderAll();
                    if (result.data.message) {
                        showToast(result.data.message);
                    }
                } else {
                    renderEmptyState((result.data && result.data.message) || result.error || '暂无真实箱线分析数据');
                }
            } catch (error) {
                console.error('Error:', error);
                renderEmptyState('数据加载失败，未加载到真实箱线分析数据');
            }
        }

        function clearChartInstances() {
            Object.values(charts).forEach(chart => {
                if (chart) {
                    chart.dispose();
                }
            });
            charts = {};
        }
        
        function renderAll() {
            renderBoxplots();
            updateStatsTable();
            updateThresholdPanel();
            updateStabilityPanel();
        }
        
        function renderBoxplots() {
            const container = document.getElementById('boxplotGrid');
            container.innerHTML = '';
            
            boxplotData.indicators.forEach((indicator, index) => {
                const item = document.createElement('div');
                item.className = 'boxplot-item';
                item.innerHTML = `
                    <div class="boxplot-info">
                        <div class="boxplot-name">${indicator.name}</div>
                        <div class="boxplot-stats">
                            中位数: ${indicator.statistics.median}${indicator.unit}<br>
                            IQR: ${indicator.statistics.iqr}<br>
                            异常值: ${indicator.outlier_count}个
                        </div>
                    </div>
                    <div class="boxplot-chart" id="boxplot_${index}"></div>
                `;
                container.appendChild(item);
                
                setTimeout(() => renderSingleBoxplot(index, indicator), 0);
            });
        }
        
        function renderSingleBoxplot(index, indicator) {
            const chartDom = document.getElementById(`boxplot_${index}`);
            if (!chartDom) return;
            
            const chart = echarts.init(chartDom);
            charts[`boxplot_${index}`] = chart;
            
            const config = indicatorConfig[indicator.name];
            const boxData = indicator.boxplot;
            const outliers = boxplotData.outliers && boxplotData.outliers[index] ? boxplotData.outliers[index].outliers : [];
            
            const outlierData = outliers.map(o => [0, o.value, o]);
            
            const markLines = [];
            if (config) {
                if (indicator.name === 'PH') {
                    markLines.push({ yAxis: config.min, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: '国标下限', color: '#ef4444' } });
                    markLines.push({ yAxis: config.max, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: '国标上限', color: '#ef4444' } });
                } else if (config.higherBetter) {
                    markLines.push({ yAxis: config.level1, lineStyle: { color: '#22c55e', type: 'dashed' }, label: { formatter: 'Ⅰ类', color: '#22c55e' } });
                    markLines.push({ yAxis: config.level2, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: 'Ⅱ类', color: '#f59e0b' } });
                    markLines.push({ yAxis: config.level3, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: 'Ⅲ类', color: '#ef4444' } });
                } else {
                    markLines.push({ yAxis: config.level1, lineStyle: { color: '#22c55e', type: 'dashed' }, label: { formatter: 'Ⅰ类', color: '#22c55e' } });
                    markLines.push({ yAxis: config.level2, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: 'Ⅱ类', color: '#f59e0b' } });
                    markLines.push({ yAxis: config.level3, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: 'Ⅲ类', color: '#ef4444' } });
                }
            }
            
            const option = {
                backgroundColor: 'transparent',
                tooltip: { trigger: 'item' },
                grid: { left: 10, right: 10, top: 20, bottom: 20 },
                xAxis: { type: 'category', data: [''], axisLabel: { show: false }, axisLine: { show: false }, splitLine: { show: false } },
                yAxis: { type: 'value', axisLabel: { color: '#64748b', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } } },
                series: [
                    { type: 'boxplot', data: [[boxData[0], boxData[1], boxData[2], boxData[3], boxData[4]]], itemStyle: { color: 'rgba(14, 165, 233, 0.3)', borderColor: '#0ea5e9', borderWidth: 2 }, markLine: { silent: true, symbol: 'none', data: markLines } },
                    { type: 'scatter', data: outlierData, symbolSize: 10, itemStyle: { color: '#ef4444' } }
                ]
            };
            
            chart.setOption(option);
            chart.on('click', function(params) { if (params.seriesType === 'scatter' && params.data[2]) showOutlierDetail(indicator, params.data[2]); });
        }
        
        function updateStatsTable() {
            const tbody = document.getElementById('statsTableBody');
            tbody.innerHTML = boxplotData.indicators.map(ind => `
                <tr>
                    <td><div class="stats-indicator">${ind.name}</div></td>
                    <td>${ind.statistics.min}</td>
                    <td>${ind.statistics.q1}</td>
                    <td style="color: #22c55e; font-weight: 600;">${ind.statistics.median}</td>
                    <td>${ind.statistics.q3}</td>
                    <td>${ind.statistics.max}</td>
                    <td style="color: #0ea5e9;">${ind.statistics.iqr}</td>
                </tr>
            `).join('');
        }
        
        function updateThresholdPanel() {
            const container = document.getElementById('thresholdContainer');
            container.innerHTML = boxplotData.indicators.map((ind, idx) => `
                <div class="threshold-item">
                    <div class="threshold-header">
                        <div class="threshold-name">${ind.name} (${ind.unit})</div>
                        <div class="threshold-range">当前: ${ind.warning_threshold.lower} - ${ind.warning_threshold.upper}</div>
                    </div>
                    <div class="threshold-inputs">
                        <div class="threshold-input-group">
                            <div class="threshold-label">预警下限</div>
                            <input type="number" class="threshold-input" id="th_low_${idx}" value="${ind.warning_threshold.lower}" step="0.01">
                        </div>
                        <div class="threshold-input-group">
                            <div class="threshold-label">预警上限</div>
                            <input type="number" class="threshold-input" id="th_high_${idx}" value="${ind.warning_threshold.upper}" step="0.01">
                        </div>
                        <button class="save-btn" data-analysis-action="save-threshold" data-threshold-index="${idx}" data-threshold-name="${escapeHtml(ind.name)}">保存</button>
                    </div>
                </div>
            `).join('');
        }
        
        function saveThreshold(index, name) {
            const lower = document.getElementById(`th_low_${index}`).value;
            const upper = document.getElementById(`th_high_${index}`).value;
            alert(`${name}预警阈值已保存: ${lower} - ${upper}`);
        }

        function escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        
        function updateStabilityPanel() {
            document.getElementById('overallStability').textContent = boxplotData.overall_stability || '--';
            
            const list = document.getElementById('stabilityList');
            list.innerHTML = boxplotData.indicators.map(ind => {
                const score = ind.stability_score;
                let color = '#22c55e';
                if (score < 60) color = '#ef4444';
                else if (score < 75) color = '#f59e0b';
                else if (score < 90) color = '#0ea5e9';
                
                return `
                    <div class="stability-item">
                        <div class="stability-indicator">${ind.name}</div>
                        <div class="stability-bar"><div class="stability-fill" style="width: ${score}%; background: ${color};"></div></div>
                        <div class="stability-value" style="color: ${color};">${score}</div>
                    </div>
                `;
            }).join('');
        }
        
        function showOutlierDetail(indicator, outlier) {
            const modal = document.getElementById('outlierModal');
            document.getElementById('outlierModalTitle').innerHTML = `<i class="fa fa-exclamation-triangle"></i> ${indicator.name} 异常值详情`;
            
            let analysis = '';
            const config = indicatorConfig[indicator.name];
            if (indicator.name === 'PH') {
                if (outlier.value < 6) analysis = 'PH值偏低，可能受酸性废水排放或酸雨影响。';
                else if (outlier.value > 9) analysis = 'PH值偏高，可能受碱性废水排放影响。';
            } else if (config && !config.higherBetter && outlier.value > config.level3) {
                analysis = `超过Ⅲ类标准(${config.level3})，可能存在严重污染。`;
            } else if (config && config.higherBetter && outlier.value < config.level3) {
                analysis = `低于Ⅲ类标准(${config.level3})，溶解氧不足。`;
            }
            if (!analysis) analysis = '数值偏离正常范围，建议检查监测设备。';
            
            document.getElementById('outlierDetail').innerHTML = `
                <div class="outlier-item"><div class="outlier-label">指标浓度</div><div class="outlier-value" style="color: #ef4444;">${outlier.value} ${indicator.unit}</div></div>
                <div class="outlier-item"><div class="outlier-label">监测时间</div><div class="outlier-value">${outlier.date}</div></div>
                <div class="outlier-item"><div class="outlier-label">监测站点</div><div class="outlier-value">${outlier.location}</div></div>
                <div class="outlier-item"><div class="outlier-label">所在省份</div><div class="outlier-value">${outlier.province}</div></div>
                ${outlier.exceeded ? `<div class="outlier-item"><div class="outlier-label">超标情况</div><div class="outlier-value" style="color: #ef4444;">${outlier.exceeded}</div></div>` : ''}
                <div style="padding: 12px; background: rgba(14, 165, 233, 0.1); border-radius: 8px; margin-top: 10px;"><div style="font-size: 12px; color: #0ea5e9; margin-bottom: 8px; font-weight: 600;"><i class="fa fa-info-circle"></i> 异常原因分析</div><div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">${analysis}</div></div>
            `;
            modal.classList.add('active');
        }
        
        function closeOutlierModal() {
            document.getElementById('outlierModal').classList.remove('active');
        }
        
        function renderEmptyState(message) {
            clearChartInstances();
            boxplotData = { indicators: [], outliers: [], overall_stability: '--', sample_count: 0 };

            const boxplotGrid = document.getElementById('boxplotGrid');
            const statsTableBody = document.getElementById('statsTableBody');
            const thresholdContainer = document.getElementById('thresholdContainer');
            const stabilityList = document.getElementById('stabilityList');

            boxplotGrid.innerHTML = `
                <div style="grid-column: 1 / -1; min-height: 280px; display: flex; align-items: center; justify-content: center; color: #94a3b8; border: 1px dashed rgba(148,163,184,0.3); border-radius: 16px; background: rgba(15,23,42,0.35);">
                    ${message}
                </div>
            `;
            statsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px 12px;">${message}</td>
                </tr>
            `;
            thresholdContainer.innerHTML = `
                <div class="threshold-item">
                    <div class="threshold-header">
                        <div class="threshold-name">真实阈值面板</div>
                        <div class="threshold-range">${message}</div>
                    </div>
                </div>
            `;
            document.getElementById('overallStability').textContent = '--';
            stabilityList.innerHTML = `
                <div class="stability-item" style="justify-content: center; color: #94a3b8;">
                    ${message}
                </div>
            `;
            closeOutlierModal();
            showToast(message);
        }

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
                    background: rgba(15, 23, 42, 0.92);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(148, 163, 184, 0.25);
                ">${message}</div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
        

  const outlierModal = document.getElementById('outlierModal');
  const closeWhenBackdropClicked = (event) => {
    if (event.target === outlierModal) closeOutlierModal();
  };
  outlierModal?.addEventListener('click', closeWhenBackdropClicked);

  const handleAnalysisClick = (event) => {
    const button = event.target.closest('[data-analysis-action]');
    if (!button) return;

    const action = button.dataset.analysisAction;
    if (action === 'go-back') {
      event.preventDefault();
      goBack();
    } else if (action === 'close-outlier-modal') {
      event.preventDefault();
      closeOutlierModal();
    } else if (action === 'save-threshold') {
      event.preventDefault();
      saveThreshold(Number(button.dataset.thresholdIndex), button.dataset.thresholdName || '');
    }
  };

  loadData();
  updateTime();
  const timeTimer = window.setInterval(updateTime, 1000);
  document.addEventListener('click', handleAnalysisClick);

  return () => {
    window.clearInterval(timeTimer);
    document.removeEventListener('click', handleAnalysisClick);
    outlierModal?.removeEventListener('click', closeWhenBackdropClicked);
    clearChartInstances();
    document.querySelector('.toast-message')?.remove();
  };
}

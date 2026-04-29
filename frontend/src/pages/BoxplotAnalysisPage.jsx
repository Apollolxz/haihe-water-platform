import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function initBoxplotAnalysisRuntime() {
  let cleanup;
  let cancelled = false;

  import('./boxplotAnalysisRuntime.js').then(({ initBoxplotAnalysisRuntime: initRuntime }) => {
    if (!cancelled) cleanup = initRuntime();
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}

function BoxplotAnalysisPageMarkup() {
  return (
    <>
      <style>{"* { margin: 0; padding: 0; box-sizing: border-box; }\r\n        html, body {\r\n            width: 100%; min-height: 100%; overflow-x: hidden; overflow-y: auto;\r\n            font-family: 'Microsoft YaHei', sans-serif;\r\n            background: linear-gradient(135deg, #0a0f1c 0%, #0d1321 50%, #0a0f1c 100%);\r\n            color: #fff;\r\n        }\r\n        ::-webkit-scrollbar { width: 8px; height: 8px; }\r\n        ::-webkit-scrollbar-track { background: rgba(14, 165, 233, 0.1); border-radius: 4px; }\r\n        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, rgba(14, 165, 233, 0.5), rgba(34, 197, 94, 0.5)); border-radius: 4px; }\r\n        .bg-grid { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px); background-size: 50px 50px; pointer-events: none; z-index: 0; }\r\n        .glow-orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }\r\n        .glow-orb-1 { top: -10%; left: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%); }\r\n        .glow-orb-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%); }\r\n        .top-nav { position: fixed; top: 0; left: 0; right: 0; height: 64px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(14, 165, 233, 0.2); z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; }\r\n        .nav-title { font-size: 22px; font-weight: bold; background: linear-gradient(90deg, #0ea5e9, #22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: flex; align-items: center; gap: 12px; }\r\n        .nav-back { padding: 8px 20px; background: rgba(14, 165, 233, 0.15); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 6px; color: #0ea5e9; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; font-size: 14px; }\r\n        .nav-back:hover { background: rgba(14, 165, 233, 0.3); }\r\n        .main-container { position: relative; top: 64px; left: 0; right: 0; min-height: calc(100vh - 64px); padding: 20px; z-index: 1; display: flex; flex-direction: column; gap: 20px; padding-bottom: 40px; }\r\n        .conclusion-bar { display: flex; gap: 20px; padding: 15px 20px; background: linear-gradient(90deg, rgba(14, 165, 233, 0.1) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(14, 165, 233, 0.1) 100%); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 12px; position: relative; overflow: hidden; }\r\n        .conclusion-bar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #0ea5e9 20%, #22c55e 50%, #0ea5e9 80%, transparent 100%); }\r\n        .conclusion-tag { flex: 1; padding: 15px 20px; background: rgba(15, 23, 42, 0.6); border-radius: 10px; border: 1px solid; display: flex; align-items: center; gap: 15px; }\r\n        .conclusion-tag.tag-1 { border-color: rgba(0, 228, 0, 0.4); background: linear-gradient(135deg, rgba(0, 228, 0, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); }\r\n        .conclusion-tag.tag-2 { border-color: rgba(14, 165, 233, 0.4); background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); }\r\n        .tag-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }\r\n        .tag-1 .tag-icon { background: rgba(0, 228, 0, 0.2); color: #00e400; }\r\n        .tag-2 .tag-icon { background: rgba(14, 165, 233, 0.2); color: #0ea5e9; }\r\n        .tag-content { flex: 1; }\r\n        .tag-title { font-size: 13px; color: #94a3b8; margin-bottom: 4px; }\r\n        .tag-value { font-size: 14px; font-weight: 600; color: #e2e8f0; line-height: 1.5; }\r\n        .tag-highlight { color: #22c55e; font-weight: bold; }\r\n        .content-area { display: grid; grid-template-columns: 1fr 400px; gap: 20px; min-height: 700px; }\r\n        .chart-card { background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%); border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 12px; padding: 20px; position: relative; overflow: hidden; display: flex; flex-direction: column; }\r\n        .chart-card::before, .chart-card::after { content: ''; position: absolute; width: 20px; height: 20px; border: 2px solid #0ea5e9; }\r\n        .chart-card::before { top: 0; left: 0; border-right: none; border-bottom: none; border-top-left-radius: 8px; }\r\n        .chart-card::after { bottom: 0; right: 0; border-left: none; border-top: none; border-bottom-right-radius: 8px; }\r\n        .corner-decoration { position: absolute; width: 20px; height: 20px; border: 2px solid #0ea5e9; }\r\n        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-top-left-radius: 8px; }\r\n        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; border-top-right-radius: 8px; }\r\n        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; border-bottom-left-radius: 8px; }\r\n        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; border-bottom-right-radius: 8px; }\r\n        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(14, 165, 233, 0.2); flex-shrink: 0; }\r\n        .card-title { font-size: 16px; font-weight: 600; color: #e2e8f0; display: flex; align-items: center; gap: 10px; }\r\n        .card-title i { color: #0ea5e9; font-size: 18px; }\r\n        .card-subtitle { font-size: 12px; color: #64748b; }\r\n        .chart-container { flex: 1; min-height: 0; position: relative; }\r\n        .boxplot-grid { display: grid; grid-template-columns: 1fr; gap: 15px; height: 100%; }\r\n        .boxplot-item { background: rgba(15, 23, 42, 0.5); border-radius: 10px; border: 1px solid rgba(14, 165, 233, 0.15); padding: 15px; display: flex; gap: 15px; align-items: center; }\r\n        .boxplot-info { width: 120px; flex-shrink: 0; }\r\n        .boxplot-name { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 8px; }\r\n        .boxplot-stats { font-size: 11px; color: #64748b; line-height: 1.6; }\r\n        .boxplot-chart { flex: 1; height: 100px; min-height: 100px; }\r\n        .right-panel { display: flex; flex-direction: column; gap: 15px; height: fit-content; }\r\n        .stats-table { width: 100%; border-collapse: collapse; font-size: 11px; }\r\n        .stats-table th, .stats-table td { padding: 8px 6px; text-align: center; border-bottom: 1px solid rgba(14, 165, 233, 0.1); }\r\n        .stats-table th { background: rgba(14, 165, 233, 0.15); color: #0ea5e9; font-weight: 600; font-size: 10px; }\r\n        .stats-table td { color: #e2e8f0; }\r\n        .stats-indicator { font-weight: 600; font-size: 11px; color: #0ea5e9; }\r\n        .threshold-item { padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #f59e0b; }\r\n        .threshold-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }\r\n        .threshold-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }\r\n        .threshold-range { font-size: 11px; padding: 3px 8px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; }\r\n        .threshold-inputs { display: flex; gap: 10px; align-items: center; }\r\n        .threshold-input-group { flex: 1; }\r\n        .threshold-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }\r\n        .threshold-input { width: 100%; padding: 6px 10px; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 6px; color: #e2e8f0; font-size: 12px; }\r\n        .save-btn { padding: 6px 14px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.3)); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 6px; color: #22c55e; font-size: 11px; cursor: pointer; }\r\n        .stability-overview { padding: 20px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(34, 197, 94, 0.1)); border-radius: 10px; border: 1px solid rgba(14, 165, 233, 0.3); margin-bottom: 15px; text-align: center; }\r\n        .stability-score-large { font-size: 48px; font-weight: bold; background: linear-gradient(90deg, #0ea5e9, #22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\r\n        .stability-label { font-size: 14px; color: #94a3b8; margin-top: 5px; }\r\n        .stability-list { display: flex; flex-direction: column; gap: 8px; }\r\n        .stability-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; }\r\n        .stability-indicator { font-size: 12px; color: #e2e8f0; }\r\n        .stability-bar { flex: 1; height: 8px; background: rgba(148, 163, 184, 0.2); border-radius: 4px; margin: 0 10px; overflow: hidden; }\r\n        .stability-fill { height: 100%; border-radius: 4px; }\r\n        .stability-value { font-size: 12px; font-weight: 600; width: 40px; text-align: right; }\r\n        .outlier-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 2000; display: none; align-items: center; justify-content: center; }\r\n        .outlier-modal.active { display: flex; }\r\n        .outlier-content { background: rgba(15, 23, 42, 0.98); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 25px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }\r\n        .outlier-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(239, 68, 68, 0.2); }\r\n        .outlier-title { font-size: 18px; font-weight: bold; color: #ef4444; }\r\n        .outlier-close { width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; cursor: pointer; }\r\n        .outlier-item { padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 3px solid #ef4444; margin-bottom: 10px; }\r\n        .outlier-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }\r\n        .outlier-value { font-size: 14px; color: #e2e8f0; font-weight: 600; }\r\n        @media (max-width: 1400px) { .content-area { grid-template-columns: 1fr; } }"}</style>
<div className="bg-grid"></div>
    <div className="glow-orb glow-orb-1"></div>
    <div className="glow-orb glow-orb-2"></div>

    <nav className="top-nav">
        <div className="nav-title">
            <i className="fa fa-bar-chart"></i>
            指标分布与异常预警专项屏
        </div>
        <div style={{ "display": "flex", "alignItems": "center", "gap": "20px" }}>
            <div style={{ "color": "#94a3b8", "fontSize": "13px" }}>
                <i className="fa fa-clock-o mr-2"></i>
                <span id="currentTime">--</span>
            </div>
            <button className="nav-back" data-analysis-action="go-back">
                <i className="fa fa-arrow-left"></i>
                返回大屏
            </button>
        </div>
    </nav>

    <div className="main-container">
        <div className="conclusion-bar">
            <div className="conclusion-tag tag-1">
                <div className="tag-icon"><i className="fa fa-check-circle"></i></div>
                <div className="tag-content">
                    <div className="tag-title">中位数达标情况</div>
                    <div className="tag-value">所有指标中位数均<span className="tag-highlight">优于国标Ⅱ类标准</span>，多数接近<span className="tag-highlight">Ⅰ类</span></div>
                </div>
            </div>
            <div className="conclusion-tag tag-2">
                <div className="tag-icon"><i className="fa fa-line-chart"></i></div>
                <div className="tag-content">
                    <div className="tag-title">水质稳定性</div>
                    <div className="tag-value">指标箱体<span className="tag-highlight">极窄</span>，波动<span className="tag-highlight">极小</span>，异常值仅为偶发扰动</div>
                </div>
            </div>
        </div>

        <div className="content-area">
            <div className="chart-card">
                <div className="corner-decoration corner-tl"></div>
                <div className="corner-decoration corner-tr"></div>
                <div className="corner-decoration corner-bl"></div>
                <div className="corner-decoration corner-br"></div>

                <div className="card-header">
                    <div className="card-title"><i className="fa fa-bar-chart"></i>核心指标箱线图分布</div>
                    <div className="card-subtitle">点击异常值查看详情</div>
                </div>
                <div className="chart-container">
                    <div className="boxplot-grid" id="boxplotGrid"></div>
                </div>
            </div>

            <div className="right-panel">
                <div className="chart-card">
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    <div className="card-header">
                        <div className="card-title"><i className="fa fa-table"></i>指标分布统计详情</div>
                    </div>
                    <div className="chart-container" style={{ "overflow": "auto" }}>
                        <table className="stats-table">
                            <thead>
                                <tr><th>指标</th><th>最小值</th><th>Q1</th><th>中位数</th><th>Q3</th><th>最大值</th><th>IQR</th></tr>
                            </thead>
                            <tbody id="statsTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    <div className="card-header">
                        <div className="card-title"><i className="fa fa-warning"></i>异常预警阈值设置</div>
                    </div>
                    <div className="chart-container" id="thresholdContainer" style={{ "overflow": "auto" }}></div>
                </div>

                <div className="chart-card">
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    <div className="card-header">
                        <div className="card-title"><i className="fa fa-star"></i>水质稳定性评分</div>
                    </div>
                    <div className="chart-container">
                        <div className="stability-overview">
                            <div className="stability-score-large" id="overallStability">--</div>
                            <div className="stability-label">全流域综合稳定性评分</div>
                        </div>
                        <div className="stability-list" id="stabilityList"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div className="outlier-modal" id="outlierModal">
        <div className="outlier-content">
            <div className="outlier-header">
                <div className="outlier-title" id="outlierModalTitle"><i className="fa fa-exclamation-triangle"></i> 异常值详情</div>
                <button className="outlier-close" data-analysis-action="close-outlier-modal"><i className="fa fa-times"></i></button>
            </div>
            <div id="outlierDetail"></div>
        </div>
    </div>
    </>
  );
}

export default function BoxplotAnalysisPage({ page }) {
  useLegacyPageRuntime(page, initBoxplotAnalysisRuntime);

  return <BoxplotAnalysisPageMarkup />;
}




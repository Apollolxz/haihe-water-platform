/* eslint-disable react/no-unknown-property */
function BoxplotAnalysisPage() {
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
            <button className="nav-back" data-legacy-click="goBack()">
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
                <button className="outlier-close" data-legacy-click="closeOutlierModal()"><i className="fa fa-times"></i></button>
            </div>
            <div id="outlierDetail"></div>
        </div>
    </div>
    </>
  );
}

function ChatPage() {
  return (
    <>
      <style>{"@layer utilities {\r\n            .bg-gradient-eco {\r\n                background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);\r\n            }\r\n            .bg-gradient-dark {\r\n                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);\r\n            }\r\n            .bg-gradient-wave {\r\n                background: linear-gradient(-45deg, #06b6d4, #10b981, #3b82f6, #06b6d4);\r\n                background-size: 400% 400%;\r\n                animation: wave 10s ease infinite;\r\n            }\r\n            .text-gradient {\r\n                background-clip: text;\r\n                -webkit-background-clip: text;\r\n                color: transparent;\r\n                background-image: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);\r\n            }\r\n            .card-shadow {\r\n                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);\r\n            }\r\n            .glass {\r\n                background: rgba(30, 41, 59, 0.7);\r\n                backdrop-filter: blur(10px);\r\n                -webkit-backdrop-filter: blur(10px);\r\n                border: 1px solid rgba(255, 255, 255, 0.1);\r\n            }\r\n            .glass-light {\r\n                background: rgba(49, 64, 84, 0.7);\r\n                backdrop-filter: blur(10px);\r\n                -webkit-backdrop-filter: blur(10px);\r\n                border: 1px solid rgba(255, 255, 255, 0.1);\r\n            }\r\n            .nav-link {\r\n                @apply relative px-4 py-2 text-gray-400 hover:text-primary transition-colors duration-300;\r\n            }\r\n            .nav-link::after {\r\n                content: '';\r\n                @apply absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300;\r\n            }\r\n            .nav-link:hover::after {\r\n                @apply w-full;\r\n            }\r\n            .nav-link.active {\r\n                @apply text-primary font-medium;\r\n            }\r\n            .nav-link.active::after {\r\n                @apply w-full;\r\n            }\r\n            .nav-core {\r\n                @apply relative px-5 py-2 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center;\r\n                background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);\r\n                animation: glow-pulse 2s infinite;\r\n            }\r\n            @keyframes glow-pulse {\r\n                0%, 100% { box-shadow: 0 0 8px rgba(6,182,212,0.6); transform: scale(1); }\r\n                50% { box-shadow: 0 0 20px rgba(6,182,212,0.9); transform: scale(1.02); }\r\n            }\r\n            .chat-message {\r\n                @apply rounded-lg p-4 max-w-[80%] animate-fade-in;\r\n            }\r\n            .user-message {\r\n                @apply bg-gradient-eco text-white self-end;\r\n            }\r\n            .bot-message {\r\n                @apply glass-light text-text-light self-start;\r\n            }\r\n            .typing-indicator {\r\n                @apply flex items-center space-x-1;\r\n            }\r\n            .typing-dot {\r\n                @apply w-2 h-2 bg-primary rounded-full animate-pulse;\r\n            }\r\n            .input-glow {\r\n                box-shadow: 0 0 5px rgba(6, 182, 212, 0.5);\r\n                transition: box-shadow 0.3s ease;\r\n            }\r\n            .input-glow:focus {\r\n                box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);\r\n            }\r\n        }"}</style>
<div id="particles-js" className="fixed inset-0 z-0"></div>
    
    <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-wave"></div>
    </div>
    
    <header className="glass sticky top-0 z-50">
        <div className="w-full px-6">
            <div className="flex items-center justify-between h-16">
                
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-eco flex items-center justify-center animate-float animate-glow">
                        <i className="fa fa-tint text-white text-xl"></i>
                    </div>
                    <h1 className="text-xl font-bold text-white">海河六域</h1>
                </div>
                
                
                <nav className="hidden md:flex space-x-1">
                    <a href="index.html" data-page-link="index.html" className="nav-link">
                        <i className="fa fa-home mr-2"></i>
                        <span>首页</span>
                    </a>
                    <a href="dashboard.html" data-page-link="dashboard.html" className="nav-link">
                        <i className="fa fa-dashboard mr-2"></i>
                        <span>数据大屏</span>
                    </a>
                    <a href="sandbox.html" data-page-link="sandbox.html" className="nav-core mx-2">
                        <i className="fa fa-globe mr-2"></i><span>流域时空推演沙盘</span>
                    </a>
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="nav-link">
                        <i className="fa fa-project-diagram mr-2"></i>
                        <span>知识图谱</span>
                    </a>
                    <a href="chat.html" data-page-link="chat.html" className="nav-link active">
                        <i className="fa fa-question-circle mr-2"></i>
                        <span>智能问答</span>
                    </a>
                </nav>
                
                
                <div className="flex items-center space-x-4">
                    <form className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-white/10 transition-colors" data-nav-search>
                        <i className="fa fa-search text-gray-400 mr-2"></i>
                        <input type="search" className="w-40 bg-transparent text-sm text-text-light placeholder:text-gray-500 focus:outline-none" placeholder="搜索功能或页面" />
                    </form>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                        <i className="fa fa-bell text-lg"></i>
                    </button>
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                            <div className="w-8 h-8 rounded-full bg-dark-lighter flex items-center justify-center">
                                <i className="fa fa-user text-primary"></i>
                            </div>
                            <span className="text-sm font-medium text-text-light hidden md:inline" id="userName">用户名</span>
                            <i className="fa fa-chevron-down text-xs text-gray-400"></i>
                        </button>
                        
                        <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg py-2 z-50 hidden" id="userMenu">
                            <a href="profile.html" data-page-link="profile.html" className="block px-4 py-2 text-sm text-text-light hover:bg-dark-lighter rounded-md">
                                <i className="fa fa-user-o mr-2"></i>个人中心
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-text-light hover:bg-dark-lighter rounded-md">
                                <i className="fa fa-cog mr-2"></i>设置
                            </a>
                            <div className="border-t border-dark-lighter my-1"></div>
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-dark-lighter rounded-md" data-legacy-click="logout()">
                                <i className="fa fa-sign-out mr-2"></i>退出登录
                            </a>
                        </div>
                    </div>
                    
                    <button className="md:hidden text-gray-400 hover:text-primary" id="mobileMenuBtn">
                        <i className="fa fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        
        <div className="md:hidden glass shadow-md hidden" id="mobileMenu">
            <div className="container mx-auto px-4 py-2 space-y-1">
                <a href="index.html" data-page-link="index.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
                    <i className="fa fa-home mr-2"></i>首页
                </a>
                <a href="dashboard.html" data-page-link="dashboard.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
                    <i className="fa fa-dashboard mr-2"></i>数据大屏
                </a>
                <a href="sandbox.html" data-page-link="sandbox.html" className="block px-4 py-3 text-white rounded-md" style={{ "background": "linear-gradient(135deg,#06b6d4 0%,#10b981 100%)" }}>
                    <i className="fa fa-globe mr-2"></i>流域时空推演沙盘
                </a>
                <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
                    <i className="fa fa-project-diagram mr-2"></i>知识图谱
                </a>
                <a href="chat.html" data-page-link="chat.html" className="block px-4 py-3 text-text-light hover:bg-dark-lighter rounded-md">
                    <i className="fa fa-question-circle mr-2"></i>智能问答
                </a>
            </div>
        </div>
    </header>

    
    <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
            
            <div className="lg:w-3/4">
                <div className="glass rounded-xl card-shadow h-[80vh] flex flex-col animate-fade-in">
                    
                    <div className="border-b border-dark-lighter p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-eco flex items-center justify-center animate-float">
                                <i className="fa fa-robot text-white text-xl"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">流域智能问答助手</h2>
                            </div>
                        </div>
                    </div>
                    
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chatMessages">
                        
                        <div className="chat-message bot-message">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
                                    <i className="fa fa-robot text-white"></i>
                                </div>
                                <div>
                                    <p className="text-sm">您好！我是流域智能问答助手，为您解答页面使用、指标含义和流域治理相关问题。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    
                    <div className="border-t border-dark-lighter p-4">
                        <form id="chatForm" className="flex space-x-2">
                            <input type="text" id="messageInput" className="flex-1 glass-light border border-dark-lighter rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-text-light input-glow" placeholder="请输入您的问题..." required />
                            <button type="submit" className="bg-gradient-eco text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity animate-glow">
                                <i className="fa fa-paper-plane"></i>
                            </button>
                        </form>
                        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                            <button className="text-primary hover:underline" id="clearChatBtn">清空聊天</button>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div className="lg:w-1/4 space-y-6">
                
                <div className="glass rounded-xl card-shadow p-4 animate-slide-up">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <i className="fa fa-fire text-primary mr-2"></i>
                        热门问题
                    </h3>
                    <ul className="space-y-2">
                        <li>
                            <button className="w-full text-left text-gray-300 hover:text-primary transition-colors text-sm py-2 px-3 rounded-md hover:bg-dark-lighter hot-question">
                                什么是COD？
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left text-gray-300 hover:text-primary transition-colors text-sm py-2 px-3 rounded-md hover:bg-dark-lighter hot-question">
                                数据大屏怎么看六省市对比？
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left text-gray-300 hover:text-primary transition-colors text-sm py-2 px-3 rounded-md hover:bg-dark-lighter hot-question">
                                如何在流域时空推演沙盘中查看AI决策？
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left text-gray-300 hover:text-primary transition-colors text-sm py-2 px-3 rounded-md hover:bg-dark-lighter hot-question">
                                如何从沙盘跳转到知识图谱溯源？
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left text-gray-300 hover:text-primary transition-colors text-sm py-2 px-3 rounded-md hover:bg-dark-lighter hot-question">
                                知识图谱里如何查询超标事件？
                            </button>
                        </li>
                    </ul>
                </div>
                
                
                <div className="glass rounded-xl card-shadow p-4 animate-slide-up" style={{ "animationDelay": "0.2s" }}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <i className="fa fa-history text-primary mr-2"></i>
                        历史记录
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto" id="historyList">
                        <div className="text-sm text-gray-500 italic">暂无历史记录</div>
                    </div>
                </div>
                
                
                <div className="glass rounded-xl card-shadow p-4 animate-slide-up" style={{ "animationDelay": "0.4s" }}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <i className="fa fa-lightbulb-o text-primary mr-2"></i>
                        功能提示
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start space-x-2 p-2 rounded-md hover:bg-dark-lighter transition-colors">
                            <i className="fa fa-check-circle mt-0.5 text-primary"></i>
                            <span>支持自然语言提问和页面使用咨询</span>
                        </li>
                        <li className="flex items-start space-x-2 p-2 rounded-md hover:bg-dark-lighter transition-colors">
                            <i className="fa fa-check-circle mt-0.5 text-primary"></i>
                            <span>支持本地知识库</span>
                        </li>
                        <li className="flex items-start space-x-2 p-2 rounded-md hover:bg-dark-lighter transition-colors">
                            <i className="fa fa-check-circle mt-0.5 text-primary"></i>
                            <span>接入deepseek大模型</span>
                        </li>
                        <li className="flex items-start space-x-2 p-2 rounded-md hover:bg-dark-lighter transition-colors">
                            <i className="fa fa-check-circle mt-0.5 text-primary"></i>
                            <span>支持数据大屏、沙盘、图谱和指标问答</span>
                        </li>
                        <li className="flex items-start space-x-2 p-2 rounded-md hover:bg-dark-lighter transition-colors">
                            <i className="fa fa-check-circle mt-0.5 text-primary"></i>
                            <span>记录历史问答，方便回顾</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </main>

    
    <footer className="glass py-12 mt-12 relative z-10">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">关于我们</h3>
                    <p className="text-gray-400 text-sm">
                        海河六域平台整合数据大屏、流域时空推演沙盘、知识图谱与智能问答，支持流域水环境分析与治理决策。
                    </p>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">快速链接</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="index.html" data-page-link="index.html" className="hover:text-primary transition-colors">首页</a></li>
                        <li><a href="dashboard.html" data-page-link="dashboard.html" className="hover:text-primary transition-colors">数据大屏</a></li>
                        <li><a href="sandbox.html" data-page-link="sandbox.html" className="hover:text-primary transition-colors">流域时空推演沙盘</a></li>
                        <li><a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="hover:text-primary transition-colors">知识图谱</a></li>
                        <li><a href="chat.html" data-page-link="chat.html" className="hover:text-primary transition-colors">智能问答</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">关注我们</h3>
                    <div className="flex space-x-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-dark-lighter flex items-center justify-center hover:bg-primary transition-colors">
                            <i className="fa fa-weixin"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-dark-lighter flex items-center justify-center hover:bg-primary transition-colors">
                            <i className="fa fa-weibo"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-dark-lighter flex items-center justify-center hover:bg-primary transition-colors">
                            <i className="fa fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-dark-lighter mt-8 pt-8 text-center text-sm text-gray-400">
                <p>© 2026 海河六域平台 版权所有</p>
            </div>
        </div>
    </footer>
    </>
  );
}

function CorrelationAnalysisPage() {
  return (
    <>
      <style>{"* {\r\n            margin: 0;\r\n            padding: 0;\r\n            box-sizing: border-box;\r\n        }\r\n        \r\n        html, body {\r\n            width: 100%;\r\n            min-height: 100%;\r\n            overflow-x: hidden;\r\n            overflow-y: auto;\r\n            font-family: 'Microsoft YaHei', sans-serif;\r\n            background: linear-gradient(135deg, #0a0f1c 0%, #0d1321 50%, #0a0f1c 100%);\r\n            color: #fff;\r\n        }\r\n        \r\n        /* 自定义滚动条 */\r\n        ::-webkit-scrollbar {\r\n            width: 8px;\r\n            height: 8px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-track {\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border-radius: 4px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-thumb {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.5), rgba(34, 197, 94, 0.5));\r\n            border-radius: 4px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-thumb:hover {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.7), rgba(34, 197, 94, 0.7));\r\n        }\r\n        \r\n        /* 科技感背景网格 */\r\n        .bg-grid {\r\n            position: fixed;\r\n            top: 0;\r\n            left: 0;\r\n            width: 100%;\r\n            height: 100%;\r\n            background-image: \r\n                linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),\r\n                linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);\r\n            background-size: 50px 50px;\r\n            pointer-events: none;\r\n            z-index: 0;\r\n        }\r\n        \r\n        /* 发光装饰 */\r\n        .glow-orb {\r\n            position: fixed;\r\n            border-radius: 50%;\r\n            filter: blur(100px);\r\n            pointer-events: none;\r\n            z-index: 0;\r\n        }\r\n        \r\n        .glow-orb-1 {\r\n            top: -10%;\r\n            left: -10%;\r\n            width: 400px;\r\n            height: 400px;\r\n            background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);\r\n        }\r\n        \r\n        .glow-orb-2 {\r\n            bottom: -10%;\r\n            right: -10%;\r\n            width: 500px;\r\n            height: 500px;\r\n            background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);\r\n        }\r\n        \r\n        /* 顶部导航 */\r\n        .top-nav {\r\n            position: fixed;\r\n            top: 0;\r\n            left: 0;\r\n            right: 0;\r\n            height: 64px;\r\n            background: rgba(15, 23, 42, 0.95);\r\n            backdrop-filter: blur(10px);\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n            z-index: 100;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            padding: 0 30px;\r\n        }\r\n        \r\n        .nav-title {\r\n            font-size: 22px;\r\n            font-weight: bold;\r\n            background: linear-gradient(90deg, #0ea5e9, #22c55e);\r\n            -webkit-background-clip: text;\r\n            -webkit-text-fill-color: transparent;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 12px;\r\n        }\r\n        \r\n        .nav-back {\r\n            padding: 8px 20px;\r\n            background: rgba(14, 165, 233, 0.15);\r\n            border: 1px solid rgba(14, 165, 233, 0.4);\r\n            border-radius: 6px;\r\n            color: #0ea5e9;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n            font-size: 14px;\r\n        }\r\n        \r\n        .nav-back:hover {\r\n            background: rgba(14, 165, 233, 0.3);\r\n            transform: translateY(-1px);\r\n        }\r\n        \r\n        /* 主容器 */\r\n        .main-container {\r\n            position: relative;\r\n            top: 64px;\r\n            left: 0;\r\n            right: 0;\r\n            min-height: calc(100vh - 64px);\r\n            padding: 20px;\r\n            z-index: 1;\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 20px;\r\n            padding-bottom: 40px;\r\n        }\r\n        \r\n        /* 核心结论栏 */\r\n        .conclusion-bar {\r\n            display: flex;\r\n            gap: 20px;\r\n            padding: 15px 20px;\r\n            background: linear-gradient(90deg, \r\n                rgba(14, 165, 233, 0.1) 0%, \r\n                rgba(34, 197, 94, 0.05) 50%,\r\n                rgba(14, 165, 233, 0.1) 100%);\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n            border-radius: 12px;\r\n            position: relative;\r\n            overflow: hidden;\r\n        }\r\n        \r\n        .conclusion-bar::before {\r\n            content: '';\r\n            position: absolute;\r\n            top: 0;\r\n            left: 0;\r\n            right: 0;\r\n            height: 2px;\r\n            background: linear-gradient(90deg, \r\n                transparent 0%, \r\n                #0ea5e9 20%, \r\n                #22c55e 50%, \r\n                #0ea5e9 80%, \r\n                transparent 100%);\r\n        }\r\n        \r\n        .conclusion-tag {\r\n            flex: 1;\r\n            padding: 15px 20px;\r\n            background: rgba(15, 23, 42, 0.6);\r\n            border-radius: 10px;\r\n            border: 1px solid;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 15px;\r\n            transition: all 0.3s;\r\n        }\r\n        \r\n        .conclusion-tag:hover {\r\n            transform: translateY(-2px);\r\n            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);\r\n        }\r\n        \r\n        .conclusion-tag.tag-1 {\r\n            border-color: rgba(239, 68, 68, 0.4);\r\n            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .conclusion-tag.tag-2 {\r\n            border-color: rgba(245, 158, 11, 0.4);\r\n            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .conclusion-tag.tag-3 {\r\n            border-color: rgba(14, 165, 233, 0.4);\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .tag-icon {\r\n            width: 50px;\r\n            height: 50px;\r\n            border-radius: 12px;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            font-size: 24px;\r\n        }\r\n        \r\n        .tag-1 .tag-icon {\r\n            background: rgba(239, 68, 68, 0.2);\r\n            color: #ef4444;\r\n        }\r\n        \r\n        .tag-2 .tag-icon {\r\n            background: rgba(245, 158, 11, 0.2);\r\n            color: #f59e0b;\r\n        }\r\n        \r\n        .tag-3 .tag-icon {\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        .tag-content {\r\n            flex: 1;\r\n        }\r\n        \r\n        .tag-title {\r\n            font-size: 13px;\r\n            color: #94a3b8;\r\n            margin-bottom: 4px;\r\n        }\r\n        \r\n        .tag-value {\r\n            font-size: 14px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            line-height: 1.5;\r\n        }\r\n        \r\n        .tag-highlight {\r\n            color: #22c55e;\r\n            font-weight: bold;\r\n        }\r\n        \r\n        .corr-value {\r\n            font-size: 20px;\r\n            font-weight: bold;\r\n        }\r\n        \r\n        .corr-value.strong-negative {\r\n            color: #3b82f6;\r\n        }\r\n        \r\n        .corr-value.strong-positive {\r\n            color: #ef4444;\r\n        }\r\n        \r\n        .corr-value.medium {\r\n            color: #f59e0b;\r\n        }\r\n        \r\n        /* 主体内容区 */\r\n        .content-area {\r\n            display: grid;\r\n            grid-template-columns: 1fr 380px;\r\n            gap: 20px;\r\n            min-height: 700px;\r\n        }\r\n        \r\n        /* 图表卡片 */\r\n        .chart-card {\r\n            background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);\r\n            border: 1px solid rgba(14, 165, 233, 0.2);\r\n            border-radius: 12px;\r\n            padding: 20px;\r\n            position: relative;\r\n            overflow: hidden;\r\n            display: flex;\r\n            flex-direction: column;\r\n        }\r\n        \r\n        /* 科技感四角装饰 */\r\n        .chart-card::before,\r\n        .chart-card::after {\r\n            content: '';\r\n            position: absolute;\r\n            width: 20px;\r\n            height: 20px;\r\n            border: 2px solid #0ea5e9;\r\n        }\r\n        \r\n        .chart-card::before {\r\n            top: 0;\r\n            left: 0;\r\n            border-right: none;\r\n            border-bottom: none;\r\n            border-top-left-radius: 8px;\r\n        }\r\n        \r\n        .chart-card::after {\r\n            bottom: 0;\r\n            right: 0;\r\n            border-left: none;\r\n            border-top: none;\r\n            border-bottom-right-radius: 8px;\r\n        }\r\n        \r\n        .corner-decoration {\r\n            position: absolute;\r\n            width: 20px;\r\n            height: 20px;\r\n            border: 2px solid #0ea5e9;\r\n        }\r\n        \r\n        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-top-left-radius: 8px; }\r\n        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; border-top-right-radius: 8px; }\r\n        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; border-bottom-left-radius: 8px; }\r\n        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; border-bottom-right-radius: 8px; }\r\n        \r\n        /* 卡片标题 */\r\n        .card-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 15px;\r\n            padding-bottom: 10px;\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n            flex-shrink: 0;\r\n        }\r\n        \r\n        .card-title {\r\n            font-size: 16px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 10px;\r\n        }\r\n        \r\n        .card-title i {\r\n            color: #0ea5e9;\r\n            font-size: 18px;\r\n        }\r\n        \r\n        .card-subtitle {\r\n            font-size: 12px;\r\n            color: #64748b;\r\n        }\r\n        \r\n        /* 图表容器 */\r\n        .chart-container {\r\n            flex: 1;\r\n            min-height: 0;\r\n            position: relative;\r\n        }\r\n        \r\n        /* 详情面板 */\r\n        .detail-panel {\r\n            margin-top: 15px;\r\n            padding: 20px;\r\n            background: rgba(15, 23, 42, 0.6);\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n            border-radius: 10px;\r\n            display: none;\r\n        }\r\n        \r\n        .detail-panel.active {\r\n            display: block;\r\n        }\r\n        \r\n        .detail-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 15px;\r\n        }\r\n        \r\n        .detail-title {\r\n            font-size: 16px;\r\n            font-weight: bold;\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .detail-close {\r\n            width: 28px;\r\n            height: 28px;\r\n            border-radius: 50%;\r\n            background: rgba(239, 68, 68, 0.2);\r\n            border: 1px solid rgba(239, 68, 68, 0.4);\r\n            color: #ef4444;\r\n            cursor: pointer;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            transition: all 0.3s;\r\n        }\r\n        \r\n        .detail-close:hover {\r\n            background: rgba(239, 68, 68, 0.3);\r\n        }\r\n        \r\n        .detail-content {\r\n            display: grid;\r\n            grid-template-columns: 1fr 1fr;\r\n            gap: 20px;\r\n        }\r\n        \r\n        .scatter-container {\r\n            height: 280px;\r\n            background: rgba(14, 165, 233, 0.05);\r\n            border-radius: 8px;\r\n        }\r\n        \r\n        .interpretation {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 12px;\r\n        }\r\n        \r\n        .interp-item {\r\n            padding: 12px;\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border-radius: 8px;\r\n            border-left: 3px solid #0ea5e9;\r\n        }\r\n        \r\n        .interp-title {\r\n            font-size: 12px;\r\n            color: #94a3b8;\r\n            margin-bottom: 4px;\r\n        }\r\n        \r\n        .interp-text {\r\n            font-size: 13px;\r\n            color: #e2e8f0;\r\n            line-height: 1.6;\r\n        }\r\n        \r\n        /* 右侧辅助分析区 */\r\n        .right-panel {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 15px;\r\n            height: fit-content;\r\n        }\r\n        \r\n        .right-panel .chart-card {\r\n            min-height: 200px;\r\n        }\r\n        \r\n        /* 分类标签 */\r\n        .category-tags {\r\n            display: flex;\r\n            flex-wrap: wrap;\r\n            gap: 8px;\r\n            padding: 10px 0;\r\n        }\r\n        \r\n        .category-tag {\r\n            padding: 6px 14px;\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n            border-radius: 20px;\r\n            color: #94a3b8;\r\n            font-size: 12px;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n        }\r\n        \r\n        .category-tag:hover {\r\n            background: rgba(14, 165, 233, 0.25);\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .category-tag.active {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(34, 197, 94, 0.3));\r\n            color: #fff;\r\n            border-color: #0ea5e9;\r\n        }\r\n        \r\n        /* 特征推荐列表 */\r\n        .feature-list {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 10px;\r\n        }\r\n        \r\n        .feature-item {\r\n            padding: 12px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 8px;\r\n            border-left: 3px solid;\r\n        }\r\n        \r\n        .feature-item.core {\r\n            border-left-color: #22c55e;\r\n        }\r\n        \r\n        .feature-item.pollution {\r\n            border-left-color: #f59e0b;\r\n        }\r\n        \r\n        .feature-item.auxiliary {\r\n            border-left-color: #0ea5e9;\r\n        }\r\n        \r\n        .feature-title {\r\n            font-size: 13px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            margin-bottom: 4px;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 6px;\r\n        }\r\n        \r\n        .feature-title i {\r\n            font-size: 11px;\r\n        }\r\n        \r\n        .feature-desc {\r\n            font-size: 11px;\r\n            color: #94a3b8;\r\n        }\r\n        \r\n        .feature-tags {\r\n            display: flex;\r\n            flex-wrap: wrap;\r\n            gap: 5px;\r\n            margin-top: 8px;\r\n        }\r\n        \r\n        .feature-tag {\r\n            padding: 2px 8px;\r\n            border-radius: 4px;\r\n            font-size: 10px;\r\n        }\r\n        \r\n        .tag-core {\r\n            background: rgba(34, 197, 94, 0.2);\r\n            color: #22c55e;\r\n        }\r\n        \r\n        .tag-pollution {\r\n            background: rgba(245, 158, 11, 0.2);\r\n            color: #f59e0b;\r\n        }\r\n        \r\n        .tag-auxiliary {\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        /* 冗余特征提示 */\r\n        .redundant-alert {\r\n            padding: 12px;\r\n            background: rgba(239, 68, 68, 0.1);\r\n            border: 1px solid rgba(239, 68, 68, 0.3);\r\n            border-radius: 8px;\r\n            margin-top: 10px;\r\n        }\r\n        \r\n        .redundant-title {\r\n            font-size: 12px;\r\n            font-weight: 600;\r\n            color: #ef4444;\r\n            margin-bottom: 8px;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 6px;\r\n        }\r\n        \r\n        .redundant-item {\r\n            font-size: 11px;\r\n            color: #94a3b8;\r\n            margin-bottom: 6px;\r\n            padding-left: 16px;\r\n            position: relative;\r\n        }\r\n        \r\n        .redundant-item::before {\r\n            content: '•';\r\n            position: absolute;\r\n            left: 6px;\r\n            color: #ef4444;\r\n        }\r\n        \r\n        /* 污染管控清单 */\r\n        .control-list {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 12px;\r\n        }\r\n        \r\n        .control-item {\r\n            padding: 12px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 8px;\r\n            border: 1px solid rgba(14, 165, 233, 0.2);\r\n        }\r\n        \r\n        .control-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 8px;\r\n        }\r\n        \r\n        .control-type {\r\n            font-size: 13px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .control-corr {\r\n            font-size: 12px;\r\n            padding: 2px 8px;\r\n            border-radius: 10px;\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        .control-indicators {\r\n            font-size: 11px;\r\n            color: #64748b;\r\n            margin-bottom: 8px;\r\n        }\r\n        \r\n        .control-suggestion {\r\n            font-size: 12px;\r\n            color: #94a3b8;\r\n            line-height: 1.5;\r\n            padding: 8px;\r\n            background: rgba(14, 165, 233, 0.05);\r\n            border-radius: 6px;\r\n        }\r\n        \r\n        /* 响应式 */\r\n        @media (max-width: 1400px) {\r\n            .content-area {\r\n                grid-template-columns: 1fr;\r\n            }\r\n            .right-panel {\r\n                flex-direction: row;\r\n                flex-wrap: wrap;\r\n            }\r\n            .right-panel .chart-card {\r\n                flex: 1;\r\n                min-width: 300px;\r\n            }\r\n            .detail-content {\r\n                grid-template-columns: 1fr;\r\n            }\r\n        }\r\n        \r\n        /* 动画 */\r\n        @keyframes fadeIn {\r\n            from { opacity: 0; transform: translateY(10px); }\r\n            to { opacity: 1; transform: translateY(0); }\r\n        }\r\n        \r\n        .animate-fade-in {\r\n            animation: fadeIn 0.5s ease-out;\r\n        }\r\n        \r\n        /* 相关系数提示 */\r\n        .corr-legend {\r\n            display: flex;\r\n            gap: 20px;\r\n            align-items: center;\r\n            padding: 8px 15px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 20px;\r\n            font-size: 11px;\r\n        }\r\n        \r\n        .legend-item {\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 6px;\r\n        }\r\n        \r\n        .legend-color {\r\n            width: 20px;\r\n            height: 12px;\r\n            border-radius: 2px;\r\n        }"}</style>
<div className="bg-grid"></div>
    <div className="glow-orb glow-orb-1"></div>
    <div className="glow-orb glow-orb-2"></div>
    
    
    <nav className="top-nav">
        <div className="nav-title">
            <i className="fa fa-th"></i>
            指标相关性分析专项屏
        </div>
        <div style={{ "display": "flex", "alignItems": "center", "gap": "20px" }}>
            <div style={{ "color": "#94a3b8", "fontSize": "13px" }}>
                <i className="fa fa-clock-o mr-2"></i>
                <span id="currentTime">--</span>
            </div>
            <button className="nav-back" data-legacy-click="goBack()">
                <i className="fa fa-arrow-left"></i>
                返回大屏
            </button>
        </div>
    </nav>
    
    
    <div className="main-container">
        
        <div className="conclusion-bar animate-fade-in">
            <div className="conclusion-tag tag-1">
                <div className="tag-icon">
                    <i className="fa fa-thermometer-half"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">水温 - 溶解氧</div>
                    <div className="tag-value">
                        <span className="corr-value strong-negative">-0.58</span> 强负相关<br/>
                        <span className="tag-highlight">完全符合水文规律</span>，数据质量可靠
                    </div>
                </div>
            </div>
            <div className="conclusion-tag tag-2">
                <div className="tag-icon">
                    <i className="fa fa-bolt"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">电导率 - 高锰酸盐指数</div>
                    <div className="tag-value">
                        <span className="corr-value strong-positive">0.56</span> 强正相关<br/>
                        有机污染与离子污染<span className="tag-highlight">高度同源</span>
                    </div>
                </div>
            </div>
            <div className="conclusion-tag tag-3">
                <div className="tag-icon">
                    <i className="fa fa-flask"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">氨氮 - 总磷</div>
                    <div className="tag-value">
                        <span className="corr-value medium">0.39</span> 中等正相关<br/>
                        氮磷污染需<span className="tag-highlight">协同管控</span>
                    </div>
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
                    <div className="card-title">
                        <i className="fa fa-th"></i>
                        全指标相关性热力图
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "15px" }}>
                        <div className="corr-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "linear-gradient(90deg, #3b82f6, #fff)" }}></div>
                                <span style={{ "color": "#3b82f6" }}>负相关</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "linear-gradient(90deg, #fff, #ef4444)" }}></div>
                                <span style={{ "color": "#ef4444" }}>正相关</span>
                            </div>
                            <div className="legend-item">
                                <i className="fa fa-square-o" style={{ "color": "#f59e0b" }}></i>
                                <span style={{ "color": "#f59e0b" }}>强相关(|r|&gt;0.5)</span>
                            </div>
                        </div>
                        <div className="card-subtitle">点击单元格查看详情</div>
                    </div>
                </div>
                <div className="chart-container" id="heatmapChart"></div>
                
                
                <div className="detail-panel" id="detailPanel">
                    <div className="detail-header">
                        <div className="detail-title" id="detailTitle">指标相关性详情</div>
                        <button className="detail-close" data-legacy-click="closeDetail()">
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                    <div className="detail-content">
                        <div className="scatter-container" id="scatterChart"></div>
                        <div className="interpretation">
                            <div className="interp-item">
                                <div className="interp-title"><i className="fa fa-line-chart" style={{ "color": "#0ea5e9", "marginRight": "5px" }}></i>相关性分析</div>
                                <div className="interp-text" id="corrAnalysis">--</div>
                            </div>
                            <div className="interp-item">
                                <div className="interp-title"><i className="fa fa-water" style={{ "color": "#22c55e", "marginRight": "5px" }}></i>水文/环境解读</div>
                                <div className="interp-text" id="envInterpretation">--</div>
                            </div>
                            <div className="interp-item">
                                <div className="interp-title"><i className="fa fa-lightbulb-o" style={{ "color": "#f59e0b", "marginRight": "5px" }}></i>应用建议</div>
                                <div className="interp-text" id="applicationAdvice">--</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div className="right-panel">
                
                <div className="chart-card">
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-tags"></i>
                            指标分类筛选
                        </div>
                    </div>
                    <div className="chart-container">
                        <div className="category-tags">
                            <button className="category-tag active" data-category="all" data-legacy-click="filterCategory('all')">
                                <i className="fa fa-th-large"></i> 全部
                            </button>
                            <button className="category-tag" data-category="physical" data-legacy-click="filterCategory('physical')">
                                <i className="fa fa-thermometer"></i> 物理生态类
                            </button>
                            <button className="category-tag" data-category="nutrient" data-legacy-click="filterCategory('nutrient')">
                                <i className="fa fa-flask"></i> 营养盐类
                            </button>
                            <button className="category-tag" data-category="pollution" data-legacy-click="filterCategory('pollution')">
                                <i className="fa fa-warning"></i> 污染类
                            </button>
                        </div>
                        <div style={{ "marginTop": "10px", "padding": "10px", "background": "rgba(14, 165, 233, 0.05)", "borderRadius": "8px", "fontSize": "11px", "color": "#64748b", "lineHeight": "1.6" }} id="categoryDesc">
                            显示全部9项指标的相关性分析
                        </div>
                    </div>
                </div>
                
                
                <div className="chart-card">
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-magic"></i>
                            LSTM模型特征建议
                        </div>
                    </div>
                    <div className="chart-container" id="featureContainer">
                        <div className="feature-list">
                            <div className="feature-item core">
                                <div className="feature-title">
                                    <i className="fa fa-star" style={{ "color": "#22c55e" }}></i>
                                    核心特征
                                </div>
                                <div className="feature-desc">与多指标相关，信息量大，必须保留</div>
                                <div className="feature-tags">
                                    <span className="feature-tag tag-core">水温</span>
                                    <span className="feature-tag tag-core">溶解氧</span>
                                    <span className="feature-tag tag-core">电导率</span>
                                </div>
                            </div>
                            <div className="feature-item pollution">
                                <div className="feature-title">
                                    <i className="fa fa-warning" style={{ "color": "#f59e0b" }}></i>
                                    污染特征
                                </div>
                                <div className="feature-desc">污染指标，反映水质状况</div>
                                <div className="feature-tags">
                                    <span className="feature-tag tag-pollution">氨氮</span>
                                    <span className="feature-tag tag-pollution">总磷</span>
                                    <span className="feature-tag tag-pollution">高锰酸盐指数</span>
                                </div>
                            </div>
                            <div className="feature-item auxiliary">
                                <div className="feature-title">
                                    <i className="fa fa-plus-circle" style={{ "color": "#0ea5e9" }}></i>
                                    辅助特征
                                </div>
                                <div className="feature-desc">辅助判断，可适当精简</div>
                                <div className="feature-tags">
                                    <span className="feature-tag tag-auxiliary">PH</span>
                                    <span className="feature-tag tag-auxiliary">浊度</span>
                                </div>
                            </div>
                        </div>
                        <div className="redundant-alert" id="redundantAlert">
                            <div className="redundant-title">
                                <i className="fa fa-exclamation-triangle"></i>
                                冗余特征建议剔除
                            </div>
                            <div id="redundantList">
                                
                            </div>
                        </div>
                    </div>
                </div>
                
                
                <div className="chart-card">
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-list-check"></i>
                            同源污染管控清单
                        </div>
                    </div>
                    <div className="chart-container" id="controlContainer">
                        <div className="control-list">
                            <div className="control-item">
                                <div className="control-header">
                                    <div className="control-type">有机污染同源</div>
                                    <div className="control-corr">r=0.56</div>
                                </div>
                                <div className="control-indicators">电导率 × 高锰酸盐指数</div>
                                <div className="control-suggestion">
                                    有机污染与离子污染同源，建议协同监测，重点关注工业废水排放
                                </div>
                            </div>
                            <div className="control-item">
                                <div className="control-header">
                                    <div className="control-type">营养盐污染同源</div>
                                    <div className="control-corr">r=0.55</div>
                                </div>
                                <div className="control-indicators">氨氮 × 总磷 × 总氮</div>
                                <div className="control-suggestion">
                                    氮磷污染高度相关，需协同管控，重点控制农业面源污染
                                </div>
                            </div>
                            <div className="control-item">
                                <div className="control-header">
                                    <div className="control-type">物理生态关联</div>
                                    <div className="control-corr">r=-0.58</div>
                                </div>
                                <div className="control-indicators">水温 × 溶解氧</div>
                                <div className="control-suggestion">
                                    水温-溶解氧负相关符合自然规律，重点关注夏季低氧时段
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}

function DashboardPage() {
  return (
    <>
      <style>{"/* ============================================================\r\n   海河六域 · 数据大屏科技暗调风格\r\n   ============================================================ */\r\n\r\n:root {\r\n    --bg-deep: #1a2435;\r\n    --bg-panel: rgba(24, 34, 52, 0.55);\r\n    --bg-panel-hover: rgba(32, 46, 70, 0.7);\r\n    --border-glow: rgba(14, 165, 233, 0.28);\r\n    --border-glow-strong: rgba(14, 165, 233, 0.55);\r\n    --text-primary: #f8fafc;\r\n    --text-secondary: #cbd5e1;\r\n    --text-muted: #94a3b8;\r\n    --cyan: #0ea5e9;\r\n    --cyan-light: #38bdf8;\r\n    --teal: #22c55e;\r\n    --amber: #f59e0b;\r\n    --rose: #f43f5e;\r\n    --radius: 14px;\r\n    --radius-lg: 18px;\r\n    --shadow: 0 8px 32px rgba(0, 0, 0, 0.18);\r\n}\r\n\r\n* {\r\n    box-sizing: border-box;\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n\r\nhtml, body {\n    width: 100%;\n    height: 100%;\n    min-height: 100%;\n    background: var(--bg-deep);\n    color: var(--text-primary);\n    font-family: \"Noto Sans SC\", \"Microsoft YaHei\", sans-serif;\n    overflow-x: hidden;\r\n    overflow-y: auto;\r\n}\r\n\r\n/* 粒子背景Canvas */\r\n#particleCanvas {\r\n    position: fixed;\r\n    inset: 0;\r\n    pointer-events: none;\r\n    z-index: 0;\r\n}\r\n\r\n/* 背景网格 */\r\nbody::before {\r\n    content: \"\";\r\n    position: fixed;\r\n    inset: 0;\r\n    pointer-events: none;\r\n    z-index: 0;\r\n    background-image:\r\n        linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),\r\n        linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px);\r\n    background-size: 50px 50px;\r\n    mask-image: linear-gradient(180deg, rgba(0,0,0,0.5), transparent 92%);\r\n}\r\n\r\n/* 扫描光效 */\r\nbody::after {\r\n    content: \"\";\r\n    position: fixed;\r\n    top: 0;\r\n    left: -100%;\r\n    width: 60%;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, transparent, rgba(14,165,233,0.4), transparent);\r\n    animation: scanLight 10s linear infinite;\r\n    z-index: 0;\r\n    pointer-events: none;\r\n}\r\n\r\n@keyframes scanLight {\r\n    0% { left: -60%; }\r\n    100% { left: 120%; }\r\n}\r\n\r\n/* ---------- 导航栏兼容样式 ---------- */\r\n.bg-gradient-water {\r\n    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n}\r\n\r\n.nav-link {\r\n    position: relative;\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 0.5rem 1rem;\r\n    color: #d1d5db;\r\n    text-decoration: none;\r\n    transition: all 0.3s;\r\n    border-radius: 0.375rem;\r\n}\r\n.nav-link:hover {\r\n    color: #fff;\r\n    background: rgba(255,255,255,0.05);\r\n}\r\n.nav-link.active {\r\n    color: #fff;\r\n    font-weight: 500;\r\n}\r\n.nav-link::after {\r\n    content: '';\r\n    position: absolute;\r\n    bottom: 0;\r\n    left: 50%;\r\n    width: 0;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, #0ea5e9, #22c55e);\r\n    transition: all 0.3s;\r\n    transform: translateX(-50%);\r\n}\r\n.nav-link:hover::after,\r\n.nav-link.active::after {\r\n    width: 80%;\r\n}\r\n\r\n.nav-core {\r\n    position: relative;\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 0.5rem 1.25rem;\r\n    border-radius: 9999px;\r\n    color: #fff;\r\n    font-weight: 600;\r\n    font-size: 0.875rem;\r\n    text-decoration: none;\r\n    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n    box-shadow: 0 0 12px rgba(14,165,233,0.4);\r\n    transition: all 0.3s;\r\n}\r\n.nav-core:hover {\n    box-shadow: 0 0 20px rgba(14,165,233,0.7);\n    transform: translateY(-1px);\n}\n\n.dashboard-topbar,\n.dashboard-mobile-nav {\n    width: 100%;\n    max-width: none;\n}\n\n/* ---------- 大屏容器 ---------- */\n.dashboard-shell {\n    position: relative;\n    z-index: 1;\n    width: 100%;\n    min-width: 0;\n    padding: 84px 24px 20px;\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n    min-height: 100vh;\n}\n\r\n/* ---------- 顶部标题栏 ---------- */\r\n.dash-header {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 20px;\r\n    padding: 14px 20px;\r\n    background: linear-gradient(135deg, rgba(15,23,42,0.85), rgba(20,30,50,0.75));\r\n    border: 1px solid var(--border-glow);\r\n    border-radius: var(--radius-lg);\r\n    box-shadow: var(--shadow), 0 0 40px rgba(14,165,233,0.06);\r\n    backdrop-filter: blur(12px);\r\n    position: relative;\r\n    overflow: hidden;\r\n}\r\n\r\n.dash-header::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    width: 4px;\r\n    height: 100%;\r\n    background: linear-gradient(180deg, var(--cyan), var(--teal));\r\n}\r\n\r\n.dash-header::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: -50%;\r\n    right: -10%;\r\n    width: 300px;\r\n    height: 300px;\r\n    background: radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%);\r\n    pointer-events: none;\r\n}\r\n\r\n.dash-header-left {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 12px;\r\n}\r\n\r\n.dash-title-group h1 {\r\n    font-family: \"Rajdhani\", \"Noto Sans SC\", sans-serif;\r\n    font-size: clamp(22px, 2vw, 34px);\r\n    font-weight: 700;\r\n    letter-spacing: 0.04em;\r\n    color: #fff;\r\n    line-height: 1.2;\r\n    margin: 0;\r\n}\r\n\r\n.scope-badge {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    gap: 10px;\r\n    padding: 10px 22px;\r\n    border-radius: 999px;\r\n    background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(6, 182, 212, 0.1));\r\n    border: 1px solid rgba(14, 165, 233, 0.35);\r\n    color: #e0f2fe;\r\n    font-size: 18px;\r\n    font-weight: 700;\r\n    letter-spacing: 0.04em;\r\n    width: fit-content;\r\n    box-shadow: 0 0 20px rgba(14, 165, 233, 0.12), inset 0 1px 0 rgba(255,255,255,0.08);\r\n    text-shadow: 0 0 10px rgba(14, 165, 233, 0.3);\r\n}\r\n\r\n.dash-meta-row {\r\n    display: flex;\r\n    gap: 12px;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.meta-pill {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    gap: 6px;\r\n    padding: 4px 12px;\r\n    border-radius: 999px;\r\n    background: rgba(255,255,255,0.04);\r\n    border: 1px solid rgba(255,255,255,0.06);\r\n    font-size: 12px;\r\n    color: var(--text-secondary);\r\n}\r\n.meta-pill strong {\r\n    color: var(--text-primary);\r\n    font-weight: 600;\r\n}\r\n\r\n.dash-header-right {\r\n    display: flex;\r\n    flex-direction: column;\r\n    align-items: flex-end;\r\n    gap: 10px;\r\n}\r\n\r\n.kpi-cards {\r\n    display: flex;\r\n    gap: 10px;\r\n}\r\n\r\n.kpi-card {\r\n    min-width: 84px;\r\n    padding: 10px 12px;\r\n    background: linear-gradient(180deg, rgba(14,165,233,0.1), rgba(20,30,50,0.5));\r\n    border: 1px solid rgba(14,165,233,0.15);\r\n    border-radius: var(--radius);\r\n    text-align: center;\r\n    transition: all 0.3s ease;\r\n    position: relative;\r\n    overflow: hidden;\r\n}\r\n.kpi-card::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, transparent, var(--cyan), transparent);\r\n    opacity: 0.6;\r\n}\r\n.kpi-card:hover {\r\n    transform: translateY(-2px);\r\n    box-shadow: 0 8px 20px rgba(14,165,233,0.18);\r\n    border-color: rgba(14,165,233,0.35);\r\n}\r\n.kpi-card.alert {\r\n    background: linear-gradient(180deg, rgba(244,63,94,0.1), rgba(20,30,50,0.5));\r\n    border-color: rgba(244,63,94,0.22);\r\n}\r\n.kpi-card.alert::before {\r\n    background: linear-gradient(90deg, transparent, var(--rose), transparent);\r\n}\r\n.kpi-card.alert:hover {\r\n    box-shadow: 0 8px 20px rgba(244,63,94,0.18);\r\n    border-color: rgba(244,63,94,0.4);\r\n}\r\n\r\n.kpi-label {\r\n    font-size: 10px;\r\n    color: var(--text-muted);\r\n    margin-bottom: 4px;\r\n    letter-spacing: 0.03em;\r\n}\r\n\r\n.kpi-value {\r\n    font-family: \"Rajdhani\", \"Noto Sans SC\", sans-serif;\r\n    font-size: 22px;\r\n    font-weight: 700;\r\n    color: #fff;\r\n    line-height: 1;\r\n    margin-bottom: 4px;\r\n}\r\n\r\n.kpi-bar {\r\n    height: 2px;\r\n    background: rgba(255,255,255,0.06);\r\n    border-radius: 2px;\r\n    overflow: hidden;\r\n}\r\n.kpi-bar span {\r\n    display: block;\r\n    height: 100%;\r\n    background: linear-gradient(90deg, var(--cyan), var(--teal));\r\n    border-radius: 2px;\r\n    transition: width 0.6s ease;\r\n}\r\n.kpi-card.alert .kpi-bar span {\r\n    background: linear-gradient(90deg, var(--rose), var(--amber));\r\n}\r\n\r\n.kpi-level-dot {\r\n    width: 6px;\r\n    height: 6px;\r\n    border-radius: 50%;\r\n    margin: 0 auto;\r\n    background: var(--teal);\r\n    box-shadow: 0 0 6px var(--teal);\r\n}\r\n\r\n.kpi-sublabel {\r\n    font-size: 9px;\r\n    color: var(--text-muted);\r\n    margin-top: 2px;\r\n}\r\n\r\n.dash-time {\r\n    font-family: \"Rajdhani\", monospace;\r\n    font-size: 14px;\r\n    color: var(--cyan-light);\r\n    letter-spacing: 0.08em;\r\n    background: rgba(14,165,233,0.08);\r\n    padding: 4px 12px;\r\n    border-radius: 6px;\r\n    border: 1px solid rgba(14,165,233,0.12);\r\n}\r\n\r\n/* ---------- 主体网格 ---------- */\r\n.dash-body {\n    display: grid;\n    grid-template-columns: minmax(220px, 15.5vw) minmax(0, 1fr) minmax(240px, 17vw);\n    gap: 24px;\n    flex: 1;\n    min-height: calc(100vh - 196px);\n    align-items: stretch;\n}\n\r\n/* ---------- 侧边栏 ---------- */\r\n.dash-side {\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n    min-height: 0;\n}\n\r\n.side-panel {\r\n    background: var(--bg-panel);\r\n    border: 1px solid var(--border-glow);\r\n    border-radius: var(--radius-lg);\r\n    padding: 18px;\r\n    backdrop-filter: blur(10px);\r\n    box-shadow: var(--shadow);\r\n    position: relative;\r\n    overflow: hidden;\r\n    transition: all 0.35s ease;\r\n}\r\n.side-panel:hover {\r\n    border-color: var(--border-glow-strong);\r\n    box-shadow: var(--shadow), 0 0 30px rgba(14,165,233,0.1);\r\n    transform: translateY(-2px);\r\n}\r\n.side-panel::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: 18px;\r\n    width: 100px;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, var(--cyan), var(--teal), transparent);\r\n}\r\n\r\n/* 图表容器 */\r\n.chart-side {\r\n    width: 100%;\r\n    height: 220px;\r\n    border-radius: var(--radius);\r\n    overflow: visible;\r\n}\r\n\r\n/* echarts tooltip 不被遮挡 */\r\n.chart-map > div,\r\n.chart-side > div,\r\n.chart-mini > div,\r\n.chart-trend > div {\r\n    overflow: visible !important;\r\n}\r\n\r\n.side-head {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 8px;\r\n    margin-bottom: 14px;\r\n    font-size: 14px;\r\n    font-weight: 600;\r\n    color: var(--text-primary);\r\n}\r\n.side-head i {\r\n    color: var(--cyan);\r\n    font-size: 14px;\r\n}\r\n\r\n/* ---------- 省份按钮 ---------- */\r\n.province-pills {\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    gap: 8px;\r\n}\r\n\r\n.province-btn {\r\n    padding: 7px 14px;\r\n    border: 1px solid rgba(14,165,233,0.15);\r\n    background: rgba(7,18,30,0.7);\r\n    color: var(--text-secondary);\r\n    cursor: pointer;\r\n    transition: all 0.2s;\r\n    font-size: 12px;\r\n    font-weight: 600;\r\n    border-radius: 999px;\r\n    font-family: inherit;\r\n}\r\n.province-btn:hover {\r\n    color: #fff;\r\n    border-color: rgba(14,165,233,0.4);\r\n    background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(34,197,94,0.1));\r\n}\r\n.province-btn.active {\r\n    color: #fff;\r\n    border-color: rgba(14,165,233,0.5);\r\n    background: linear-gradient(135deg, rgba(14,165,233,0.35), rgba(34,197,94,0.2));\r\n    box-shadow: 0 0 12px rgba(14,165,233,0.2);\r\n}\r\n\r\n/* ---------- 排行列表 ---------- */\r\n.ranking-list {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 8px;\r\n}\r\n\r\n.ranking-item {\r\n    display: grid;\r\n    grid-template-columns: 26px 1fr;\r\n    gap: 10px;\r\n    padding: 10px 12px;\r\n    background: rgba(10,22,38,0.5);\r\n    border: 1px solid rgba(14,165,233,0.08);\r\n    border-radius: 10px;\r\n    cursor: pointer;\r\n    transition: all 0.2s;\r\n}\r\n.ranking-item:hover {\r\n    transform: translateX(3px);\r\n    border-color: rgba(14,165,233,0.2);\r\n    background: rgba(14,165,233,0.08);\r\n}\r\n.ranking-item.selected {\r\n    border-color: rgba(14,165,233,0.35);\r\n    background: rgba(14,165,233,0.12);\r\n}\r\n\r\n.rank-no {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    font-family: \"Rajdhani\", sans-serif;\r\n    font-size: 16px;\r\n    font-weight: 700;\r\n    color: var(--cyan);\r\n}\r\n\r\n.rank-topline {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    align-items: center;\r\n    margin-bottom: 4px;\r\n    font-size: 13px;\r\n}\r\n.rank-topline strong {\r\n    font-family: \"Rajdhani\", sans-serif;\r\n    font-size: 18px;\r\n    color: #fff;\r\n}\r\n\r\n.rank-subline {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    font-size: 11px;\r\n    color: var(--text-muted);\r\n}\r\n\r\n.rank-bar {\r\n    margin-top: 6px;\r\n    height: 4px;\r\n    background: rgba(255,255,255,0.05);\r\n    border-radius: 2px;\r\n    overflow: hidden;\r\n}\r\n.rank-bar span {\r\n    display: block;\r\n    height: 100%;\r\n    background: linear-gradient(90deg, var(--cyan), var(--teal));\r\n    border-radius: 2px;\r\n}\r\n\r\n/* ---------- 中心地图 ---------- */\r\n.dash-center {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 18px;\r\n    height: 100%;\r\n    min-height: 0;\r\n}\r\n\r\n.map-panel {\n    background: var(--bg-panel);\r\n    border: 1px solid var(--border-glow);\r\n    border-radius: var(--radius-lg);\r\n    padding: 14px 16px;\r\n    backdrop-filter: blur(10px);\r\n    box-shadow: var(--shadow), 0 0 60px rgba(14,165,233,0.08);\r\n    display: flex;\r\n    flex-direction: column;\r\n    flex: 1 1 auto;\n    min-height: 0;\n    position: relative;\n    overflow: hidden;\n}\n.map-panel::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    inset: 0;\r\n    border: 1px solid rgba(14,165,233,0.06);\r\n    pointer-events: none;\r\n    border-radius: inherit;\r\n}\r\n.map-panel::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: 20px;\r\n    width: 180px;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, var(--cyan), var(--teal), var(--cyan-light), transparent);\r\n}\r\n\r\n/* 地图四角科技装饰 */\r\n.map-panel .corner-deco {\r\n    position: absolute;\r\n    width: 16px;\r\n    height: 16px;\r\n    border: 2px solid var(--cyan);\r\n    opacity: 0.5;\r\n    pointer-events: none;\r\n    z-index: 2;\r\n}\r\n.map-panel .corner-deco.tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }\r\n.map-panel .corner-deco.tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }\r\n.map-panel .corner-deco.bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }\r\n.map-panel .corner-deco.br { bottom: 10px; right: 10px; border-left: none; border-top: none; }\r\n\r\n.map-head {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    margin-bottom: 12px;\r\n    padding-bottom: 10px;\r\n    border-bottom: 1px solid rgba(14,165,233,0.08);\r\n}\r\n.map-head h2 {\r\n    font-size: 18px;\r\n    font-weight: 700;\r\n    color: #fff;\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 10px;\r\n    margin: 0;\r\n}\r\n.map-head h2 i {\r\n    color: var(--cyan);\r\n    font-size: 20px;\r\n}\r\n.map-hint {\r\n    font-size: 11px;\r\n    color: var(--text-muted);\r\n    background: rgba(255,255,255,0.04);\r\n    padding: 4px 10px;\r\n    border-radius: 999px;\r\n}\r\n\r\n.chart-map {\n    width: 100%;\n    flex: 1 1 auto;\n    height: min(60vh, calc(100vh - 330px));\n    min-height: 460px;\n    border-radius: var(--radius);\n    overflow: visible;\n    position: relative;\n    isolation: isolate;\r\n    background:\r\n        radial-gradient(circle at 52% 46%, rgba(34, 211, 238, 0.12), transparent 34%),\r\n        radial-gradient(circle at 24% 30%, rgba(45, 212, 191, 0.08), transparent 24%),\r\n        linear-gradient(180deg, rgba(7, 16, 28, 0.86), rgba(8, 21, 35, 0.64));\r\n    border: 1px solid rgba(56, 189, 248, 0.1);\r\n    box-shadow:\r\n        inset 0 0 0 1px rgba(125, 211, 252, 0.04),\r\n        inset 0 0 60px rgba(34, 211, 238, 0.05);\r\n}\r\n\r\n.chart-map::before,\r\n.chart-map::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    inset: 12px;\r\n    border-radius: calc(var(--radius) - 4px);\r\n    pointer-events: none;\r\n}\r\n\r\n.chart-map::before {\r\n    background:\r\n        linear-gradient(rgba(125, 211, 252, 0.04) 1px, transparent 1px),\r\n        linear-gradient(90deg, rgba(125, 211, 252, 0.04) 1px, transparent 1px);\r\n    background-size: 28px 28px;\r\n    mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.9), transparent 84%);\r\n    opacity: 0.5;\r\n    z-index: 0;\r\n}\r\n\r\n.chart-map::after {\r\n    inset: auto 18px 18px 18px;\r\n    height: 72px;\r\n    border-radius: 18px;\r\n    background: linear-gradient(180deg, transparent, rgba(8, 21, 35, 0.78));\r\n    z-index: 0;\r\n}\r\n\r\n.chart-map > div {\r\n    position: relative;\r\n    z-index: 1;\r\n}\r\n\r\n/* ---------- 核心指标迷你网格 ---------- */\r\n.indicator-mini-grid {\r\n    display: grid;\r\n    grid-template-columns: 1fr 1fr;\r\n    gap: 10px;\r\n}\r\n\r\n.indicator-card {\r\n    padding: 12px 10px;\r\n    background: linear-gradient(180deg, rgba(9,20,35,0.8), rgba(11,26,42,0.6));\r\n    border: 1px solid rgba(14,165,233,0.08);\r\n    border-radius: 10px;\r\n    transition: all 0.2s;\r\n    overflow: hidden;\r\n}\r\n.indicator-card:hover {\r\n    border-color: rgba(14,165,233,0.2);\r\n    background: rgba(14,165,233,0.06);\r\n}\r\n.indicator-card.improved {\r\n    border-color: rgba(34,197,94,0.2);\r\n}\r\n.indicator-card.worsened {\r\n    border-color: rgba(244,63,94,0.2);\r\n}\r\n\r\n.indicator-top {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    align-items: center;\r\n    margin-bottom: 6px;\r\n}\r\n.indicator-name {\r\n    font-size: 12px;\r\n    font-weight: 600;\r\n    color: var(--text-primary);\r\n}\r\n\r\n.indicator-value {\r\n    display: flex;\r\n    align-items: baseline;\r\n    gap: 4px;\r\n    margin-bottom: 6px;\r\n}\r\n.indicator-value strong {\r\n    font-family: \"Rajdhani\", \"Noto Sans SC\", sans-serif;\r\n    font-size: 20px;\r\n    font-weight: 700;\r\n    color: #fff;\r\n    line-height: 1;\r\n    word-break: break-all;\r\n}\r\n.indicator-value span {\r\n    font-size: 10px;\r\n    color: var(--text-muted);\r\n}\r\n\r\n.indicator-meta {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    font-size: 10px;\r\n    color: var(--text-muted);\r\n    line-height: 1.5;\r\n}\r\n.indicator-meta strong {\r\n    color: var(--text-primary);\r\n    font-weight: 600;\r\n}\r\n\r\n.delta-improved { color: #4ade80; }\r\n.delta-worsened { color: #fb7185; }\r\n.delta-neutral { color: var(--cyan-light); }\r\n\r\n/* ---------- 模型迷你图 ---------- */\r\n.model-mini {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 8px;\r\n}\r\n\r\n.chart-mini {\r\n    width: 100%;\r\n    height: 160px;\r\n    border-radius: var(--radius);\r\n    overflow: visible;\r\n}\r\n\r\n.model-caption {\r\n    font-size: 11px;\r\n    color: var(--text-muted);\r\n    text-align: center;\r\n}\r\n\r\n/* ---------- 快捷入口 ---------- */\r\n.links-panel {\r\n    padding: 14px;\r\n}\r\n.links-panel .side-head {\r\n    margin-bottom: 10px;\r\n}\r\n\r\n.quick-links {\r\n    display: grid;\r\n    grid-template-columns: 1fr 1fr 1fr;\r\n    gap: 8px;\r\n}\r\n\r\n.q-card {\r\n    display: flex;\r\n    flex-direction: column;\r\n    align-items: center;\r\n    gap: 5px;\r\n    padding: 12px 6px;\r\n    background: linear-gradient(180deg, rgba(14,165,233,0.06), rgba(10,20,35,0.5));\r\n    border: 1px solid rgba(14,165,233,0.1);\r\n    border-radius: 10px;\r\n    text-decoration: none;\r\n    transition: all 0.25s;\r\n    cursor: pointer;\r\n}\r\n.q-card:hover {\r\n    transform: translateY(-3px);\r\n    border-color: rgba(14,165,233,0.3);\r\n    background: linear-gradient(180deg, rgba(14,165,233,0.12), rgba(10,20,35,0.6));\r\n    box-shadow: 0 8px 20px rgba(14,165,233,0.15);\r\n}\r\n\r\n.q-icon {\r\n    width: 32px;\r\n    height: 32px;\r\n    border-radius: 8px;\r\n    background: rgba(14,165,233,0.12);\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    color: var(--cyan);\r\n    font-size: 14px;\r\n    transition: all 0.25s;\r\n}\r\n.q-card:hover .q-icon {\r\n    background: rgba(14,165,233,0.25);\r\n    color: var(--cyan-light);\r\n    transform: scale(1.1);\r\n}\r\n\r\n.q-text {\r\n    font-size: 11px;\r\n    color: var(--text-secondary);\r\n    font-weight: 500;\r\n}\r\n.q-data {\r\n    font-size: 10px;\r\n    color: var(--text-muted);\r\n    font-family: \"Rajdhani\", sans-serif;\r\n}\r\n\r\n/* ---------- 底部趋势 ---------- */\r\n.dash-footer {\r\n    min-height: 0;\r\n}\r\n\r\n.trend-panel {\r\n    background: var(--bg-panel);\r\n    border: 1px solid var(--border-glow);\r\n    border-radius: var(--radius-lg);\r\n    padding: 16px 18px;\r\n    backdrop-filter: blur(10px);\r\n    box-shadow: var(--shadow), 0 0 40px rgba(14,165,233,0.05);\r\n    position: relative;\r\n    overflow: hidden;\r\n    transition: all 0.35s ease;\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n.trend-panel:hover {\r\n    border-color: var(--border-glow-strong);\r\n    box-shadow: var(--shadow), 0 0 40px rgba(14,165,233,0.1);\r\n}\r\n.trend-panel::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: 20px;\r\n    width: 120px;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, var(--cyan), var(--teal), transparent);\r\n}\r\n\r\n.trend-head {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    margin-bottom: 10px;\r\n}\r\n.trend-head h3 {\r\n    font-size: 15px;\r\n    font-weight: 700;\r\n    color: #fff;\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 8px;\r\n    margin: 0;\r\n}\r\n.trend-head h3 i {\r\n    color: var(--cyan);\r\n}\r\n.trend-meta {\r\n    font-size: 11px;\r\n    color: var(--text-muted);\r\n}\r\n\r\n.chart-trend {\r\n    width: 100%;\r\n    height: 210px;\r\n    border-radius: var(--radius);\r\n    overflow: visible;\r\n}\r\n\r\n.center-trend-panel {\n    flex: 0 0 auto;\n    min-height: 0;\n    height: auto;\n    padding: 15px 18px;\n}\n\r\n.center-trend-panel .trend-head {\r\n    margin-bottom: 8px;\r\n}\r\n\r\n.center-trend-panel .trend-head h3 {\r\n    font-size: 14px;\r\n}\r\n\r\n.center-trend-panel .chart-trend {\n    flex: 0 0 auto;\n    min-height: 188px;\n    height: clamp(188px, 22vh, 220px);\n}\n\r\n/* ---------- Loading ---------- */\r\n.loading-mask {\r\n    position: fixed;\r\n    inset: 0;\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    flex-direction: column;\r\n    gap: 16px;\r\n    background: rgba(3, 8, 14, 0.88);\r\n    backdrop-filter: blur(10px);\r\n    z-index: 100;\r\n    transition: opacity 0.3s;\r\n}\r\n.loading-mask.hidden {\r\n    display: none;\r\n}\r\n\r\n.spinner {\r\n    width: 48px;\r\n    height: 48px;\r\n    border-radius: 50%;\r\n    border: 3px solid rgba(14,165,233,0.1);\r\n    border-top-color: var(--cyan);\r\n    animation: spin 1s linear infinite;\r\n}\r\n\r\n.loading-text {\r\n    font-size: 14px;\r\n    color: var(--text-secondary);\r\n    letter-spacing: 0.1em;\r\n}\r\n\r\n@keyframes spin {\r\n    to { transform: rotate(360deg); }\r\n}\r\n\r\n/* ---------- 空状态 ---------- */\r\n.empty-state {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    height: 100%;\r\n    color: var(--text-muted);\r\n    font-size: 13px;\r\n}\r\n\r\n/* ---------- 隐藏兼容元素 ---------- */\r\n#indicatorWindow, #indicatorNotes, #scopeScoreFoot, #scopeLevelFoot,\r\n#scopeStationsFoot, #scopeAlertsFoot, #modelScope {\r\n    display: none !important;\r\n}\r\n\r\n/* ---------- 响应式 ---------- */\r\n@media (max-width: 1440px) {\n    .dash-body {\n        grid-template-columns: 220px 1fr 260px;\n        gap: 16px;\n    }\n    .dashboard-shell {\n        padding: 84px 16px 18px;\n    }\n    .kpi-cards {\r\n        gap: 10px;\r\n    }\r\n    .kpi-card {\r\n        min-width: 90px;\r\n        padding: 10px 12px;\r\n    }\r\n    .kpi-value {\r\n        font-size: 22px;\r\n    }\r\n}\r\n\r\n@media (max-width: 1180px) {\n    .dash-body {\n        grid-template-columns: 1fr;\n        grid-template-rows: auto auto auto;\n        min-height: auto;\n    }\n    .dash-center {\r\n        gap: 16px;\r\n    }\r\n    .dash-side.left {\r\n        flex-direction: row;\r\n        flex-wrap: wrap;\r\n    }\r\n    .dash-side.left .side-panel {\r\n        flex: 1;\r\n        min-width: 260px;\r\n    }\r\n    .dash-side.right {\r\n        flex-direction: row;\r\n        flex-wrap: wrap;\r\n    }\r\n    .dash-side.right .side-panel {\r\n        flex: 1;\r\n        min-width: 260px;\r\n    }\r\n    .map-panel {\r\n        min-height: auto;\r\n    }\r\n    .chart-map {\r\n        height: clamp(380px, 50vh, 430px);\r\n        min-height: 380px;\r\n    }\r\n    .center-trend-panel {\n        flex-basis: auto;\n        min-height: 0;\n    }\n    .center-trend-panel .chart-trend {\n        height: clamp(184px, 21vh, 208px);\n        min-height: 184px;\n    }\n    .dash-header {\r\n        flex-direction: column;\r\n        align-items: flex-start;\r\n        gap: 16px;\r\n    }\r\n    .dash-header-right {\r\n        align-items: flex-start;\r\n        width: 100%;\r\n    }\r\n    .kpi-cards {\r\n        width: 100%;\r\n        justify-content: space-between;\r\n    }\r\n}\r\n\r\n@media (max-width: 768px) {\r\n    .dashboard-shell {\r\n        padding: 72px 12px 16px;\r\n        gap: 12px;\r\n    }\r\n    .dash-header {\r\n        padding: 14px 16px;\r\n    }\r\n    .dash-title-group h1 {\r\n        font-size: 20px;\r\n    }\r\n    .kpi-cards {\r\n        flex-wrap: wrap;\r\n        gap: 8px;\r\n    }\r\n    .kpi-card {\r\n        min-width: calc(50% - 4px);\r\n        flex: 1;\r\n    }\r\n    .map-panel {\r\n        min-height: auto;\r\n        padding: 14px;\r\n    }\r\n    .chart-map {\r\n        height: 320px;\r\n        min-height: 320px;\r\n    }\r\n    .dash-center {\r\n        gap: 12px;\r\n    }\r\n    .side-panel {\r\n        padding: 14px;\r\n    }\r\n    .quick-links {\r\n        grid-template-columns: 1fr 1fr;\r\n    }\r\n    .chart-trend {\r\n        height: 188px;\r\n    }\r\n    .center-trend-panel {\n        min-height: 0;\n        padding: 14px;\n    }\n    .center-trend-panel .chart-trend {\n        height: 176px;\n        min-height: 176px;\n    }\n}\n"}</style>
<canvas id="particleCanvas"></canvas>
    
    <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "4s" }}></div>
    </div>

    
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="dashboard-topbar px-4">
            <div className="flex items-center justify-between h-16">
                
                <div className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                        <i className="fa fa-tint text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">海河六域</h1>
                        <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                    </div>
                </div>
                
                
                <nav className="hidden md:flex space-x-1">
                    <a href="index.html" data-page-link="index.html" className="nav-link">
                        <i className="fa fa-home mr-2"></i>
                        <span>首页</span>
                    </a>
                    <a href="dashboard.html" data-page-link="dashboard.html" className="nav-link active">
                        <i className="fa fa-dashboard mr-2"></i>
                        <span>数据大屏</span>
                    </a>
                    <a href="sandbox.html" data-page-link="sandbox.html" className="nav-core mx-2">
                        <i className="fa fa-globe mr-2"></i><span>流域时空推演沙盘</span>
                    </a>
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="nav-link">
                        <i className="fa fa-project-diagram mr-2"></i>
                        <span>知识图谱</span>
                    </a>
                    <a href="chat.html" data-page-link="chat.html" className="nav-link">
                        <i className="fa fa-robot mr-2"></i>
                        <span>智能问答</span>
                    </a>
                </nav>
                
                
                <div className="flex items-center space-x-4">
                    <form className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-white/10 transition-colors" data-nav-search>
                        <i className="fa fa-search text-gray-400 mr-2"></i>
                        <input type="search" className="w-40 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none" placeholder="搜索功能或页面" />
                    </form>
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <i className="fa fa-bell text-lg"></i>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                            <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                                <i className="fa fa-user text-white"></i>
                            </div>
                            <span className="text-sm font-medium text-gray-300 hidden md:inline" id="userName">用户名</span>
                            <i className="fa fa-chevron-down text-xs text-gray-400"></i>
                        </button>
                        
                        <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-lg shadow-2xl py-2 z-50 hidden border border-white/10" id="userMenu">
                            <a href="profile.html" data-page-link="profile.html" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-user-o mr-2"></i>个人中心
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-cog mr-2"></i>设置
                            </a>
                            <div className="border-t border-white/10 my-1"></div>
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" data-legacy-click="logout()">
                                <i className="fa fa-sign-out mr-2"></i>退出登录
                            </a>
                        </div>
                    </div>
                    
                    <button className="md:hidden text-gray-400 hover:text-white" id="mobileMenuBtn">
                        <i className="fa fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        
        <div className="md:hidden bg-dark-light border-t border-white/10 hidden" id="mobileMenu">
            <div className="dashboard-mobile-nav px-4 py-2 space-y-1">
                <a href="index.html" data-page-link="index.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-home mr-2"></i>首页
                </a>
                <a href="dashboard.html" data-page-link="dashboard.html" className="block px-4 py-3 text-white bg-white/10 rounded-lg">
                    <i className="fa fa-dashboard mr-2"></i>数据大屏
                </a>
                <a href="sandbox.html" data-page-link="sandbox.html" className="block px-4 py-3 text-white bg-gradient-water rounded-lg transition-colors">
                    <i className="fa fa-globe mr-2"></i>流域时空推演沙盘
                </a>
                <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-project-diagram mr-2"></i>知识图谱
                </a>
                <a href="chat.html" data-page-link="chat.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-robot mr-2"></i>智能问答
                </a>
            </div>
        </div>
    </header>

    
    <div className="dashboard-shell">
        
        <div className="dash-header">
            <div className="dash-header-left">
                <div className="scope-badge" id="currentScope">全流域宏观水质总览</div>
                <div className="dash-meta-row">
                    <span className="meta-pill"><i className="fa fa-map-marker mr-1"></i><strong id="metaRange">京津晋冀鲁豫 6 省市</strong></span>
                    <span className="meta-pill"><i className="fa fa-flask mr-1"></i><strong id="metaIndicators">11 项核心水质指标</strong></span>
                    <span className="meta-pill"><i className="fa fa-clock-o mr-1"></i><span id="metaCycle">历史监测 / 模型预测</span></span>
                </div>
            </div>
            <div className="dash-header-right">
                <div className="kpi-cards" id="kpiCards">
                    <div className="kpi-card">
                        <div className="kpi-label">综合水质指数</div>
                        <div className="kpi-value" id="kpiScore">--</div>
                        <div className="kpi-bar"><span id="kpiScoreBar"></span></div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">综合等级</div>
                        <div className="kpi-value" id="kpiLevel">--</div>
                        <div className="kpi-level-dot" id="kpiLevelDot"></div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">监测站点</div>
                        <div className="kpi-value" id="kpiStations">--</div>
                        <div className="kpi-sublabel">个活跃站点</div>
                    </div>
                    <div className="kpi-card alert">
                        <div className="kpi-label">30天异常记录</div>
                        <div className="kpi-value" id="kpiAlerts">--</div>
                        <div className="kpi-sublabel">项超标告警</div>
                    </div>
                </div>
                <div className="dash-time" id="metaClock">--</div>
            </div>
        </div>

        
        <div className="dash-body">
            
            <aside className="dash-side left">
                <div className="side-panel">
                    <div className="side-head">
                        <i className="fa fa-map-signs"></i>
                        <span>省份切换</span>
                    </div>
                    <div className="province-pills" id="provinceButtons"></div>
                </div>

                <div className="side-panel">
                    <div className="side-head">
                        <i className="fa fa-trophy"></i>
                        <span>省份水质排名</span>
                    </div>
                    <div className="chart-side" id="provinceRankChart"></div>
                </div>

                <div className="side-panel">
                    <div className="side-head">
                        <i className="fa fa-exclamation-circle"></i>
                        <span>污染物超标排行</span>
                    </div>
                    <div className="chart-side" id="pollutantChart"></div>
                </div>
            </aside>

            
            <main className="dash-center">
                <div className="map-panel">
                    <div className="corner-deco tl"></div>
                    <div className="corner-deco tr"></div>
                    <div className="corner-deco bl"></div>
                    <div className="corner-deco br"></div>
                    <div className="map-head">
                        <h2><i className="fa fa-globe"></i> 海河流域地理空间</h2>
                        <span className="map-hint"><i className="fa fa-hand-o-up mr-1"></i>点击省份切换 &middot; 双击回到全流域</span>
                    </div>
                    <div className="chart-map" id="mapChart"></div>
                </div>

                <div className="trend-panel center-trend-panel">
                    <div className="trend-head">
                        <h3><i className="fa fa-area-chart"></i> 全域时间趋势轴</h3>
                        <span className="trend-meta" id="trendMeta"></span>
                    </div>
                    <div className="chart-trend" id="trendChart"></div>
                </div>
            </main>

            
            <aside className="dash-side right">
                <div className="side-panel">
                    <div className="side-head">
                        <i className="fa fa-dashboard"></i>
                        <span>核心水质指标</span>
                    </div>
                    <div className="chart-side" id="indicatorRadarChart"></div>
                </div>

                <div className="side-panel">
                    <div className="side-head">
                        <i className="fa fa-cogs"></i>
                        <span>模型精度</span>
                    </div>
                    <div className="model-mini">
                        <div className="chart-mini" id="modelChart"></div>
                        <div className="model-caption" id="modelMeta"></div>
                    </div>
                </div>

                
                <div className="side-panel links-panel">
                    <div className="side-head">
                        <i className="fa fa-th-large"></i>
                        <span>深度分析</span>
                    </div>
                    <div className="quick-links">
                        <a href="trend-analysis.html" data-page-link="trend-analysis.html" className="q-card" title="时序趋势专项分析">
                            <div className="q-icon"><i className="fa fa-line-chart"></i></div>
                            <div className="q-text">时序趋势</div>
                            <div className="q-data" id="qTrend">--</div>
                        </a>
                        <a href="boxplot-analysis.html" data-page-link="boxplot-analysis.html" className="q-card" title="指标分布与异常预警">
                            <div className="q-icon"><i className="fa fa-bar-chart"></i></div>
                            <div className="q-text">箱线分析</div>
                            <div className="q-data" id="qBox">--</div>
                        </a>
                        <a href="correlation-analysis.html" data-page-link="correlation-analysis.html" className="q-card" title="指标相关性分析">
                            <div className="q-icon"><i className="fa fa-fire"></i></div>
                            <div className="q-text">相关性</div>
                            <div className="q-data" id="qCorr">--</div>
                        </a>
                        <a href="province-comparison.html" data-page-link="province-comparison.html" className="q-card" title="省际空间对比">
                            <div className="q-icon"><i className="fa fa-map"></i></div>
                            <div className="q-text">省份对比</div>
                            <div className="q-data" id="qCompare">--</div>
                        </a>
                        <a href="sandbox.html" data-page-link="sandbox.html" className="q-card" title="流域时空推演沙盘">
                            <div className="q-icon"><i className="fa fa-globe"></i></div>
                            <div className="q-text">推演沙盘</div>
                            <div className="q-data" id="qSandbox">--</div>
                        </a>
                        <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="q-card" title="知识图谱">
                            <div className="q-icon"><i className="fa fa-project-diagram"></i></div>
                            <div className="q-text">知识图谱</div>
                            <div className="q-data" id="qGraph">--</div>
                        </a>
                    </div>
                </div>
            </aside>
        </div>

    </div>

    
    <div className="loading-mask hidden" id="loadingMask">
        <div className="spinner"></div>
        <div className="loading-text">数据同步中...</div>
    </div>

    
    <div style={{ "display": "none" }}>
        <div id="pageTitle"></div>
        <div id="indicatorWindow"></div>
        <div id="indicatorNotes"></div>
        <div id="scopeScore">--</div>
        <div id="scopeScoreFoot">--</div>
        <div id="scopeLevel">--</div>
        <div id="scopeLevelFoot">--</div>
        <div id="scopeStations">--</div>
        <div id="scopeStationsFoot">--</div>
        <div id="scopeAlerts">--</div>
        <div id="scopeAlertsFoot">--</div>
        <div id="modelScope"></div>
        <div id="provinceRanking"></div>
        <div id="pollutantRanking"></div>
        <div id="indicatorGrid"></div>
    </div>
    </>
  );
}

function ForgotPasswordPage() {
  return (
    <>
      <style>{"@layer utilities {\r\n            .bg-gradient-water {\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n            }\r\n            .bg-gradient-dark {\r\n                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);\r\n            }\r\n            .text-gradient {\r\n                background-clip: text;\r\n                -webkit-background-clip: text;\r\n                color: transparent;\r\n                background-image: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);\r\n            }\r\n            .card-glass {\r\n                background: rgba(255, 255, 255, 0.05);\r\n                backdrop-filter: blur(10px);\r\n                border: 1px solid rgba(255, 255, 255, 0.1);\r\n            }\r\n            .card-shadow {\r\n                box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);\r\n            }\r\n            .input-focus {\r\n                @apply focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none;\r\n            }\r\n        }\n\nbody {\r\n            background-color: #0f172a;\r\n            overflow-x: hidden;\r\n        }\r\n        #particles-js {\r\n            position: fixed;\r\n            width: 100%;\r\n            height: 100%;\r\n            top: 0;\r\n            left: 0;\r\n            z-index: 0;\r\n        }\r\n        .wave {\r\n            position: absolute;\r\n            bottom: 0;\r\n            left: 0;\r\n            width: 200%;\r\n            height: 100px;\r\n            background: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230ea5e9' fill-opacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") repeat-x;\r\n            animation: wave 8s linear infinite;\r\n        }\r\n        @keyframes wave {\r\n            0% {\r\n                transform: translateX(0);\r\n            }\r\n            100% {\r\n                transform: translateX(-50%);\r\n            }\r\n        }"}</style>
<div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "4s" }}></div>
    </div>
    
    
    <div id="particles-js"></div>
    
    
    <div className="wave"></div>
    
    <div className="w-full max-w-md mx-auto animate-slide-up relative z-10">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4 group">
                <div className="w-12 h-12 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                    <i className="fa fa-tint text-white text-2xl"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">海河六域</h1>
                    <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-white">重置登录密码</h2>
            <p className="text-gray-400 mt-2">请输入注册邮箱并完成验证，以便继续访问数据大屏、推演沙盘、知识图谱和智能问答。</p>
        </div>
        
        <div className="card-glass rounded-2xl p-8 border border-white/10 card-shadow">
            <form id="forgotPasswordForm" className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">邮箱</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i className="fa fa-envelope"></i>
                        </span>
                        <input type="email" id="email" name="email" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请输入您的邮箱" required />
                    </div>
                </div>
                <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-400 mb-1">邮箱验证码</label>
                    <div className="flex space-x-2">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-shield"></i>
                            </span>
                            <input type="text" id="verificationCode" name="verificationCode" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请输入邮箱验证码" required />
                        </div>
                        <button type="button" id="sendCodeBtn" className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">
                            发送邮箱验证码
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-1">新密码</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i className="fa fa-lock"></i>
                        </span>
                        <input type="password" id="newPassword" name="newPassword" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请设置新密码" required />
                        <button type="button" id="togglePassword" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                            <i className="fa fa-eye-slash"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">确认新密码</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i className="fa fa-lock"></i>
                        </span>
                        <input type="password" id="confirmPassword" name="confirmPassword" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请再次输入新密码" required />
                    </div>
                </div>
                <button type="submit" className="w-full bg-gradient-water text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium">
                    重置密码并返回登录
                </button>
                <div className="text-center text-sm">
                        <a href="login.html" data-page-link="login.html" className="text-primary font-medium hover:text-white transition-colors">返回登录页</a>
                    </div>
            </form>
        </div>
        <div className="mt-6 text-center text-sm text-gray-400">
            <p>© 2026 海河六域 版权所有</p>
        </div>
    </div>
    </>
  );
}

function IndexPage() {
  return (
    <>
      <style>{"@layer utilities {\r\n            .bg-gradient-water {\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n            }\r\n            .bg-gradient-dark {\r\n                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);\r\n            }\r\n            .text-gradient {\r\n                background-clip: text;\r\n                -webkit-background-clip: text;\r\n                color: transparent;\r\n                background-image: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);\r\n            }\r\n            .card-glass {\r\n                background: rgba(255, 255, 255, 0.05);\r\n                backdrop-filter: blur(10px);\r\n                border: 1px solid rgba(255, 255, 255, 0.1);\r\n            }\r\n            .card-shadow {\r\n                box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);\r\n            }\r\n            .nav-link {\r\n                @apply relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300;\r\n            }\r\n            .nav-link::after {\r\n                content: '';\r\n                @apply absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-water transition-all duration-300;\r\n                transform: translateX(-50%);\r\n            }\r\n            .nav-link:hover::after {\r\n                @apply w-full;\r\n            }\r\n            .nav-link.active {\r\n                @apply text-white font-medium;\r\n            }\r\n            .nav-link.active::after {\r\n                @apply w-full;\r\n            }\r\n            .nav-core {\r\n                @apply relative px-5 py-2 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center;\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n                animation: glow-pulse 2s infinite;\r\n            }\r\n            @keyframes glow-pulse {\r\n                0%, 100% { box-shadow: 0 0 8px rgba(14,165,233,0.6); transform: scale(1); }\r\n                50% { box-shadow: 0 0 20px rgba(14,165,233,0.9); transform: scale(1.02); }\r\n            }\r\n            .btn-primary {\r\n                @apply px-6 py-3 bg-gradient-water text-white rounded-lg font-medium transition-all duration-300;\r\n                box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);\r\n            }\r\n            .btn-primary:hover {\r\n                transform: translateY(-2px);\r\n                box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6);\r\n            }\r\n            .btn-secondary {\r\n                @apply px-6 py-3 border-2 border-white/30 text-white rounded-lg font-medium transition-all duration-300 backdrop-blur-sm;\r\n            }\r\n            .btn-secondary:hover {\r\n                background: rgba(255, 255, 255, 0.1);\r\n                border-color: rgba(255, 255, 255, 0.5);\r\n            }\r\n            .feature-card {\r\n                @apply p-6 rounded-2xl transition-all duration-500;\r\n                background: rgba(255, 255, 255, 0.03);\r\n                border: 1px solid rgba(255, 255, 255, 0.08);\r\n            }\r\n            .feature-card:hover {\r\n                transform: translateY(-10px);\r\n                background: rgba(255, 255, 255, 0.08);\r\n                border-color: rgba(14, 165, 233, 0.3);\r\n                box-shadow: 0 20px 40px rgba(14, 165, 233, 0.2);\r\n            }\r\n            .stat-card {\r\n                @apply p-6 rounded-xl;\r\n                background: linear-gradient(145deg, rgba(14, 165, 233, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);\r\n                border: 1px solid rgba(14, 165, 233, 0.2);\r\n            }\r\n            .water-wave {\r\n                position: absolute;\r\n                bottom: 0;\r\n                left: 0;\r\n                width: 200%;\r\n                height: 100px;\r\n                background: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230ea5e9' fill-opacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") repeat-x;\r\n                animation: wave 8s linear infinite;\r\n            }\r\n        }"}</style>
<div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "4s" }}></div>
    </div>

    
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="w-full px-6">
            <div className="flex items-center justify-between h-16">
                
                <div className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                        <i className="fa fa-tint text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">海河六域</h1>
                        <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                    </div>
                </div>
                
                
                <nav className="hidden md:flex space-x-1">
                    <a href="index.html" data-page-link="index.html" className="nav-link active">
                        <i className="fa fa-home mr-2"></i>
                        <span>首页</span>
                    </a>
                    <a href="dashboard.html" data-page-link="dashboard.html" className="nav-link">
                        <i className="fa fa-dashboard mr-2"></i>
                        <span>数据大屏</span>
                    </a>
                    <a href="sandbox.html" data-page-link="sandbox.html" className="nav-core mx-2">
                        <i className="fa fa-globe mr-2"></i><span>流域时空推演沙盘</span>
                    </a>
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="nav-link">
                        <i className="fa fa-project-diagram mr-2"></i>
                        <span>知识图谱</span>
                    </a>
                    <a href="chat.html" data-page-link="chat.html" className="nav-link">
                        <i className="fa fa-robot mr-2"></i>
                        <span>智能问答</span>
                    </a>
                </nav>
                
                
                <div className="flex items-center space-x-4">
                    <form className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-white/10 transition-colors" data-nav-search>
                        <i className="fa fa-search text-gray-400 mr-2"></i>
                        <input type="search" className="w-40 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none" placeholder="搜索功能或页面" />
                    </form>
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <i className="fa fa-bell text-lg"></i>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                            <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                                <i className="fa fa-user text-white"></i>
                            </div>
                            <span className="text-sm font-medium text-gray-300 hidden md:inline" id="userName">用户名</span>
                            <i className="fa fa-chevron-down text-xs text-gray-400"></i>
                        </button>
                        
                        <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-lg shadow-2xl py-2 z-50 hidden border border-white/10" id="userMenu">
                            <a href="profile.html" data-page-link="profile.html" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-user-o mr-2"></i>个人中心
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-cog mr-2"></i>设置
                            </a>
                            <div className="border-t border-white/10 my-1"></div>
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" data-legacy-click="logout()">
                                <i className="fa fa-sign-out mr-2"></i>退出登录
                            </a>
                        </div>
                    </div>
                    
                    <button className="md:hidden text-gray-400 hover:text-white" id="mobileMenuBtn">
                        <i className="fa fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        
        <div className="md:hidden bg-dark-light border-t border-white/10 hidden" id="mobileMenu">
            <div className="container mx-auto px-4 py-2 space-y-1">
                <a href="index.html" data-page-link="index.html" className="block px-4 py-3 text-white bg-white/10 rounded-lg">
                    <i className="fa fa-home mr-2"></i>首页
                </a>
                <a href="dashboard.html" data-page-link="dashboard.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-dashboard mr-2"></i>数据大屏
                </a>
                <a href="sandbox.html" data-page-link="sandbox.html" className="block px-4 py-3 text-white bg-gradient-water rounded-lg transition-colors">
                    <i className="fa fa-globe mr-2"></i>流域时空推演沙盘
                </a>
                <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-project-diagram mr-2"></i>知识图谱
                </a>
                <a href="chat.html" data-page-link="chat.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-robot mr-2"></i>智能问答
                </a>
            </div>
        </div>
    </header>

    
    <main className="pt-16 relative">
        
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark"></div>
                <canvas id="particleCanvas" className="absolute inset-0 w-full h-full"></canvas>
            </div>
            
            
            <div className="water-wave"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    
                    <div className="w-full lg:w-1/2 space-y-8 animate-slide-up">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm text-gray-300">四大核心能力已接入</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                            守护海河<br />
                            <span className="text-gradient">水质未来</span>
                        </h1>
                        
                        <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
                            围绕海河流域监测数据，整合数据大屏、流域时空推演沙盘、知识图谱与智能问答，支撑态势感知、风险推演、图谱溯源与辅助决策。
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            <a href="sandbox.html" data-page-link="sandbox.html" className="btn-primary flex items-center space-x-2">
                                <i className="fa fa-globe"></i>
                                <span>进入沙盘</span>
                            </a>
                            <a href="dashboard.html" data-page-link="dashboard.html" className="btn-secondary flex items-center space-x-2">
                                <i className="fa fa-line-chart"></i>
                                <span>查看大屏</span>
                            </a>
                        </div>
                        
                        
                        <div className="flex items-center space-x-8 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-3xl font-bold text-white">6</p>
                                <p className="text-sm text-gray-400">省市联动</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white" id="heroGraphNodeCount">--</p>
                                <p className="text-sm text-gray-400">图谱节点</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">4</p>
                                <p className="text-sm text-gray-400">核心模块</p>
                            </div>
                        </div>
                    </div>
                    
                    
                    <div className="w-full lg:w-1/2 animate-slide-down">
                        <div className="relative">
                            
                            <div className="absolute inset-0 bg-gradient-water rounded-3xl blur-3xl opacity-30 animate-pulse-slow"></div>
                            
                            
                            <div className="relative card-glass rounded-3xl p-8 card-shadow">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white">平台核心入口</h3>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                                        在线运行
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    <a href="dashboard.html" data-page-link="dashboard.html" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <i className="fa fa-bar-chart text-blue-400"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">数据大屏</p>
                                                <p className="text-sm text-gray-400">趋势分析与多维对比</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-blue-400">实时查看</p>
                                            <p className="text-xs text-gray-400">dashboard</p>
                                        </div>
                                    </a>
                                    
                                    <a href="sandbox.html" data-page-link="sandbox.html" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                <i className="fa fa-globe text-cyan-400"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">时空推演沙盘</p>
                                                <p className="text-sm text-gray-400">风险模拟与 AI 决策</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-cyan-400">核心入口</p>
                                            <p className="text-xs text-gray-400">sandbox</p>
                                        </div>
                                    </a>
                                    
                                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                                                <i className="fa fa-share-alt text-teal-400"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">知识图谱</p>
                                                <p className="text-sm text-gray-400">上游链路与超标溯源</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-teal-400">图谱联动</p>
                                            <p className="text-xs text-gray-400">neo4j</p>
                                        </div>
                                    </a>

                                    <a href="chat.html" data-page-link="chat.html" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <i className="fa fa-comments-o text-green-400"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">智能问答</p>
                                                <p className="text-sm text-gray-400">DeepSeek 与本地知识协同</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-400">即时问答</p>
                                            <p className="text-xs text-gray-400">chat</p>
                                        </div>
                                    </a>
                                </div>
                                
                                <a href="sandbox.html" data-page-link="sandbox.html" className="mt-6 flex items-center justify-center space-x-2 text-primary hover:text-white transition-colors">
                                    <span>从流域时空推演沙盘开始体验</span>
                                    <i className="fa fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">核心功能</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        围绕当前项目的四个核心页面，形成从态势展示、推演决策到图谱溯源和智能问答的完整闭环。
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <a href="dashboard.html" data-page-link="dashboard.html" className="feature-card group block">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa fa-bar-chart text-white text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">数据大屏</h3>
                        <p className="text-gray-400 leading-relaxed">
                            汇聚热力图、箱线图、相关性、时序和省份对比等分析视角，快速把握流域整体态势。
                        </p>
                        <p className="text-sm text-primary mt-4">进入模块 <i className="fa fa-arrow-right ml-1"></i></p>
                    </a>
                    
                    
                    <a href="sandbox.html" data-page-link="sandbox.html" className="feature-card group block">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa fa-globe text-white text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">流域时空推演沙盘</h3>
                        <p className="text-gray-400 leading-relaxed">
                            按省市、日期和模型开展风险推演，联动 AI 决策结果，支撑跨区域水环境研判。
                        </p>
                        <p className="text-sm text-primary mt-4">进入模块 <i className="fa fa-arrow-right ml-1"></i></p>
                    </a>
                    
                    
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="feature-card group block">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa fa-share-alt text-white text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">知识图谱</h3>
                        <p className="text-gray-400 leading-relaxed">
                            面向站点、上游链路和超标事件开展图谱溯源，并与沙盘推演结果形成双向联动。
                        </p>
                        <p className="text-sm text-primary mt-4">进入模块 <i className="fa fa-arrow-right ml-1"></i></p>
                    </a>
                    
                    
                    <a href="chat.html" data-page-link="chat.html" className="feature-card group block">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa fa-comments-o text-white text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">智能问答</h3>
                        <p className="text-gray-400 leading-relaxed">
                            在本地知识库和 DeepSeek 协同下完成术语解释、场景问答和页面使用辅助。
                        </p>
                        <p className="text-sm text-primary mt-4">进入模块 <i className="fa fa-arrow-right ml-1"></i></p>
                    </a>
                </div>
            </div>
        </section>

        
        <section className="py-24 relative bg-dark-light/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">平台业务闭环</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        从数据接入到推演、溯源和问答解释，首页展示的是当前项目最常用的一条工作路径。
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    <div className="relative group">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-blue-400">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">数据汇聚</h3>
                            <p className="text-sm text-gray-400">汇集流域监测站点与多指标数据，形成统一分析入口</p>
                        </div>
                        <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-600">
                            <i className="fa fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    
                    <div className="relative group">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-cyan-400">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">大屏洞察</h3>
                            <p className="text-sm text-gray-400">通过多维可视分析快速识别省市差异和重点风险区域</p>
                        </div>
                        <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-600">
                            <i className="fa fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    
                    <div className="relative group">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-teal-400">3</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">沙盘推演</h3>
                            <p className="text-sm text-gray-400">结合日期、模型和空间范围进行时空推演与 AI 决策</p>
                        </div>
                        <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-600">
                            <i className="fa fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    
                    <div className="relative group">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-green-400">4</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">图谱溯源</h3>
                            <p className="text-sm text-gray-400">在知识图谱中追踪上游链路、超标事件和关键站点关系</p>
                        </div>
                        <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-600">
                            <i className="fa fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    
                    <div className="group">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-emerald-400">5</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">智能问答</h3>
                            <p className="text-sm text-gray-400">结合本地知识和大模型输出，补充解释与辅助研判</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">平台能力概览</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        用现有项目中的关键规模信息，快速说明平台当前的数据范围和图谱能力。
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="stat-card group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <i className="fa fa-tint text-blue-400 text-xl"></i>
                            </div>
                            <span className="text-xs text-green-400 flex items-center">
                                <i className="fa fa-circle mr-1"></i>区域联动
                            </span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">6</p>
                        <p className="text-sm text-gray-400">省市协同分析</p>
                        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ "width": "60%" }}></div>
                        </div>
                    </div>
                    
                    
                    <div className="stat-card group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <i className="fa fa-flask text-cyan-400 text-xl"></i>
                            </div>
                            <span className="text-xs text-green-400 flex items-center">
                                <i className="fa fa-circle mr-1"></i>监测接入
                            </span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1" id="overviewStationCount">--</p>
                        <p className="text-sm text-gray-400">监测站点</p>
                        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ "width": "40%" }}></div>
                        </div>
                    </div>
                    
                    
                    <div className="stat-card group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <i className="fa fa-share-alt text-green-400 text-xl"></i>
                            </div>
                            <span className="text-xs text-green-400 flex items-center">
                                <i className="fa fa-circle mr-1"></i>图谱在线
                            </span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1" id="overviewGraphNodeCount">--</p>
                        <p className="text-sm text-gray-400">知识节点</p>
                        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ "width": "72%" }}></div>
                        </div>
                    </div>
                    
                    
                    <div className="stat-card group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <i className="fa fa-check-circle text-teal-400 text-xl"></i>
                            </div>
                            <span className="text-xs text-green-400 flex items-center">
                                <i className="fa fa-circle mr-1"></i>溯源分析
                            </span>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1" id="overviewGraphLinkCount">--</p>
                        <p className="text-sm text-gray-400">关系链路</p>
                        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ "width": "88%" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        
        <section className="py-24 relative bg-dark-light/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">典型使用场景</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    <div className="feature-card group">
                        <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fa fa-area-chart text-6xl text-white/20"></i>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-xl font-semibold text-white">全局态势研判</h3>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-4">
                            从数据大屏查看相关性、热力图、时序和省份对比，先快速锁定当前需要关注的区域和指标。
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-400">数据大屏</span>
                            <a href="dashboard.html" data-page-link="dashboard.html" className="text-primary hover:text-white transition-colors">
                                立即查看 <i className="fa fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                    
                    
                    <div className="feature-card group">
                        <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-cyan-800"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fa fa-globe text-6xl text-white/20"></i>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-xl font-semibold text-white">风险推演决策</h3>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-4">
                            在流域时空推演沙盘中按省市、模型和日期进行演化模拟，并直接查看 AI 辅助决策结果。
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-cyan-400">流域沙盘</span>
                            <a href="sandbox.html" data-page-link="sandbox.html" className="text-primary hover:text-white transition-colors">
                                立即查看 <i className="fa fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                    
                    
                    <div className="feature-card group">
                        <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fa fa-share-alt text-6xl text-white/20"></i>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-xl font-semibold text-white">图谱溯源解释</h3>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-4">
                            进入知识图谱追踪上游链路，再结合智能问答快速补充指标解释、页面使用和治理背景说明。
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-teal-400">图谱 + 问答</span>
                            <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="text-primary hover:text-white transition-colors">
                                立即查看 <i className="fa fa-arrow-right ml-1"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-2">知识图谱联动能力</h2>
                        <p className="text-gray-400">围绕当前图谱页的真实能力，展示站点溯源、超标查询和沙盘联动入口</p>
                    </div>
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="btn-secondary">
                        查看完整图谱 <i className="fa fa-arrow-right ml-2"></i>
                    </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    <div className="feature-card">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <i className="fa fa-industry text-blue-400"></i>
                            </div>
                            <div>
                                <p className="font-medium text-white">站点溯源</p>
                                <p className="text-xs text-gray-400">直接上游链路</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">按站点执行污染溯源</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            面向监测站点查看直接上游站点、链路路径和污染事件，辅助定位流域中的风险来源。
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span><i className="fa fa-sitemap mr-1"></i>路径追踪</span>
                                <span><i className="fa fa-eye mr-1"></i>站点联动</span>
                            </div>
                            <span className="text-blue-400">污染溯源</span>
                        </div>
                    </div>
                    
                    
                    <div className="feature-card">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <i className="fa fa-tint text-cyan-400"></i>
                            </div>
                            <div>
                                <p className="font-medium text-white">超标事件</p>
                                <p className="text-xs text-gray-400">省份 + 日期窗口</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">按区域查询超标记录</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            支持在知识图谱页中按省份和时间范围筛选超标事件，并同步定位到相关站点和指标。
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span><i className="fa fa-sitemap mr-1"></i>事件筛选</span>
                                <span><i className="fa fa-eye mr-1"></i>图谱定位</span>
                            </div>
                            <span className="text-cyan-400">超标查询</span>
                        </div>
                    </div>
                    
                    
                    <div className="feature-card">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <i className="fa fa-map-marker text-green-400"></i>
                            </div>
                            <div>
                                <p className="font-medium text-white">沙盘联动</p>
                                <p className="text-xs text-gray-400">AI 决策跳转</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">从推演结果进入图谱溯源</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            沙盘中的 AI 决策已可直达知识图谱页，自动关闭物理模拟并展示适配后的溯源视图。
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span><i className="fa fa-sitemap mr-1"></i>一键跳转</span>
                                <span><i className="fa fa-eye mr-1"></i>上下文保留</span>
                            </div>
                            <span className="text-green-400">联动分析</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="relative rounded-3xl overflow-hidden">
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
                    <div className="absolute inset-0 bg-gradient-water opacity-10"></div>
                    
                    
                    <div className="relative p-12 md:p-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            从首页直达核心模块
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                            先看全局态势，再做时空推演、图谱溯源和智能解释，让首页真正成为现在这个项目的起点。
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="sandbox.html" data-page-link="sandbox.html" className="btn-primary text-lg px-8 py-4">
                                进入推演沙盘
                            </a>
                            <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="btn-secondary text-lg px-8 py-4">
                                打开知识图谱
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    
    <footer className="bg-dark-light border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                            <i className="fa fa-tint text-white"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-white">海河六域</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        面向海河流域水质分析与治理决策，整合数据大屏、时空推演、知识图谱与智能问答，形成统一的项目首页入口。
                    </p>
                </div>
                
                
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">快速链接</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="index.html" data-page-link="index.html" className="text-gray-400 hover:text-white transition-colors">首页</a></li>
                        <li><a href="dashboard.html" data-page-link="dashboard.html" className="text-gray-400 hover:text-white transition-colors">数据大屏</a></li>
                        <li><a href="sandbox.html" data-page-link="sandbox.html" className="text-gray-400 hover:text-white transition-colors">流域时空推演沙盘</a></li>
                        <li><a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="text-gray-400 hover:text-white transition-colors">知识图谱</a></li>
                        <li><a href="chat.html" data-page-link="chat.html" className="text-gray-400 hover:text-white transition-colors">智能问答</a></li>
                    </ul>
                </div>
                
                
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">关注我们</h3>
                    <div className="flex space-x-3">
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                            <i className="fa fa-weixin text-gray-400 hover:text-white"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                            <i className="fa fa-weibo text-gray-400 hover:text-white"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                            <i className="fa fa-github text-gray-400 hover:text-white"></i>
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 text-center">
                <p className="text-gray-500 text-sm">
                    © 2026 海河六域 - 流域水质时空演变与知识图谱智能治理系统 版权所有
                </p>
            </div>
        </div>
    </footer>
    </>
  );
}

function KnowledgeGraphPage() {
  return (
    <>
      <style>{":root{--bg-deep:#1a2435;--bg-panel:rgba(24,34,52,0.55);--border:rgba(148,163,184,0.1);--border-glow:rgba(14,165,233,0.28);--text-primary:#f8fafc;--text-secondary:#cbd5e1;--text-muted:#94a3b8;--cyan:#0ea5e9;--green:#22c55e;}\r\nhtml,body{min-height:100%;margin:0;background:radial-gradient(circle at 15% 15%,rgba(14,165,233,0.1),transparent 30%),radial-gradient(circle at 82% 14%,rgba(111,140,255,0.06),transparent 28%),radial-gradient(circle at 50% 100%,rgba(83,211,255,0.04),transparent 28%),linear-gradient(135deg,#0a111e 0%,#111b2b 46%,#121f2f 100%);color:var(--text-secondary);font-family:\"Noto Sans SC\",\"Microsoft YaHei\",sans-serif;}\r\nbody::before{content:\"\";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(14,165,233,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.035) 1px,transparent 1px);background-size:50px 50px;mask-image:linear-gradient(180deg,rgba(0,0,0,0.55),transparent 92%);}\r\nh1,h2,h3,h4,h5,h6{color:var(--text-primary);font-weight:600;}\r\nstrong,.font-semibold{font-weight:600;}\r\n.bg-gradient-water{background:linear-gradient(135deg,#0ea5e9 0%,#06b6d4 50%,#22c55e 100%);}\r\n.nav-link{position:relative;display:inline-flex;align-items:center;padding:0.5rem 1rem;color:#d1d5db;text-decoration:none;transition:all 0.3s;border-radius:0.375rem;}\r\n.nav-link:hover{color:#fff;background:rgba(255,255,255,0.05);}\r\n.nav-link.active{color:#fff;font-weight:500;}\r\n.nav-link::after{content:'';position:absolute;bottom:0;left:50%;width:0;height:2px;background:linear-gradient(90deg,#0ea5e9,#22c55e);transition:all 0.3s;transform:translateX(-50%);}\r\n.nav-link:hover::after,.nav-link.active::after{width:80%;}\r\n.nav-core{position:relative;display:inline-flex;align-items:center;padding:0.5rem 1.25rem;border-radius:9999px;color:#fff;font-weight:600;font-size:0.875rem;text-decoration:none;background:linear-gradient(135deg,#0ea5e9 0%,#06b6d4 50%,#22c55e 100%);box-shadow:0 0 12px rgba(14,165,233,0.4);transition:all 0.3s;}\r\n.nav-core:hover{box-shadow:0 0 20px rgba(14,165,233,0.7);transform:translateY(-1px);}\r\n.page-shell{width:min(1740px,calc(100% - 20px));margin:0 auto;padding:84px 10px 20px;display:flex;flex-direction:column;min-height:100vh;gap:16px;}\r\n.panel{border:1px solid var(--border);border-radius:16px;background:var(--bg-panel);box-shadow:0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.03);overflow:hidden;backdrop-filter:blur(12px);transition:all 0.3s ease;}\r\n.panel:hover{border-color:rgba(14,165,233,0.25);box-shadow:0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.05),0 0 20px rgba(14,165,233,0.06);}\r\n.muted{color:var(--text-muted);}\r\n.field-box,.chip,.status-card,.item-card{border:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.025);border-radius:8px;transition:all 0.25s ease;}\r\n.field-box:hover,.chip:hover,.status-card:hover,.item-card:hover{background:rgba(14,165,233,0.06);border-color:rgba(14,165,233,0.25);}\r\n.category-button{border:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.025);border-radius:8px;transition:all 0.25s ease;cursor:pointer;}\r\n.category-button:hover{background:rgba(255,255,255,0.05);border-color:rgba(14,165,233,0.18);}\r\n.category-button.active{background:rgba(14,165,233,0.15);border-color:rgba(14,165,233,0.35);box-shadow:0 0 16px rgba(14,165,233,0.15);}\r\n.graph-stage{flex:1;height:min(680px,calc(100vh - 220px));min-height:360px;max-height:680px;border:1px solid rgba(255,255,255,0.06);border-radius:16px;background:#0c1220;overflow:hidden;box-shadow:inset 0 0 40px rgba(14,165,233,0.04);}\n#knowledgeGraph{width:100%;height:100%;min-height:0;overflow:hidden;}\n.btn-lite{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:4px 12px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#ccc;font-weight:500;font-size:13px;transition:all 0.25s ease;cursor:pointer;}\r\n.btn-lite:hover{background:rgba(14,165,233,0.12);border-color:rgba(14,165,233,0.3);color:#fff;box-shadow:0 0 12px rgba(14,165,233,0.15);}\r\n.btn-lite.primary{background:linear-gradient(135deg,rgba(73,146,255,0.25),rgba(88,217,249,0.2));border-color:rgba(14,165,233,0.35);color:#fff;}\r\n.btn-lite.primary:hover{background:linear-gradient(135deg,rgba(14,165,233,0.4),rgba(88,217,249,0.3));box-shadow:0 4px 16px rgba(73,146,255,0.25);}\r\n.btn-lite.active{border-color:rgba(14,165,233,0.45);background:rgba(14,165,233,0.15);color:#fff;box-shadow:0 0 16px rgba(14,165,233,0.25);}\r\n.loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;background:rgba(6,10,18,0.85);backdrop-filter:blur(10px);z-index:80;}\r\n.loading.hidden{display:none !important;}\r\n.spinner{width:48px;height:48px;border-radius:50%;border:3px solid rgba(14,165,233,0.12);border-top-color:#0ea5e9;animation:spin 1s linear infinite;}\r\n@keyframes spin{to{transform:rotate(360deg);}}\r\n@keyframes popoverIn{0%{opacity:0;transform:translateY(8px) scale(0.96);}100%{opacity:1;transform:translateY(0) scale(1);}}\r\n.main-grid{display:grid;grid-template-columns:260px 1fr 280px;gap:16px;flex:1;min-height:0;}\r\n.left-col,.right-col{display:flex;flex-direction:column;gap:16px;min-height:0;}\r\n.center-col{display:flex;flex-direction:column;min-height:0;}\r\n@media (max-width:1280px){.main-grid{grid-template-columns:1fr;}.left-col,.right-col{flex-direction:row;flex-wrap:wrap;}.left-col>section,.right-col>section{flex:1;min-width:260px;}.graph-stage{height:520px;min-height:420px;max-height:520px;}}\n@media (max-width:860px){.graph-stage{min-height:340px;}}\r\n.graph-hint{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-top:10px;padding:8px 0;color:#94a3b8;font-size:12px;}\r\n.graph-hint span{display:inline-flex;align-items:center;gap:6px;}\r\n.graph-hint i{color:#38bdf8;font-size:13px;}\r\n.vis-network{outline:none;}"}</style>
<header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10">
<div className="container mx-auto px-4">
<div className="flex items-center justify-between h-16">
<div className="flex items-center space-x-3 group">
<div className="w-10 h-10 rounded-full bg-gradient-water flex items-center justify-center"><i className="fa fa-tint text-white text-xl"></i></div>
<div><h1 className="text-xl font-bold text-white">海河六域</h1><p className="text-xs text-gray-500">流域水质时空演变与知识图谱智能治理系统</p></div>
</div>
<nav className="hidden md:flex space-x-1">
<a href="index.html" data-page-link="index.html" className="nav-link"><i className="fa fa-home mr-2"></i><span>首页</span></a>
<a href="dashboard.html" data-page-link="dashboard.html" className="nav-link"><i className="fa fa-dashboard mr-2"></i><span>数据大屏</span></a>
<a href="sandbox.html" data-page-link="sandbox.html" className="nav-core mx-2"><i className="fa fa-globe mr-2"></i><span>流域时空推演沙盘</span></a>
<a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="nav-link active"><i className="fa fa-project-diagram mr-2"></i><span>知识图谱</span></a>
<a href="chat.html" data-page-link="chat.html" className="nav-link"><i className="fa fa-robot mr-2"></i><span>智能问答</span></a>
</nav>
<div className="flex items-center space-x-4">
<button className="text-gray-500 hover:text-white transition-colors"><i className="fa fa-search text-lg"></i></button>
<button className="text-gray-500 hover:text-white transition-colors relative"><i className="fa fa-bell text-lg"></i><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span></button>
<div className="relative">
<button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
<div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center"><i className="fa fa-user text-white"></i></div>
<span className="text-sm font-medium text-gray-400 hidden md:inline" id="userName">访客</span>
<i className="fa fa-chevron-down text-xs text-gray-500"></i>
</button>
<div className="absolute right-0 mt-2 w-48 bg-panel rounded-lg shadow-2xl py-2 z-50 hidden border border-white/10" id="userMenu">
<a href="profile.html" data-page-link="profile.html" className="block px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"><i className="fa fa-user-o mr-2"></i>个人中心</a>
<a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"><i className="fa fa-cog mr-2"></i>设置</a>
<div className="border-t border-white/10 my-1"></div>
<a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" data-legacy-click="logout()"><i className="fa fa-sign-out mr-2"></i>退出登录</a>
</div>
</div>
<button className="md:hidden text-gray-400 hover:text-white" id="mobileMenuBtn"><i className="fa fa-bars text-xl"></i></button>
</div>
</div>
</div>
<div className="md:hidden bg-panel border-t border-white/10 hidden" id="mobileMenu">
<div className="container mx-auto px-4 py-2 space-y-1">
<a href="index.html" data-page-link="index.html" className="block px-4 py-3 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"><i className="fa fa-home mr-2"></i>首页</a>
<a href="dashboard.html" data-page-link="dashboard.html" className="block px-4 py-3 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"><i className="fa fa-dashboard mr-2"></i>数据大屏</a>
<a href="sandbox.html" data-page-link="sandbox.html" className="block px-4 py-3 text-white bg-gradient-water rounded-lg transition-colors"><i className="fa fa-globe mr-2"></i>流域时空推演沙盘</a>
<a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="block px-4 py-3 text-white bg-white/10 rounded-lg"><i className="fa fa-project-diagram mr-2"></i>知识图谱</a>
<a href="chat.html" data-page-link="chat.html" className="block px-4 py-3 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"><i className="fa fa-robot mr-2"></i>智能问答</a>
</div>
</div>
</header>

<div className="page-shell">
<section className="main-grid">
<aside className="left-col" id="leftRail">
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="mb-4"><h3 className="text-lg font-bold">图例说明</h3></div>
<div id="legendList" className="grid gap-2"></div>
</section>
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="mb-4"><h3 className="text-lg font-bold">检索与筛选</h3></div>
<div className="grid gap-4">
<div className="field-box flex items-center gap-3 px-4 py-3"><i className="fa fa-search text-gray-500"></i><input id="searchInput" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }} type="text" placeholder="输入站点、河流、污染物或省份名称" /></div>
<div className="grid sm:grid-cols-2 gap-3">
<button className="btn-lite primary" id="searchBtn"><i className="fa fa-crosshairs"></i>定位结果</button>
<button className="btn-lite" id="resetBtn"><i className="fa fa-undo"></i>重置视图</button>
</div>
<div className="status-card p-4 text-sm leading-7" id="searchStatus">输入名称定位节点。</div>
</div>
</section>
<section className="panel p-5" style={{ "flex": "1", "minHeight": "0", "overflow": "auto" }}>
<div className="flex items-start justify-between gap-3 mb-3"><h3 className="text-lg font-bold">实体分类</h3><div className="chip px-3 py-2 text-xs" id="categoryPanelMeta">--</div></div>
<div id="categoryList" className="grid gap-2"></div>
</section>
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="mb-3"><h3 className="text-lg font-bold">关系分布</h3></div>
<div id="relationList" className="grid gap-2"></div>
</section>
</aside>

<div className="center-col">
<section className="panel p-5" style={{ "flex": "1", "minHeight": "0", "display": "flex", "flexDirection": "column" }}>
<div className="flex flex-wrap items-start justify-between gap-3 mb-4">
<div className="flex items-center gap-3"><h3 className="text-lg font-bold">知识图谱可视化</h3></div>
</div>
<div className="grid lg:grid-cols-2 gap-3 mb-4">
<div className="flex flex-wrap gap-3">
<button className="btn-lite active" id="forceLayoutBtn"><i className="fa fa-random"></i>力导布局</button>
<button className="btn-lite" id="hierarchyLayoutBtn"><i className="fa fa-sitemap"></i>层级布局</button>
<button className="btn-lite" id="circleLayoutBtn"><i className="fa fa-circle-o"></i>环形布局</button>
<button className="btn-lite" id="physicsBtn"><i className="fa fa-pause"></i>关闭物理模拟</button>
</div>
<div className="flex flex-wrap gap-3 lg:justify-end">
<a className="btn-lite" id="returnSandboxBtn" href="sandbox.html" data-page-link="sandbox.html"><i className="fa fa-reply"></i><span>返回沙盘</span></a>
<button className="btn-lite" id="fitBtn"><i className="fa fa-expand"></i>适配视图</button>
<button className="btn-lite" id="fullscreenBtn"><i className="fa fa-arrows-alt"></i>聚焦图谱</button>
</div>
</div>
<div className="graph-stage flex-1"><div id="knowledgeGraph"></div></div>
<div className="graph-hint" id="graphHint"><span><i className="fa fa-hand-paper-o"></i>拖拽节点</span><span><i className="fa fa-search-plus"></i>滚轮缩放</span><span><i className="fa fa-mouse-pointer"></i>点击查看详情</span><span><i className="fa fa-arrows"></i>右键拖拽画布</span></div>
<div className="mt-4"><div className="status-card p-4 text-sm leading-7" id="graphStatus">加载中...</div></div>
</section>
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
<div className="flex items-center gap-3">
<h3 className="text-lg font-bold">超标事件查询</h3>
<div className="chip px-3 py-2 text-xs" id="exceedPollutantTag" style={{ "display": "none" }}></div>
</div>
<div className="chip px-3 py-2 text-xs" id="exceedSummary">尚未执行查询。</div>
</div>
<div className="flex flex-wrap items-end gap-4">
<div className="flex-1 min-w-[140px]"><label className="text-[11px] uppercase tracking-[0.12em] muted block mb-1">省份</label><div className="field-box px-3 py-2"><select id="exceedProvince" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }}></select></div></div>
<div className="flex-1 min-w-[140px]"><label className="text-[11px] uppercase tracking-[0.12em] muted block mb-1">开始日期</label><div className="field-box px-3 py-2"><input id="exceedStart" type="date" value="2022-03-24" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }} /></div></div>
<div className="flex-1 min-w-[140px]"><label className="text-[11px] uppercase tracking-[0.12em] muted block mb-1">结束日期</label><div className="field-box px-3 py-2"><input id="exceedEnd" type="date" value="2022-06-18" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }} /></div></div>
<button className="btn-lite primary" id="runExceedBtn"><i className="fa fa-search"></i>查询超标事件</button>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-4" id="exceedList"></div>
</section>
</div>

<aside className="right-col" id="rightRail">
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="mb-4"><h3 className="text-lg font-bold">节点详情</h3></div>
<div id="nodeDetailBody" className="status-card p-4 text-sm leading-7">点击节点查看详情。</div>
</section>
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="mb-4"><h3 className="text-lg font-bold">污染溯源</h3></div>
<div className="grid gap-4">
<div className="grid gap-2"><label className="text-[11px] uppercase tracking-[0.12em] muted">目标站点</label><div className="field-box px-3 py-2"><select id="traceStation" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }}></select></div></div>
<div className="grid gap-2"><label className="text-[11px] uppercase tracking-[0.12em] muted">指标</label><div className="field-box px-3 py-2"><select id="tracePollutant" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }}></select></div></div>
<div className="grid gap-2"><label className="text-[11px] uppercase tracking-[0.12em] muted">日期</label><div className="field-box px-3 py-2"><input id="traceDate" type="date" value="2022-05-01" className="w-full bg-transparent outline-none text-sm" style={{ "color": "var(--text-secondary)" }} /></div></div>
<button className="btn-lite primary" id="runTraceBtn"><i className="fa fa-play"></i>执行溯源</button>
<div className="status-card p-4 text-sm leading-7" id="traceSummary">尚未执行溯源查询。</div>
<div className="grid gap-2" id="traceList"></div>
</div>
</section>
<section className="panel p-5" style={{ "flex": "0 0 auto" }}>
<div className="mb-4"><h3 className="text-lg font-bold">上游站点</h3></div>
<div className="status-card p-4 text-sm leading-7" id="upstreamSummary">尚未选择监测站点。</div>
<div className="grid gap-2 mt-3" id="upstreamList"></div>
</section>
</aside>
</section>
</div>

<div className="loading" id="loadingMask"><div className="spinner"></div><div>正在同步知识图谱...</div></div>
    </>
  );
}

function LoginPage() {
  return (
    <>
      <style>{"@layer utilities {\r\n            .bg-gradient-water {\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n            }\r\n            .bg-gradient-dark {\r\n                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);\r\n            }\r\n            .text-gradient {\r\n                background-clip: text;\r\n                -webkit-background-clip: text;\r\n                color: transparent;\r\n                background-image: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);\r\n            }\r\n            .card-glass {\r\n                background: rgba(255, 255, 255, 0.05);\r\n                backdrop-filter: blur(10px);\r\n                border: 1px solid rgba(255, 255, 255, 0.1);\r\n            }\r\n            .card-shadow {\r\n                box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);\r\n            }\r\n            .input-focus {\r\n                @apply focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none;\r\n            }\r\n        }\n\nbody {\r\n            background-color: #0f172a;\r\n            overflow-x: hidden;\r\n        }\r\n        #particles-js {\r\n            position: fixed;\r\n            width: 100%;\r\n            height: 100%;\r\n            top: 0;\r\n            left: 0;\r\n            z-index: 0;\r\n        }\r\n        .wave {\r\n            position: absolute;\r\n            bottom: 0;\r\n            left: 0;\r\n            width: 200%;\r\n            height: 100px;\r\n            background: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230ea5e9' fill-opacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") repeat-x;\r\n            animation: wave 8s linear infinite;\r\n        }\r\n        @keyframes wave {\r\n            0% {\r\n                transform: translateX(0);\r\n            }\r\n            100% {\r\n                transform: translateX(-50%);\r\n            }\r\n        }"}</style>
<div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "4s" }}></div>
    </div>
    
    
    <div id="particles-js"></div>
    
    
    <div className="wave"></div>
    
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center relative z-10">
        
        <div className="w-full md:w-1/2 space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                    <i className="fa fa-tint text-white text-2xl"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">海河六域</h1>
                    <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                登录平台，进入<br />
                <span className="text-gradient">流域智能研判</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                登录后即可进入数据大屏、流域时空推演沙盘、知识图谱与智能问答，在同一平台内完成态势查看、推演决策与图谱溯源。
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <i className="fa fa-database text-primary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">数据大屏</h3>
                        <p className="text-sm text-gray-400">查看全局态势分析</p>
                    </div>
                </div>
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <i className="fa fa-sitemap text-secondary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">推演沙盘</h3>
                        <p className="text-sm text-gray-400">联动 AI 决策结果</p>
                    </div>
                </div>
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <i className="fa fa-bar-chart text-primary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">知识图谱</h3>
                        <p className="text-sm text-gray-400">追踪上游溯源链路</p>
                    </div>
                </div>
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <i className="fa fa-users text-secondary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">智能问答</h3>
                        <p className="text-sm text-gray-400">快速获得解释辅助</p>
                    </div>
                </div>
            </div>
        </div>
        
        
        <div className="w-full md:w-1/2 animate-slide-up">
            <div className="card-glass rounded-2xl p-8 border border-white/10 card-shadow">
                <h2 className="text-2xl font-bold text-center text-white mb-2">登录海河六域</h2>
                <p className="text-center text-sm text-gray-400 mb-6">继续访问四大核心模块与个人使用记录</p>
                <form id="loginForm" className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">账号</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-user"></i>
                            </span>
                            <input type="text" id="username" name="username" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请输入账号" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">密码</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-lock"></i>
                            </span>
                            <input type="password" id="password" name="password" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请输入密码" required />
                            <button type="button" id="togglePassword" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                                <i className="fa fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input type="checkbox" id="remember" name="remember" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter rounded" />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">记住密码</label>
                        </div>
                        <a href="forgot-password.html" data-page-link="forgot-password.html" className="text-sm text-primary hover:text-white transition-colors">忘记密码?</a>
                    </div>
                    <button type="submit" className="w-full bg-gradient-water text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium">
                        登录并进入平台
                    </button>
                    <div className="text-center text-sm">
                        <span className="text-gray-400">还没有账号?</span>
                        <a href="register.html" data-page-link="register.html" className="text-primary font-medium hover:text-white ml-1 transition-colors">立即注册</a>
                    </div>
                </form>
            </div>
            <div className="mt-6 text-center text-sm text-gray-400">
                <p>© 2026 海河六域 版权所有</p>
            </div>
        </div>
    </div>
    </>
  );
}

function ProfilePage() {
  return (
    <>
      <style>{"@layer utilities {\r\n            .bg-gradient-water {\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 45%, #22c55e 100%);\r\n            }\r\n            .card-glass {\r\n                background: rgba(255, 255, 255, 0.04);\r\n                backdrop-filter: blur(14px);\r\n                border: 1px solid rgba(255, 255, 255, 0.08);\r\n            }\r\n            .card-shadow {\r\n                box-shadow: 0 20px 50px -16px rgba(15, 23, 42, 0.55);\r\n            }\r\n            .nav-link {\r\n                @apply relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300;\r\n            }\r\n            .nav-link::after {\r\n                content: '';\r\n                @apply absolute bottom-0 left-1/2 w-0 h-0.5 transition-all duration-300;\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);\r\n                transform: translateX(-50%);\r\n            }\r\n            .nav-link:hover::after,\r\n            .nav-link.active::after {\r\n                @apply w-full;\r\n            }\r\n            .nav-link.active {\r\n                @apply text-white font-medium;\r\n            }\r\n            .nav-core {\r\n                @apply relative px-5 py-2 rounded-full text-white font-semibold text-sm shadow-lg transition-all duration-300 flex items-center;\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n            }\r\n            .nav-core:hover {\r\n                box-shadow: 0 0 24px rgba(14, 165, 233, 0.35);\r\n            }\r\n            .input-focus {\r\n                @apply focus:ring-2 focus:ring-primary/60 focus:border-primary focus:outline-none;\r\n            }\r\n            .section-label {\r\n                @apply text-sm uppercase tracking-[0.24em] text-primary/80;\r\n            }\r\n            .stat-card {\r\n                @apply rounded-2xl p-4;\r\n                background: linear-gradient(145deg, rgba(14, 165, 233, 0.09) 0%, rgba(34, 197, 94, 0.08) 100%);\r\n                border: 1px solid rgba(148, 163, 184, 0.14);\r\n            }\r\n            .soft-divider {\r\n                border-color: rgba(255, 255, 255, 0.08);\r\n            }\r\n        }\n\nbody {\r\n            background-color: #0f172a;\r\n            overflow-x: hidden;\r\n        }"}</style>
<div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow" style={{ "animationDelay": "1.8s" }}></div>
        <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{ "animationDelay": "3.2s" }}></div>
    </div>

    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                        <i className="fa fa-tint text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">海河六域</h1>
                        <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                    </div>
                </div>

                <nav className="hidden md:flex space-x-1">
                    <a href="index.html" data-page-link="index.html" className="nav-link">
                        <i className="fa fa-home mr-2"></i>
                        <span>首页</span>
                    </a>
                    <a href="dashboard.html" data-page-link="dashboard.html" className="nav-link">
                        <i className="fa fa-dashboard mr-2"></i>
                        <span>数据大屏</span>
                    </a>
                    <a href="sandbox.html" data-page-link="sandbox.html" className="nav-core mx-2">
                        <i className="fa fa-globe mr-2"></i>
                        <span>流域时空推演沙盘</span>
                    </a>
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="nav-link">
                        <i className="fa fa-project-diagram mr-2"></i>
                        <span>知识图谱</span>
                    </a>
                    <a href="chat.html" data-page-link="chat.html" className="nav-link">
                        <i className="fa fa-robot mr-2"></i>
                        <span>智能问答</span>
                    </a>
                    <a href="profile.html" data-page-link="profile.html" className="nav-link active">
                        <i className="fa fa-user-o mr-2"></i>
                        <span>个人中心</span>
                    </a>
                </nav>

                <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <i className="fa fa-search text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <i className="fa fa-bell text-lg"></i>
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                            <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                                <i className="fa fa-user text-white"></i>
                            </div>
                            <span className="text-sm font-medium text-gray-300 hidden md:inline" id="userName">访客</span>
                            <i className="fa fa-chevron-down text-xs text-gray-400"></i>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-lg shadow-2xl py-2 z-50 hidden border border-white/10" id="userMenu">
                            <a href="profile.html" data-page-link="profile.html" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-user-o mr-2"></i>个人中心
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-cog mr-2"></i>设置
                            </a>
                            <div className="border-t border-white/10 my-1"></div>
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" data-legacy-click="logout()">
                                <i className="fa fa-sign-out mr-2"></i>退出登录
                            </a>
                        </div>
                    </div>
                    <button className="md:hidden text-gray-400 hover:text-white" id="mobileMenuBtn">
                        <i className="fa fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <div className="md:hidden bg-dark-light border-t border-white/10 hidden" id="mobileMenu">
            <div className="container mx-auto px-4 py-2 space-y-1">
                <a href="index.html" data-page-link="index.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-home mr-2"></i>首页
                </a>
                <a href="dashboard.html" data-page-link="dashboard.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-dashboard mr-2"></i>数据大屏
                </a>
                <a href="sandbox.html" data-page-link="sandbox.html" className="block px-4 py-3 text-white bg-gradient-water rounded-lg transition-colors">
                    <i className="fa fa-globe mr-2"></i>流域时空推演沙盘
                </a>
                <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-project-diagram mr-2"></i>知识图谱
                </a>
                <a href="chat.html" data-page-link="chat.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-robot mr-2"></i>智能问答
                </a>
                <a href="profile.html" data-page-link="profile.html" className="block px-4 py-3 text-white bg-white/10 rounded-lg">
                    <i className="fa fa-user-o mr-2"></i>个人中心
                </a>
            </div>
        </div>
    </header>

    <main className="container mx-auto px-4 pt-24 pb-10 relative z-10">
        <section className="mb-6">
            <p className="section-label mb-2">Account Center</p>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">个人中心</h1>
                    <p className="text-gray-400 mt-2">管理账号资料、使用偏好与近期常用模块。</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">知识图谱</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">沙盘推演</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">智能问答</span>
                </div>
            </div>
        </section>

        <section className="card-glass card-shadow rounded-3xl p-6 md:p-8 mb-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-3xl bg-gradient-water flex items-center justify-center shadow-lg">
                            <i className="fa fa-user text-white text-4xl"></i>
                        </div>
                        <button className="absolute -right-2 -bottom-2 h-9 w-9 rounded-full bg-dark-light border border-white/10 text-primary hover:text-white hover:bg-primary transition-colors">
                            <i className="fa fa-camera"></i>
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white" id="profileUserName">访客</h2>
                        <p className="text-primary mt-1" id="profileUserRole">流域分析账号</p>
                        <p className="text-sm text-gray-400 mt-2 max-w-xl" id="profileTagline">关注流域水质变化、知识图谱溯源与辅助决策。</p>
                        <div className="flex flex-wrap gap-2 mt-4" id="interestTags">
                            <span className="px-3 py-1 rounded-full text-xs bg-primary/15 text-primary">知识图谱</span>
                            <span className="px-3 py-1 rounded-full text-xs bg-secondary/15 text-secondary">污染溯源</span>
                            <span className="px-3 py-1 rounded-full text-xs bg-accent/15 text-accent">治理研判</span>
                        </div>
                    </div>
                </div>
                <div className="grid flex-1 grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="stat-card">
                        <p className="text-sm text-gray-400">常用模块</p>
                        <p className="text-2xl font-bold mt-2" id="favoriteModuleCount">4</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-sm text-gray-400">关注省份</p>
                        <p className="text-2xl font-bold mt-2" id="focusProvinceCount">3</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-sm text-gray-400">查询记录</p>
                        <p className="text-2xl font-bold mt-2" id="queryCount">128</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-sm text-gray-400">方案草稿</p>
                        <p className="text-2xl font-bold mt-2" id="planCount">12</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="mb-6 overflow-x-auto">
            <div className="flex min-w-max gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                <span className="px-4 py-2 rounded-xl bg-primary/15 text-primary">个人资料</span>
                <span className="px-4 py-2 rounded-xl text-gray-300">使用偏好</span>
                <span className="px-4 py-2 rounded-xl text-gray-300">近期记录</span>
                <span className="px-4 py-2 rounded-xl text-gray-300">账户安全</span>
            </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
                <div className="card-glass card-shadow rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-xl font-semibold text-white">基础资料</h3>
                            <p className="text-sm text-gray-400 mt-1">用于展示账号信息与页面身份标识。</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300">已同步到本地</span>
                    </div>
                    <form id="profileForm" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="realName" className="block text-sm font-medium text-gray-300 mb-2">姓名</label>
                                <input type="text" id="realName" name="realName" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入姓名" />
                            </div>
                            <div>
                                <label htmlFor="nickName" className="block text-sm font-medium text-gray-300 mb-2">显示名称</label>
                                <input type="text" id="nickName" name="nickName" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入显示名称" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                                <input type="email" id="email" name="email" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入邮箱" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">手机号</label>
                                <input type="tel" id="phone" name="phone" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入手机号" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="organization" className="block text-sm font-medium text-gray-300 mb-2">所属单位</label>
                                <input type="text" id="organization" name="organization" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入所属单位" />
                            </div>
                            <div>
                                <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">岗位职责</label>
                                <input type="text" id="position" name="position" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入岗位职责" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">工作说明</label>
                            <textarea id="bio" name="bio" rows="4" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus resize-none" placeholder="例如：负责流域监测研判、站点排查与治理方案梳理。"></textarea>
                        </div>
                        <div>
                            <label htmlFor="interests" className="block text-sm font-medium text-gray-300 mb-2">关注方向</label>
                            <input type="text" id="interests" name="interests" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="例如：知识图谱, 污染溯源, 风险预警" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-5 py-3 rounded-xl bg-gradient-water text-white font-medium hover:opacity-95 transition-opacity">
                                保存资料
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card-glass card-shadow rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-xl font-semibold text-white">使用偏好</h3>
                            <p className="text-sm text-gray-400 mt-1">设置默认关注区域与常用入口。</p>
                        </div>
                    </div>
                    <form id="preferenceForm" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="defaultProvince" className="block text-sm font-medium text-gray-300 mb-2">默认关注省份</label>
                                <select id="defaultProvince" name="defaultProvince" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus">
                                    <option value="河北省">河北省</option>
                                    <option value="北京市">北京市</option>
                                    <option value="天津市">天津市</option>
                                    <option value="山东省">山东省</option>
                                    <option value="山西省">山西省</option>
                                    <option value="河南省">河南省</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="defaultModule" className="block text-sm font-medium text-gray-300 mb-2">默认进入模块</label>
                                <select id="defaultModule" name="defaultModule" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus">
                                    <option value="dashboard">数据大屏</option>
                                    <option value="sandbox">时空推演沙盘</option>
                                    <option value="knowledge-graph">知识图谱</option>
                                    <option value="chat">智能问答</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="focusIndicator" className="block text-sm font-medium text-gray-300 mb-2">默认指标</label>
                                <select id="focusIndicator" name="focusIndicator" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus">
                                    <option value="高锰酸盐指数">高锰酸盐指数</option>
                                    <option value="氨氮">氨氮</option>
                                    <option value="总磷">总磷</option>
                                    <option value="溶解氧">溶解氧</option>
                                    <option value="总氮">总氮</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="workspaceMode" className="block text-sm font-medium text-gray-300 mb-2">默认视角</label>
                                <select id="workspaceMode" name="workspaceMode" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus">
                                    <option value="流域总览">流域总览</option>
                                    <option value="省域分析">省域分析</option>
                                    <option value="站点排查">站点排查</option>
                                    <option value="溯源研判">溯源研判</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-colors">
                                保存偏好
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card-glass card-shadow rounded-3xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">近期使用</h3>
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                                        <i className="fa fa-project-diagram"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">知识图谱溯源</p>
                                        <p className="text-xs text-gray-400">上游站点排查</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">刚刚</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
                                        <i className="fa fa-globe"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">流域推演沙盘</p>
                                        <p className="text-xs text-gray-400">方案对比与模拟</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">今天</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                                        <i className="fa fa-robot"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">智能问答</p>
                                        <p className="text-xs text-gray-400">问答记录已同步</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">昨天</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-glass card-shadow rounded-3xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">账户安全</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-white">邮箱验证</p>
                                <p className="text-sm text-gray-400" id="emailVerifyText">绑定后可用于找回账号。</p>
                            </div>
                            <button type="button" data-action="verify-email" className="px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors text-sm">
                                立即验证
                            </button>
                        </div>
                        <div className="soft-divider border-t"></div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-white">手机验证</p>
                                <p className="text-sm text-gray-400" id="phoneVerifyText">开启后可接收登录提醒。</p>
                            </div>
                            <button type="button" data-action="verify-phone" className="px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors text-sm">
                                立即验证
                            </button>
                        </div>
                        <div className="soft-divider border-t"></div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-white">登录提醒</p>
                                <p className="text-sm text-gray-400">异常登录时发送提示。</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="loginAlertToggle" className="sr-only peer" />
                                <div className="w-11 h-6 bg-dark-lighter peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-lighter after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="card-glass card-shadow rounded-3xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">修改密码</h3>
                    <form id="changePasswordForm" className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">当前密码</label>
                            <input type="password" id="currentPassword" name="currentPassword" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入当前密码" />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">新密码</label>
                            <input type="password" id="newPassword" name="newPassword" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请输入新密码" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">确认新密码</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-light text-white input-focus" placeholder="请再次输入新密码" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors">
                                更新密码
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    </main>
    </>
  );
}

function ProvinceComparisonPage() {
  return (
    <>
      <style>{"* {\r\n            margin: 0;\r\n            padding: 0;\r\n            box-sizing: border-box;\r\n        }\r\n        \r\n        html, body {\r\n            width: 100%;\r\n            min-height: 100%;\r\n            overflow-x: hidden;\r\n            overflow-y: auto;\r\n            font-family: 'Microsoft YaHei', sans-serif;\r\n            background: linear-gradient(135deg, #0a0f1c 0%, #0d1321 50%, #0a0f1c 100%);\r\n            color: #fff;\r\n        }\r\n        \r\n        /* 自定义滚动条 */\r\n        ::-webkit-scrollbar {\r\n            width: 8px;\r\n            height: 8px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-track {\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border-radius: 4px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-thumb {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.5), rgba(34, 197, 94, 0.5));\r\n            border-radius: 4px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-thumb:hover {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.7), rgba(34, 197, 94, 0.7));\r\n        }\r\n        \r\n        /* 科技感背景网格 */\r\n        .bg-grid {\r\n            position: fixed;\r\n            top: 0;\r\n            left: 0;\r\n            width: 100%;\r\n            height: 100%;\r\n            background-image: \r\n                linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),\r\n                linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);\r\n            background-size: 50px 50px;\r\n            pointer-events: none;\r\n            z-index: 0;\r\n        }\r\n        \r\n        /* 发光装饰 */\r\n        .glow-orb {\r\n            position: fixed;\r\n            border-radius: 50%;\r\n            filter: blur(100px);\r\n            pointer-events: none;\r\n            z-index: 0;\r\n        }\r\n        \r\n        .glow-orb-1 {\r\n            top: -10%;\r\n            left: -10%;\r\n            width: 400px;\r\n            height: 400px;\r\n            background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);\r\n        }\r\n        \r\n        .glow-orb-2 {\r\n            bottom: -10%;\r\n            right: -10%;\r\n            width: 500px;\r\n            height: 500px;\r\n            background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);\r\n        }\r\n        \r\n        /* 顶部导航 */\r\n        .top-nav {\r\n            position: fixed;\r\n            top: 0;\r\n            left: 0;\r\n            right: 0;\r\n            height: 64px;\r\n            background: rgba(15, 23, 42, 0.95);\r\n            backdrop-filter: blur(10px);\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n            z-index: 100;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            padding: 0 30px;\r\n        }\r\n        \r\n        .nav-title {\r\n            font-size: 22px;\r\n            font-weight: bold;\r\n            background: linear-gradient(90deg, #0ea5e9, #22c55e);\r\n            -webkit-background-clip: text;\r\n            -webkit-text-fill-color: transparent;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 12px;\r\n        }\r\n        \r\n        .nav-back {\r\n            padding: 8px 20px;\r\n            background: rgba(14, 165, 233, 0.15);\r\n            border: 1px solid rgba(14, 165, 233, 0.4);\r\n            border-radius: 6px;\r\n            color: #0ea5e9;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n            font-size: 14px;\r\n        }\r\n        \r\n        .nav-back:hover {\r\n            background: rgba(14, 165, 233, 0.3);\r\n            transform: translateY(-1px);\r\n        }\r\n        \r\n        /* 主容器 */\r\n        .main-container {\r\n            position: relative;\r\n            top: 64px;\r\n            left: 0;\r\n            right: 0;\r\n            min-height: calc(100vh - 64px);\r\n            padding: 20px;\r\n            z-index: 1;\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 20px;\r\n            padding-bottom: 40px;\r\n        }\r\n        \r\n        /* 核心结论栏 */\r\n        .conclusion-bar {\r\n            display: flex;\r\n            gap: 20px;\r\n            padding: 15px 20px;\r\n            background: linear-gradient(90deg, \r\n                rgba(14, 165, 233, 0.1) 0%, \r\n                rgba(34, 197, 94, 0.05) 50%,\r\n                rgba(14, 165, 233, 0.1) 100%);\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n            border-radius: 12px;\r\n            position: relative;\r\n            overflow: hidden;\r\n        }\r\n        \r\n        .conclusion-bar::before {\r\n            content: '';\r\n            position: absolute;\r\n            top: 0;\r\n            left: 0;\r\n            right: 0;\r\n            height: 2px;\r\n            background: linear-gradient(90deg, \r\n                transparent 0%, \r\n                #0ea5e9 20%, \r\n                #22c55e 50%, \r\n                #0ea5e9 80%, \r\n                transparent 100%);\r\n        }\r\n        \r\n        .conclusion-tag {\r\n            flex: 1;\r\n            padding: 15px 20px;\r\n            background: rgba(15, 23, 42, 0.6);\r\n            border-radius: 10px;\r\n            border: 1px solid;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 15px;\r\n            transition: all 0.3s;\r\n        }\r\n        \r\n        .conclusion-tag:hover {\r\n            transform: translateY(-2px);\r\n            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);\r\n        }\r\n        \r\n        .conclusion-tag.tag-1 {\r\n            border-color: rgba(0, 228, 0, 0.4);\r\n            background: linear-gradient(135deg, rgba(0, 228, 0, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .conclusion-tag.tag-2 {\r\n            border-color: rgba(14, 165, 233, 0.4);\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .tag-icon {\r\n            width: 50px;\r\n            height: 50px;\r\n            border-radius: 12px;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            font-size: 24px;\r\n        }\r\n        \r\n        .tag-1 .tag-icon {\r\n            background: rgba(0, 228, 0, 0.2);\r\n            color: #00e400;\r\n        }\r\n        \r\n        .tag-2 .tag-icon {\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        .tag-content {\r\n            flex: 1;\r\n        }\r\n        \r\n        .tag-title {\r\n            font-size: 13px;\r\n            color: #94a3b8;\r\n            margin-bottom: 4px;\r\n        }\r\n        \r\n        .tag-value {\r\n            font-size: 16px;\r\n            font-weight: bold;\r\n            color: #e2e8f0;\r\n            line-height: 1.5;\r\n        }\r\n        \r\n        .tag-highlight {\r\n            color: #22c55e;\r\n            font-weight: bold;\r\n        }\r\n        \r\n        .rank-item {\r\n            display: inline-flex;\r\n            align-items: center;\r\n            gap: 4px;\r\n            margin-right: 8px;\r\n        }\r\n        \r\n        .rank-number {\r\n            display: inline-flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            width: 22px;\r\n            height: 22px;\r\n            border-radius: 50%;\r\n            font-size: 12px;\r\n            font-weight: bold;\r\n        }\r\n        \r\n        .rank-1 { background: linear-gradient(135deg, #ffd700, #ffaa00); color: #000; }\r\n        .rank-2 { background: linear-gradient(135deg, #c0c0c0, #a0a0a0); color: #000; }\r\n        .rank-3 { background: linear-gradient(135deg, #cd7f32, #b87333); color: #fff; }\r\n        .rank-other { background: rgba(14, 165, 233, 0.3); color: #e2e8f0; }\r\n        \r\n        /* 主体内容区 */\r\n        .content-area {\r\n            display: grid;\r\n            grid-template-columns: 1fr 1fr;\r\n            gap: 20px;\r\n            min-height: 600px;\r\n        }\r\n        \r\n        /* 图表卡片 */\r\n        .chart-card {\r\n            background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);\r\n            border: 1px solid rgba(14, 165, 233, 0.2);\r\n            border-radius: 12px;\r\n            padding: 20px;\r\n            position: relative;\r\n            overflow: hidden;\r\n            display: flex;\r\n            flex-direction: column;\r\n        }\r\n        \r\n        /* 科技感四角装饰 */\r\n        .chart-card::before,\r\n        .chart-card::after {\r\n            content: '';\r\n            position: absolute;\r\n            width: 20px;\r\n            height: 20px;\r\n            border: 2px solid #0ea5e9;\r\n        }\r\n        \r\n        .chart-card::before {\r\n            top: 0;\r\n            left: 0;\r\n            border-right: none;\r\n            border-bottom: none;\r\n            border-top-left-radius: 8px;\r\n        }\r\n        \r\n        .chart-card::after {\r\n            bottom: 0;\r\n            right: 0;\r\n            border-left: none;\r\n            border-top: none;\r\n            border-bottom-right-radius: 8px;\r\n        }\r\n        \r\n        .corner-decoration {\r\n            position: absolute;\r\n            width: 20px;\r\n            height: 20px;\r\n            border: 2px solid #0ea5e9;\r\n        }\r\n        \r\n        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-top-left-radius: 8px; }\r\n        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; border-top-right-radius: 8px; }\r\n        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; border-bottom-left-radius: 8px; }\r\n        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; border-bottom-right-radius: 8px; }\r\n        \r\n        /* 卡片标题 */\r\n        .card-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 15px;\r\n            padding-bottom: 10px;\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n            flex-shrink: 0;\r\n        }\r\n        \r\n        .card-title {\r\n            font-size: 16px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 10px;\r\n        }\r\n        \r\n        .card-title i {\r\n            color: #0ea5e9;\r\n            font-size: 18px;\r\n        }\r\n        \r\n        .card-subtitle {\r\n            font-size: 12px;\r\n            color: #64748b;\r\n        }\r\n        \r\n        /* 图表容器 */\r\n        .chart-container {\r\n            flex: 1;\r\n            min-height: 0;\r\n            position: relative;\r\n        }\r\n        \r\n        /* 底部分析区 */\r\n        .bottom-section {\r\n            display: grid;\r\n            grid-template-columns: 2fr 1fr;\r\n            gap: 20px;\r\n            min-height: 400px;\r\n        }\r\n        \r\n        /* 排名表样式 */\r\n        .ranking-table {\r\n            width: 100%;\r\n            border-collapse: collapse;\r\n            font-size: 13px;\r\n        }\r\n        \r\n        .ranking-table th,\r\n        .ranking-table td {\r\n            padding: 12px 10px;\r\n            text-align: center;\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.1);\r\n        }\r\n        \r\n        .ranking-table th {\r\n            background: rgba(14, 165, 233, 0.15);\r\n            color: #0ea5e9;\r\n            font-weight: 600;\r\n            font-size: 12px;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n            user-select: none;\r\n        }\r\n        \r\n        .ranking-table th:hover {\r\n            background: rgba(14, 165, 233, 0.25);\r\n        }\r\n        \r\n        .ranking-table th.sortable::after {\r\n            content: ' ⇅';\r\n            color: #64748b;\r\n            font-size: 10px;\r\n        }\r\n        \r\n        .ranking-table th.sort-asc::after {\r\n            content: ' ↑';\r\n            color: #22c55e;\r\n        }\r\n        \r\n        .ranking-table th.sort-desc::after {\r\n            content: ' ↓';\r\n            color: #22c55e;\r\n        }\r\n        \r\n        .ranking-table td {\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .ranking-table tr:hover td {\r\n            background: rgba(14, 165, 233, 0.05);\r\n        }\r\n        \r\n        .ranking-table .province-name {\r\n            font-weight: 600;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            gap: 8px;\r\n        }\r\n        \r\n        .rank-badge {\r\n            display: inline-flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            width: 24px;\r\n            height: 24px;\r\n            border-radius: 50%;\r\n            font-size: 12px;\r\n            font-weight: bold;\r\n        }\r\n        \r\n        /* 管控建议卡片 */\r\n        .suggestion-card {\r\n            padding: 15px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 10px;\r\n            border-left: 3px solid #0ea5e9;\r\n            margin-bottom: 12px;\r\n        }\r\n        \r\n        .suggestion-card:last-child {\r\n            margin-bottom: 0;\r\n        }\r\n        \r\n        .suggestion-title {\r\n            font-size: 14px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            margin-bottom: 8px;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n        }\r\n        \r\n        .suggestion-title i {\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        .suggestion-content {\r\n            font-size: 12px;\r\n            color: #94a3b8;\r\n            line-height: 1.6;\r\n        }\r\n        \r\n        .suggestion-tag {\r\n            display: inline-block;\r\n            padding: 2px 8px;\r\n            border-radius: 4px;\r\n            font-size: 11px;\r\n            margin-top: 8px;\r\n            margin-right: 5px;\r\n        }\r\n        \r\n        .tag-priority {\r\n            background: rgba(239, 68, 68, 0.2);\r\n            color: #ef4444;\r\n            border: 1px solid rgba(239, 68, 68, 0.3);\r\n        }\r\n        \r\n        .tag-improve {\r\n            background: rgba(34, 197, 94, 0.2);\r\n            color: #22c55e;\r\n            border: 1px solid rgba(34, 197, 94, 0.3);\r\n        }\r\n        \r\n        .tag-maintain {\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n        }\r\n        \r\n        /* 导出按钮 */\r\n        .export-btn {\r\n            padding: 8px 16px;\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(34, 197, 94, 0.2));\r\n            border: 1px solid rgba(14, 165, 233, 0.4);\r\n            border-radius: 6px;\r\n            color: #0ea5e9;\r\n            font-size: 13px;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 6px;\r\n        }\r\n        \r\n        .export-btn:hover {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(34, 197, 94, 0.3));\r\n            transform: translateY(-1px);\r\n        }\r\n        \r\n        /* 地图弹窗 */\r\n        .map-popup {\r\n            position: absolute;\r\n            background: rgba(15, 23, 42, 0.95);\r\n            border: 1px solid rgba(14, 165, 233, 0.4);\r\n            border-radius: 12px;\r\n            padding: 20px;\r\n            min-width: 320px;\r\n            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);\r\n            z-index: 1000;\r\n            display: none;\r\n        }\r\n        \r\n        .map-popup.active {\r\n            display: block;\r\n        }\r\n        \r\n        .popup-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 15px;\r\n            padding-bottom: 10px;\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n        }\r\n        \r\n        .popup-title {\r\n            font-size: 18px;\r\n            font-weight: bold;\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .popup-close {\r\n            width: 28px;\r\n            height: 28px;\r\n            border-radius: 50%;\r\n            background: rgba(239, 68, 68, 0.2);\r\n            border: 1px solid rgba(239, 68, 68, 0.4);\r\n            color: #ef4444;\r\n            cursor: pointer;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            transition: all 0.3s;\r\n        }\r\n        \r\n        .popup-close:hover {\r\n            background: rgba(239, 68, 68, 0.3);\r\n        }\r\n        \r\n        .popup-content {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 12px;\r\n        }\r\n        \r\n        .indicator-row {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            padding: 10px 12px;\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border-radius: 8px;\r\n        }\r\n        \r\n        .indicator-info {\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n        }\r\n        \r\n        .indicator-icon {\r\n            width: 32px;\r\n            height: 32px;\r\n            border-radius: 8px;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            font-size: 14px;\r\n        }\r\n        \r\n        .indicator-icon.do { background: rgba(14, 165, 233, 0.2); color: #0ea5e9; }\r\n        .indicator-icon.nh { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }\r\n        .indicator-icon.tp { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }\r\n        \r\n        .indicator-name-popup {\r\n            font-size: 13px;\r\n            color: #94a3b8;\r\n        }\r\n        \r\n        .indicator-value {\r\n            font-size: 16px;\r\n            font-weight: bold;\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .indicator-level {\r\n            padding: 3px 10px;\r\n            border-radius: 20px;\r\n            font-size: 11px;\r\n            font-weight: 500;\r\n        }\r\n        \r\n        .level-1 { background: rgba(0, 228, 0, 0.2); color: #00e400; border: 1px solid rgba(0, 228, 0, 0.3); }\r\n        .level-2 { background: rgba(255, 255, 0, 0.2); color: #ffff00; border: 1px solid rgba(255, 255, 0, 0.3); }\r\n        .level-3 { background: rgba(255, 126, 0, 0.2); color: #ff7e00; border: 1px solid rgba(255, 126, 0, 0.3); }\r\n        \r\n        .rank-info {\r\n            display: flex;\r\n            gap: 15px;\r\n            padding: 12px;\r\n            background: rgba(34, 197, 94, 0.1);\r\n            border-radius: 8px;\r\n            margin-top: 5px;\r\n        }\r\n        \r\n        .rank-box {\r\n            flex: 1;\r\n            text-align: center;\r\n        }\r\n        \r\n        .rank-label {\r\n            font-size: 11px;\r\n            color: #94a3b8;\r\n            margin-bottom: 4px;\r\n        }\r\n        \r\n        .rank-value {\r\n            font-size: 18px;\r\n            font-weight: bold;\r\n            color: #22c55e;\r\n        }\r\n        \r\n        .mini-chart {\r\n            height: 100px;\r\n            margin-top: 10px;\r\n            background: rgba(14, 165, 233, 0.05);\r\n            border-radius: 8px;\r\n        }\r\n        \r\n        /* 响应式 */\r\n        @media (max-width: 1400px) {\r\n            .content-area {\r\n                grid-template-columns: 1fr;\r\n            }\r\n            .bottom-section {\r\n                grid-template-columns: 1fr;\r\n            }\r\n        }\r\n        \r\n        /* 动画 */\r\n        @keyframes fadeIn {\r\n            from { opacity: 0; transform: translateY(10px); }\r\n            to { opacity: 1; transform: translateY(0); }\r\n        }\r\n        \r\n        .animate-fade-in {\r\n            animation: fadeIn 0.5s ease-out;\r\n        }\r\n        \r\n        /* 水质等级图例 */\r\n        .level-legend {\r\n            display: flex;\r\n            gap: 15px;\r\n            align-items: center;\r\n            padding: 8px 15px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 20px;\r\n            font-size: 11px;\r\n        }\r\n        \r\n        .legend-item {\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 5px;\r\n        }\r\n        \r\n        .legend-color {\r\n            width: 12px;\r\n            height: 12px;\r\n            border-radius: 2px;\r\n        }"}</style>
<div className="bg-grid"></div>
    <div className="glow-orb glow-orb-1"></div>
    <div className="glow-orb glow-orb-2"></div>
    
    
    <nav className="top-nav">
        <div className="nav-title">
            <i className="fa fa-map"></i>
            省际空间对比专项屏
        </div>
        <div style={{ "display": "flex", "alignItems": "center", "gap": "20px" }}>
            <div style={{ "color": "#94a3b8", "fontSize": "13px" }}>
                <i className="fa fa-clock-o mr-2"></i>
                <span id="currentTime">--</span>
            </div>
            <button className="nav-back" data-legacy-click="goBack()">
                <i className="fa fa-arrow-left"></i>
                返回大屏
            </button>
        </div>
    </nav>
    
    
    <div className="main-container">
        
        <div className="conclusion-bar animate-fade-in">
            <div className="conclusion-tag tag-1">
                <div className="tag-icon">
                    <i className="fa fa-check-circle"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">六省市达标概况</div>
                    <div className="tag-value">
                        六省市核心指标<span className="tag-highlight">全部达标</span>，溶解氧全域达<span className="tag-highlight">Ⅰ类</span>标准
                    </div>
                </div>
            </div>
            <div className="conclusion-tag tag-2">
                <div className="tag-icon">
                    <i className="fa fa-trophy"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">综合水质排名</div>
                    <div className="tag-value" id="rankingTag">
                        <span className="rank-item"><span className="rank-number rank-1">1</span>山东省</span>
                        <span className="rank-item"><span className="rank-number rank-2">2</span>河北省</span>
                        <span className="rank-item"><span className="rank-number rank-3">3</span>北京市</span>
                        <span className="rank-item"><span className="rank-number rank-other">4</span>山西省</span>
                        <span className="rank-item"><span className="rank-number rank-other">5</span>河南省</span>
                        <span className="rank-item"><span className="rank-number rank-other">6</span>天津市</span>
                    </div>
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
                    <div className="card-title">
                        <i className="fa fa-bar-chart"></i>
                        六省市水质指标对比
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "15px" }}>
                        <div className="level-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#00e400" }}></div>
                                <span style={{ "color": "#00e400" }}>Ⅰ类</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#ffff00" }}></div>
                                <span style={{ "color": "#ffff00" }}>Ⅱ类</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#ff7e00" }}></div>
                                <span style={{ "color": "#ff7e00" }}>Ⅲ类</span>
                            </div>
                        </div>
                        <div className="card-subtitle">点击柱状图查看地图详情</div>
                    </div>
                </div>
                <div className="chart-container" id="barChart"></div>
            </div>
            
            
            <div className="chart-card" style={{ "position": "relative" }}>
                <div className="corner-decoration corner-tl"></div>
                <div className="corner-decoration corner-tr"></div>
                <div className="corner-decoration corner-bl"></div>
                <div className="corner-decoration corner-br"></div>
                
                <div className="card-header">
                    <div className="card-title">
                        <i className="fa fa-globe"></i>
                        津水流域监测站点分布
                    </div>
                    <div className="card-subtitle">点击省市高亮查看详情</div>
                </div>
                <div className="chart-container" id="mapChart"></div>
                
                
                <div className="map-popup" id="mapPopup">
                    <div className="popup-header">
                        <div className="popup-title" id="popupTitle">--</div>
                        <button className="popup-close" data-legacy-click="closePopup()">
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                    <div className="popup-content" id="popupContent">
                        
                    </div>
                </div>
            </div>
        </div>
        
        
        <div className="bottom-section">
            
            <div className="chart-card">
                <div className="corner-decoration corner-tl"></div>
                <div className="corner-decoration corner-tr"></div>
                <div className="corner-decoration corner-bl"></div>
                <div className="corner-decoration corner-br"></div>
                
                <div className="card-header">
                    <div className="card-title">
                        <i className="fa fa-list-ol"></i>
                        省市指标排名表
                    </div>
                    <button className="export-btn" data-legacy-click="exportData()">
                        <i className="fa fa-download"></i>
                        导出数据
                    </button>
                </div>
                <div className="chart-container" style={{ "overflow": "auto" }}>
                    <table className="ranking-table" id="rankingTable">
                        <thead>
                            <tr>
                                <th>综合排名</th>
                                <th>省市</th>
                                <th className="sortable" data-sort="do">溶解氧(mg/L)</th>
                                <th className="sortable" data-sort="nh">氨氮(mg/L)</th>
                                <th className="sortable" data-sort="tp">总磷(mg/L)</th>
                                <th>综合得分</th>
                                <th>水质等级</th>
                            </tr>
                        </thead>
                        <tbody id="rankingTableBody">
                            
                        </tbody>
                    </table>
                </div>
            </div>
            
            
            <div className="chart-card">
                <div className="corner-decoration corner-tl"></div>
                <div className="corner-decoration corner-tr"></div>
                <div className="corner-decoration corner-bl"></div>
                <div className="corner-decoration corner-br"></div>
                
                <div className="card-header">
                    <div className="card-title">
                        <i className="fa fa-lightbulb-o"></i>
                        核心管控建议
                    </div>
                </div>
                <div className="chart-container" id="suggestionsContainer">
                    
                </div>
            </div>
        </div>
    </div>
    </>
  );
}

function RegisterPage() {
  return (
    <>
      <style>{"@layer utilities {\r\n            .bg-gradient-water {\r\n                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n            }\r\n            .bg-gradient-dark {\r\n                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);\r\n            }\r\n            .text-gradient {\r\n                background-clip: text;\r\n                -webkit-background-clip: text;\r\n                color: transparent;\r\n                background-image: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);\r\n            }\r\n            .card-glass {\r\n                background: rgba(255, 255, 255, 0.05);\r\n                backdrop-filter: blur(10px);\r\n                border: 1px solid rgba(255, 255, 255, 0.1);\r\n            }\r\n            .card-shadow {\r\n                box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);\r\n            }\r\n            .input-focus {\r\n                @apply focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none;\r\n            }\r\n            .feature-card {\r\n                @apply p-6 rounded-2xl transition-all duration-500;\r\n                background: rgba(255, 255, 255, 0.03);\r\n                border: 1px solid rgba(255, 255, 255, 0.08);\r\n            }\r\n            .feature-card:hover {\r\n                transform: translateY(-10px);\r\n                background: rgba(255, 255, 255, 0.08);\r\n                border-color: rgba(14, 165, 233, 0.3);\r\n                box-shadow: 0 20px 40px rgba(14, 165, 233, 0.2);\r\n            }\r\n        }\n\nbody {\r\n            background-color: #0f172a;\r\n            overflow-x: hidden;\r\n        }\r\n        #particles-js {\r\n            position: fixed;\r\n            width: 100%;\r\n            height: 100%;\r\n            top: 0;\r\n            left: 0;\r\n            z-index: 0;\r\n        }\r\n        .wave {\r\n            position: absolute;\r\n            bottom: 0;\r\n            left: 0;\r\n            width: 200%;\r\n            height: 100px;\r\n            background: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230ea5e9' fill-opacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") repeat-x;\r\n            animation: wave 8s linear infinite;\r\n        }\r\n        @keyframes wave {\r\n            0% {\r\n                transform: translateX(0);\r\n            }\r\n            100% {\r\n                transform: translateX(-50%);\r\n            }\r\n        }"}</style>
<div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ "animationDelay": "4s" }}></div>
    </div>
    
    
    <div id="particles-js"></div>
    
    
    <div className="wave"></div>
    
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center relative z-10">
        
        <div className="w-full md:w-1/2 space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                    <i className="fa fa-tint text-white text-2xl"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">海河六域</h1>
                    <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                创建账号，进入<br />
                <span className="text-gradient">四大核心模块</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                注册后即可统一访问数据大屏、流域时空推演沙盘、知识图谱和智能问答，形成从分析、推演到溯源解释的一体化使用体验。
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <i className="fa fa-share-alt text-primary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">多维分析</h3>
                        <p className="text-sm text-gray-400">查看省市与指标趋势</p>
                    </div>
                </div>
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <i className="fa fa-comments text-secondary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">推演决策</h3>
                        <p className="text-sm text-gray-400">进入沙盘联动 AI</p>
                    </div>
                </div>
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <i className="fa fa-line-chart text-primary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">图谱溯源</h3>
                        <p className="text-sm text-gray-400">查看上游链路关系</p>
                    </div>
                </div>
                <div className="feature-card p-4 rounded-xl flex items-center space-x-4 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <i className="fa fa-lightbulb-o text-secondary"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">智能问答</h3>
                        <p className="text-sm text-gray-400">获得页面与指标解释</p>
                    </div>
                </div>
            </div>
        </div>
        
        
        <div className="w-full md:w-1/2 animate-slide-up">
            <div className="card-glass rounded-2xl p-8 border border-white/10 card-shadow">
                <h2 className="text-2xl font-bold text-center text-white mb-2">创建平台账号</h2>
                <p className="text-center text-sm text-gray-400 mb-6">完成注册后即可登录并访问当前项目全部核心页面</p>
                <form id="registerForm" className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">账号</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-user"></i>
                            </span>
                            <input type="text" id="username" name="username" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请设置账号" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">密码</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-lock"></i>
                            </span>
                            <input type="password" id="password" name="password" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请设置密码" required />
                            <button type="button" id="togglePassword" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                                <i className="fa fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">确认密码</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-lock"></i>
                            </span>
                            <input type="password" id="confirmPassword" name="confirmPassword" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请再次输入密码" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">邮箱</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <i className="fa fa-envelope"></i>
                            </span>
                            <input type="email" id="email" name="email" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请输入邮箱" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-400 mb-1">验证码</label>
                        <div className="flex space-x-2">
                            <div className="relative flex-grow">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <i className="fa fa-shield"></i>
                                </span>
                                <input type="text" id="verificationCode" name="verificationCode" className="w-full pl-10 pr-4 py-3 border border-dark-lighter rounded-lg input-focus bg-dark-light text-white" placeholder="请输入验证码" required />
                            </div>
                            <button type="button" id="sendCodeBtn" className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">
                                发送验证码
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">使用角色</label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="tag" value="学生" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter" required />
                                <span className="text-sm text-gray-400">学生</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="tag" value="科研人员" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter" />
                                <span className="text-sm text-gray-400">科研人员</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="tag" value="环保工作者" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter" />
                                <span className="text-sm text-gray-400">环保工作者</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="tag" value="教育工作者" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter" />
                                <span className="text-sm text-gray-400">教育工作者</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="tag" value="企业人员" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter" />
                                <span className="text-sm text-gray-400">企业人员</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="tag" value="其他" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter" />
                                <span className="text-sm text-gray-400">其他</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="agreeTerms" name="agreeTerms" className="h-4 w-4 text-primary focus:ring-primary border-dark-lighter rounded" required />
                        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-400">
                            我已阅读并同意<a href="#" className="text-primary hover:underline">用户协议</a>和<a href="#" className="text-primary hover:underline">隐私政策</a>
                        </label>
                    </div>
                    <button type="submit" className="w-full bg-gradient-water text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium">
                        创建账号
                    </button>
                    <div className="text-center text-sm">
                        <span className="text-gray-400">已有账号?</span>
                        <a href="login.html" data-page-link="login.html" className="text-primary font-medium hover:text-white ml-1 transition-colors">立即登录</a>
                    </div>
                </form>
            </div>
            <div className="mt-6 text-center text-sm text-gray-400">
                <p>© 2026 海河六域 版权所有</p>
            </div>
        </div>
    </div>
    </>
  );
}

function SandboxPage() {
  return (
    <>
      <style>{":root {\r\n    --bg: #111b2b;\r\n    --panel: rgba(24, 34, 52, 0.55);\r\n    --panel-deep: rgba(28, 40, 60, 0.6);\r\n    --line: rgba(148, 163, 184, 0.12);\r\n    --text: #f8fafc;\r\n    --muted: #94a3b8;\r\n    --cyan: #38bdf8;\r\n    --cyan-soft: rgba(56, 189, 248, 0.15);\r\n    --teal: #22c55e;\r\n    --amber: #f59e0b;\r\n    --rose: #f43f5e;\r\n    --shadow: 0 8px 32px rgba(0, 0, 0, 0.18);\r\n    --radius: 16px;\r\n}\r\n\r\n* {\r\n    box-sizing: border-box;\r\n}\r\n\r\nhtml,\r\nbody {\r\n    width: 100%;\r\n    min-height: 100%;\r\n    margin: 0;\r\n    overflow-x: hidden;\r\n    overflow-y: auto;\r\n    background:\r\n        radial-gradient(circle at 15% 15%, rgba(39, 182, 255, 0.1), transparent 30%),\r\n        radial-gradient(circle at 82% 14%, rgba(111, 140, 255, 0.06), transparent 28%),\r\n        radial-gradient(circle at 50% 100%, rgba(83, 211, 255, 0.04), transparent 28%),\r\n        linear-gradient(135deg, #0a111e 0%, #111b2b 46%, #121f2f 100%);\r\n    color: var(--text);\r\n    font-family: \"Noto Sans SC\", \"Microsoft YaHei\", sans-serif;\r\n    background-attachment: fixed;\r\n}\r\n\r\nbody::before {\r\n    content: \"\";\r\n    position: fixed;\r\n    inset: 0;\r\n    background-image:\r\n        linear-gradient(rgba(14, 165, 233, 0.035) 1px, transparent 1px),\r\n        linear-gradient(90deg, rgba(14, 165, 233, 0.035) 1px, transparent 1px);\r\n    background-size: 50px 50px;\r\n    pointer-events: none;\r\n    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 92%);\r\n}\r\n\r\n.page-shell {\r\n    position: relative;\r\n    width: min(1800px, calc(100% - 20px));\r\n    min-height: 100vh;\r\n    margin: 0 auto;\r\n    padding: 80px 12px 24px;\r\n}\r\n\r\n.page-shell::before,\r\n.page-shell::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    pointer-events: none;\r\n    z-index: -1;\r\n    filter: blur(10px);\r\n}\r\n\r\n.page-shell::before {\r\n    top: 44px;\r\n    right: -60px;\r\n    width: 320px;\r\n    height: 320px;\r\n    border-radius: 50%;\r\n    background: radial-gradient(circle, rgba(83, 211, 255, 0.1), transparent 70%);\r\n}\r\n\r\n.page-shell::after {\r\n    left: -56px;\r\n    bottom: 120px;\r\n    width: 280px;\r\n    height: 280px;\r\n    border-radius: 50%;\r\n    background: radial-gradient(circle, rgba(111, 140, 255, 0.08), transparent 72%);\r\n}\r\n\r\n.bg-gradient-water {\r\n    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n}\r\n\r\n.nav-link {\r\n    position: relative;\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 0.5rem 1rem;\r\n    color: #d1d5db;\r\n    text-decoration: none;\r\n    transition: all 0.3s;\r\n    border-radius: 0.375rem;\r\n}\r\n\r\n.nav-link:hover {\r\n    color: #fff;\r\n    background: rgba(255, 255, 255, 0.05);\r\n}\r\n\r\n.nav-link.active {\r\n    color: #fff;\r\n    font-weight: 500;\r\n}\r\n\r\n.nav-link::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    bottom: 0;\r\n    left: 50%;\r\n    width: 0;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, #0ea5e9, #22c55e);\r\n    transition: all 0.3s;\r\n    transform: translateX(-50%);\r\n}\r\n\r\n.nav-link:hover::after,\r\n.nav-link.active::after {\r\n    width: 80%;\r\n}\r\n\r\n.nav-core {\r\n    position: relative;\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 0.5rem 1.25rem;\r\n    border-radius: 9999px;\r\n    color: #fff;\r\n    font-weight: 600;\r\n    font-size: 0.875rem;\r\n    text-decoration: none;\r\n    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%);\r\n    box-shadow: 0 0 12px rgba(14, 165, 233, 0.4);\r\n    transition: all 0.3s;\r\n}\r\n\r\n.nav-core:hover {\r\n    box-shadow: 0 0 20px rgba(14, 165, 233, 0.7);\r\n    transform: translateY(-1px);\r\n}\r\n\r\n.topbar {\r\n    display: grid;\r\n    grid-template-columns: 1fr;\r\n    gap: 10px;\r\n    margin-bottom: 12px;\r\n    align-items: start;\r\n}\r\n\r\n.hero,\r\n.panel {\r\n    position: relative;\r\n    background: var(--panel);\r\n    border: 1px solid rgba(148, 163, 184, 0.1);\r\n    border-radius: 16px;\r\n    box-shadow: var(--shadow);\r\n    backdrop-filter: blur(12px);\r\n    overflow: hidden;\r\n}\r\n\r\n.hero {\r\n    padding: 22px 24px;\r\n    background:\r\n        radial-gradient(circle at 100% 0%, rgba(83, 211, 255, 0.08), transparent 32%),\r\n        linear-gradient(135deg, rgba(24, 34, 52, 0.7), rgba(28, 40, 60, 0.5));\r\n}\r\n\r\n.hero::before,\r\n.panel::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    inset: 0;\r\n    border: 1px solid rgba(255, 255, 255, 0.04);\r\n    border-radius: inherit;\r\n    pointer-events: none;\r\n}\r\n\r\n.hero::after,\r\n.panel::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    inset: 0 auto auto 18px;\r\n    width: 64px;\r\n    height: 2px;\r\n    background: linear-gradient(90deg, rgba(56, 189, 248, 0.6), rgba(148, 163, 184, 0.2), transparent);\r\n    pointer-events: none;\r\n}\r\n\r\n.eyebrow {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    margin-bottom: 12px;\r\n    padding: 5px 10px;\r\n    border: 1px solid rgba(83, 211, 255, 0.18);\r\n    border-radius: 999px;\r\n    font-size: 11px;\r\n    letter-spacing: 0.14em;\r\n    text-transform: uppercase;\r\n    color: rgba(141, 174, 192, 0.84);\r\n}\r\n\r\n.hero-main {\r\n    display: flex;\r\n    align-items: flex-end;\r\n    justify-content: space-between;\r\n    gap: 20px;\r\n}\r\n\r\n.hero-copy {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 8px;\r\n}\r\n\r\n.hero h1 {\r\n    margin: 0;\r\n    font-family: \"Rajdhani\", \"Noto Sans SC\", sans-serif;\r\n    font-size: clamp(28px, 2.2vw, 40px);\r\n    line-height: 1;\r\n    letter-spacing: 0.04em;\r\n    color: #f8fafc;\r\n}\r\n\r\n.hero p {\r\n    margin: 0;\r\n    max-width: 720px;\r\n    font-size: 13px;\r\n    line-height: 1.7;\r\n    color: var(--muted);\r\n}\r\n\r\n.hero-summary {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    align-self: center;\r\n    min-height: 48px;\r\n    max-width: 380px;\r\n    padding: 12px 14px;\r\n    border: 1px solid rgba(148, 163, 184, 0.1);\r\n    border-radius: 12px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n    color: #f8fafc;\r\n    font-size: 12px;\r\n    line-height: 1.65;\r\n    text-align: right;\r\n}\r\n\r\n.panel {\r\n    display: flex;\r\n    flex-direction: column;\r\n    min-height: 0;\r\n    padding: 16px;\r\n}\r\n\r\n.panel-head {\r\n    display: flex;\r\n    align-items: flex-start;\r\n    justify-content: space-between;\r\n    gap: 16px;\r\n    margin-bottom: 14px;\r\n}\r\n\r\n.panel-head.compact {\r\n    margin-bottom: 10px;\r\n}\r\n\r\n.panel-head > div:first-child {\r\n    min-width: 0;\r\n}\r\n\r\n.conclusion-panel .panel-head .panel-subtitle {\r\n    display: none;\r\n}\r\n\r\n.panel-title {\r\n    margin: 0;\r\n    font-size: 18px;\r\n    font-weight: 700;\r\n    line-height: 1.2;\r\n    color: #f8fafc;\r\n}\r\n\r\n.panel-subtitle {\r\n    display: block;\r\n    margin-top: 6px;\r\n    font-size: 13px;\r\n    line-height: 1.55;\r\n    color: var(--muted);\r\n}\r\n\r\n.panel-meta {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 6px 10px;\r\n    border-radius: 999px;\r\n    border: 1px solid rgba(148, 163, 184, 0.1);\r\n    background: rgba(255, 255, 255, 0.04);\r\n    font-size: 12px;\r\n    line-height: 1.4;\r\n    color: var(--muted);\r\n    white-space: nowrap;\r\n}\r\n\r\n.hero-summary:empty,\r\n.panel-subtitle:empty,\r\n.panel-meta:empty {\r\n    display: none;\r\n}\r\n\r\n.filter-bar.panel {\r\n    padding: 14px;\r\n}\r\n\r\n.filter-layout {\r\n    display: grid;\r\n    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1.18fr) minmax(220px, 0.78fr) minmax(220px, 0.78fr);\r\n    gap: 10px;\r\n    align-items: start;\r\n}\r\n\r\n.filter-item,\r\n.filter-actions {\r\n    min-height: 100%;\r\n    padding: 10px;\r\n    border: 1px solid rgba(148, 163, 184, 0.1);\r\n    border-radius: 12px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n}\r\n\r\n.filter-item {\r\n    display: grid;\r\n    gap: 8px;\r\n}\r\n\r\n.filter-item.compact {\r\n    align-content: start;\r\n}\r\n\r\n.filter-item-label {\r\n    font-size: 12px;\r\n    font-weight: 700;\r\n    letter-spacing: 0.08em;\r\n    text-transform: uppercase;\r\n    color: #f8fafc;\r\n}\r\n\r\n.filter-actions {\r\n    display: grid;\r\n    grid-template-rows: auto auto auto;\r\n    align-content: start;\r\n    gap: 6px;\r\n}\r\n\r\n.toggle-row,\r\n.tab-row {\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    gap: 8px;\r\n}\r\n\r\n.wrap-row {\r\n    row-gap: 8px;\r\n}\r\n\r\n.toggle-btn,\r\n.check-pill,\r\n.tab {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    gap: 0;\r\n    padding: 7px 12px;\r\n    border: 1px solid rgba(148, 163, 184, 0.15);\r\n    border-radius: 999px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n    color: #cbd5e1;\r\n    cursor: pointer;\r\n    transition: 0.2s ease;\r\n    font-size: 13px;\r\n    font-weight: 600;\r\n}\r\n\r\n.toggle-btn:hover,\r\n.check-pill:hover,\r\n.tab:hover {\r\n    border-color: rgba(56, 189, 248, 0.35);\r\n    background: rgba(255, 255, 255, 0.06);\r\n    transform: translateY(-1px);\r\n}\r\n\r\n.toggle-btn.active,\r\n.check-pill.active,\r\n.tab.active {\r\n    color: #fff;\r\n    border-color: rgba(56, 189, 248, 0.45);\r\n    background: linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(56, 189, 248, 0.15));\r\n    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.15);\r\n}\r\n\r\n.control-hidden {\r\n    display: none !important;\r\n}\r\n\r\n.select-box {\r\n    width: 100%;\r\n    padding: 10px 12px;\r\n    border: 1px solid rgba(148, 163, 184, 0.15);\r\n    background: rgba(255, 255, 255, 0.04);\r\n    color: #f8fafc;\r\n    font-size: 13px;\r\n    border-radius: 12px;\r\n    outline: none;\r\n    appearance: none;\r\n}\r\n\r\n.btn {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    gap: 8px;\r\n    width: 100%;\r\n    min-height: 38px;\r\n    padding: 8px 14px;\r\n    border: 1px solid rgba(148, 163, 184, 0.15);\r\n    border-radius: 999px;\r\n    background: rgba(255, 255, 255, 0.05);\r\n    color: #f8fafc;\r\n    cursor: pointer;\r\n    transition: 0.2s ease;\r\n    font-weight: 600;\r\n    font-size: 13px;\r\n}\r\n\r\n.btn:hover {\r\n    transform: translateY(-1px);\r\n    border-color: rgba(56, 189, 248, 0.35);\r\n    background: rgba(255, 255, 255, 0.08);\r\n}\r\n\r\n.btn.primary {\r\n    color: #fff;\r\n    border-color: rgba(14, 165, 233, 0.4);\r\n    background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(56, 189, 248, 0.2));\r\n}\r\n\r\n.btn:disabled,\r\n.tab:disabled,\r\n.toggle-btn:disabled {\r\n    opacity: 0.55;\r\n    cursor: not-allowed;\r\n    transform: none;\r\n}\r\n\r\n.board {\r\n    display: grid;\r\n    gap: 12px;\r\n}\r\n\r\n.conclusion-top {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 10px;\r\n    margin-bottom: 12px;\r\n}\r\n\r\n.summary-banner {\r\n    display: flex;\r\n    align-items: center;\r\n    min-height: auto;\r\n    padding: 0 0 10px;\r\n    border: none;\r\n    border-bottom: 1px solid rgba(148, 163, 184, 0.1);\r\n    border-radius: 0;\r\n    background: transparent;\r\n    color: var(--text);\r\n    font-size: 13px;\r\n    font-weight: 500;\r\n    line-height: 1.6;\r\n}\r\n\r\n.range-summary {\r\n    display: grid;\r\n    grid-template-columns: 1fr;\r\n    gap: 8px;\r\n}\r\n\r\n.range-box {\r\n    padding: 8px 10px;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-radius: 8px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n}\r\n\r\n.range-box label {\r\n    display: block;\r\n    font-size: 10px;\r\n    letter-spacing: 0.1em;\r\n    text-transform: uppercase;\r\n    color: var(--muted);\r\n}\r\n\r\n.range-box strong {\r\n    display: block;\r\n    margin-top: 4px;\r\n    font-size: 14px;\r\n    line-height: 1.4;\r\n    color: #f8fafc;\r\n}\r\n\r\n.metric-grid {\r\n    display: grid;\r\n    gap: 10px;\r\n}\r\n\r\n.metric-grid-dual {\r\n    grid-template-columns: 1fr;\r\n}\r\n\r\n.metric-card {\r\n    padding: 12px;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-left: 3px solid transparent;\r\n    border-radius: 10px;\r\n    background: rgba(255, 255, 255, 0.03);\r\n    display: flex;\r\n    flex-direction: column;\r\n    justify-content: space-between;\r\n    min-height: 0;\r\n}\r\n\r\n.metric-card.best {\r\n    border-left-color: var(--cyan);\r\n    background: rgba(56, 189, 248, 0.05);\r\n}\r\n\r\n.metric-card header {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 8px;\r\n    margin-bottom: 8px;\r\n}\r\n\r\n.metric-card h3 {\r\n    margin: 0;\r\n    font-size: 15px;\r\n    font-weight: 600;\r\n    line-height: 1.2;\r\n    color: #f8fafc;\r\n}\r\n\r\n.metric-badge {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 3px 8px;\r\n    border-radius: 6px;\r\n    border: none;\r\n    background: rgba(148, 163, 184, 0.12);\r\n    color: var(--muted);\r\n    font-size: 11px;\r\n    font-weight: 500;\r\n    white-space: nowrap;\r\n}\r\n\r\n.metric-card.best .metric-badge {\r\n    background: rgba(245, 158, 11, 0.12);\r\n    color: #fbbf24;\r\n}\r\n\r\n.metric-values {\r\n    display: grid;\r\n    grid-template-columns: repeat(3, 1fr);\r\n    gap: 6px;\r\n}\r\n\r\n.metric-values strong {\r\n    display: block;\r\n    margin-bottom: 2px;\r\n    font-family: \"Rajdhani\", \"Noto Sans SC\", sans-serif;\r\n    font-size: 20px;\r\n    line-height: 1;\r\n    color: #f8fafc;\r\n}\r\n\r\n.metric-values label {\r\n    font-size: 10px;\r\n    color: var(--muted);\r\n    text-transform: uppercase;\r\n    letter-spacing: 0.05em;\r\n}\r\n\r\n.metric-note {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 8px;\r\n    margin-top: 8px;\r\n    padding-top: 6px;\r\n    border-top: 1px solid rgba(148, 163, 184, 0.08);\r\n    color: var(--muted);\r\n    font-size: 11px;\r\n    line-height: 1.5;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.main-visuals {\r\n    display: grid;\r\n    grid-template-columns: minmax(240px, 0.88fr) minmax(400px, 1.5fr) minmax(240px, 0.88fr);\r\n    grid-template-areas:\r\n        \"conclusion time radar\"\r\n        \"conclusion time feature\"\r\n        \"spatial scatter feature\";\r\n    gap: 12px;\r\n    align-items: stretch;\r\n}\r\n\r\n.main-visuals.aggregate-only {\n    grid-template-columns: minmax(260px, 0.92fr) minmax(420px, 1.45fr) minmax(280px, 0.92fr);\n    grid-template-areas:\n        \"conclusion time scatter\";\n}\n\r\n.main-visuals.aggregate-only .scatter-panel {\r\n    min-height: 280px;\r\n}\r\n\r\n.conclusion-panel {\r\n    grid-area: conclusion;\r\n    justify-content: space-between;\r\n}\r\n\r\n.conclusion-panel .metric-grid {\r\n    flex: 1;\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 10px;\r\n    min-height: 0;\r\n}\r\n\r\n.conclusion-panel .metric-grid .metric-card {\r\n    flex: 1;\r\n    min-height: 0;\r\n}\r\n\r\n.time-panel {\r\n    grid-area: time;\r\n}\r\n\r\n.spatial-panel {\r\n    grid-area: spatial;\r\n    min-height: 260px;\r\n}\r\n\r\n.radar-panel {\r\n    grid-area: radar;\r\n    min-height: 260px;\r\n}\r\n\r\n.scatter-panel {\r\n    grid-area: scatter;\r\n    min-height: 260px;\r\n}\r\n\r\n.feature-panel {\r\n    grid-area: feature;\r\n}\r\n\r\n.filter-bar-header {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 12px;\r\n    margin-bottom: 10px;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.filter-bar-header .selection-summary {\r\n    margin-bottom: 0;\r\n    flex: 1;\r\n}\r\n\r\n.filter-bar-side {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: flex-end;\r\n    gap: 12px;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.toolbar-actions {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: flex-end;\r\n    gap: 10px;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.toolbar-actions .btn {\r\n    width: auto;\r\n    min-width: 116px;\r\n}\r\n\r\n.time-partition {\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    gap: 8px;\r\n}\r\n\r\n.time-chip {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 6px 10px;\r\n    border-radius: 999px;\r\n    border: 1px solid rgba(148, 163, 184, 0.12);\r\n    background: rgba(255, 255, 255, 0.04);\r\n    color: var(--muted);\r\n    font-size: 12px;\r\n    font-weight: 600;\r\n}\r\n\r\n.time-chip.active {\r\n    border-color: rgba(14, 165, 233, 0.35);\r\n    background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.12));\r\n    color: #f8fafc;\r\n}\r\n\r\n.chart {\r\n    flex: 1;\r\n    min-height: 120px;\r\n}\r\n\r\n.chart-fixed {\r\n    min-height: 100px;\r\n}\r\n\r\n.time-panel .chart {\r\n    min-height: 280px;\r\n}\r\n\r\n.spatial-panel .chart-surface {\r\n    min-height: 0;\r\n}\r\n\r\n.spatial-panel .chart,\r\n.radar-panel .chart {\r\n    min-height: 140px;\r\n}\r\n\r\n.scatter-panel .chart,\r\n.feature-panel .chart {\r\n    min-height: 120px;\r\n}\r\n\r\n.feature-panel .chart-surface.compact {\r\n    min-height: 0;\r\n}\r\n\r\n.feature-panel .mini-table {\r\n    max-height: 140px;\r\n}\r\n\r\n.chart-surface {\r\n    display: flex;\r\n    flex: 1;\r\n    min-height: 0;\r\n    padding: 10px;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-radius: 12px;\r\n    background: rgba(0, 0, 0, 0.15);\r\n    overflow: hidden;\r\n}\r\n\r\n.time-surface {\r\n    min-height: 0;\r\n}\r\n\r\n.chart-surface.compact {\r\n    min-height: 200px;\r\n}\r\n\r\n.mini-table,\r\n.preview-table {\r\n    overflow: auto;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-radius: 12px;\r\n    background: rgba(255, 255, 255, 0.03);\r\n}\r\n\r\n.mini-table {\r\n    margin-top: 10px;\r\n    max-height: 160px;\r\n}\r\n\r\n.preview-table {\r\n    min-height: 220px;\r\n    max-height: 300px;\r\n}\r\n\r\n.mini-table table,\r\n.preview-table table {\r\n    width: 100%;\r\n    border-collapse: collapse;\r\n    font-size: 13px;\r\n}\r\n\r\n.mini-table th,\r\n.mini-table td,\r\n.preview-table th,\r\n.preview-table td {\r\n    padding: 8px 10px;\r\n    border-bottom: 1px solid rgba(148, 163, 184, 0.08);\r\n    text-align: left;\r\n    white-space: nowrap;\r\n    color: #e2e8f0;\r\n}\r\n\r\n.mini-table th,\r\n.preview-table th {\r\n    position: sticky;\r\n    top: 0;\r\n    background: #1e293b;\r\n    color: var(--muted);\r\n    z-index: 1;\r\n}\r\n\r\n.preview-table tbody tr:hover {\r\n    background: rgba(83, 211, 255, 0.05);\r\n}\r\n\r\n.preview-table tbody tr.row-highlight {\r\n    background: rgba(83, 211, 255, 0.08);\r\n}\r\n\r\n.sortable {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    gap: 6px;\r\n    padding: 0;\r\n    border: none;\r\n    background: transparent;\r\n    color: inherit;\r\n    cursor: pointer;\r\n    font: inherit;\r\n}\r\n\r\n.sort-indicator {\r\n    color: var(--muted);\r\n    font-size: 11px;\r\n    line-height: 1;\r\n}\r\n\r\n.detail-toolbar {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 12px;\r\n    margin-bottom: 10px;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.search-box {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 10px;\r\n    min-width: 260px;\r\n    flex: 1 1 280px;\r\n    padding: 10px 12px;\r\n    border: 1px solid rgba(148, 163, 184, 0.12);\r\n    border-radius: 999px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n}\r\n\r\n.search-box i {\r\n    color: var(--muted);\r\n}\r\n\r\n.search-box input {\r\n    width: 100%;\r\n    border: none;\r\n    outline: none;\r\n    background: transparent;\r\n    color: #f8fafc;\r\n    font-size: 14px;\r\n}\r\n\r\n.search-box input::placeholder {\r\n    color: rgba(148, 163, 184, 0.5);\r\n}\r\n\r\n.preview-meta {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 12px;\r\n    margin-bottom: 10px;\r\n    color: var(--muted);\r\n    font-size: 13px;\r\n    line-height: 1.5;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.inline-actions {\r\n    display: flex;\r\n    gap: 10px;\r\n}\r\n\r\n.inline-actions .btn {\r\n    width: auto;\r\n    min-width: 110px;\r\n}\r\n\r\n.decision-actions {\r\n    justify-content: flex-end;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.decision-actions .btn {\r\n    min-width: 128px;\r\n}\r\n\r\n.decision-panel {\r\n    scroll-margin-top: 96px;\r\n}\r\n\r\n.decision-layout {\r\n    display: grid;\r\n    gap: 12px;\r\n}\r\n\r\n.decision-status {\r\n    padding: 12px 14px;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-radius: 12px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n    color: #e2e8f0;\r\n    font-size: 14px;\r\n    line-height: 1.7;\r\n}\r\n\r\n.decision-facts {\r\n    display: grid;\r\n    grid-template-columns: repeat(4, minmax(0, 1fr));\r\n    gap: 10px;\r\n}\r\n\r\n.decision-fact {\r\n    padding: 12px;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-radius: 12px;\r\n    background: rgba(255, 255, 255, 0.03);\r\n}\r\n\r\n.decision-fact.is-link {\r\n    cursor: pointer;\r\n    position: relative;\r\n}\r\n\r\n.decision-fact.is-link::after {\r\n    content: '\\f08e';\r\n    position: absolute;\r\n    top: 12px;\r\n    right: 12px;\r\n    color: rgba(83, 211, 255, 0.75);\r\n    font: normal normal normal 14px/1 FontAwesome;\r\n}\r\n\r\n.decision-fact label {\r\n    display: block;\r\n    margin-bottom: 8px;\r\n    color: var(--muted);\r\n    font-size: 11px;\r\n    font-weight: 700;\r\n    letter-spacing: 0.08em;\r\n    text-transform: uppercase;\r\n}\r\n\r\n.decision-fact strong {\r\n    display: block;\r\n    margin-bottom: 8px;\r\n    color: #f8fafc;\r\n    font-size: 15px;\r\n    line-height: 1.55;\r\n}\r\n\r\n.decision-fact p {\r\n    margin: 0;\r\n    color: var(--muted);\r\n    font-size: 12px;\r\n    line-height: 1.7;\r\n}\r\n\r\n.decision-report {\r\n    min-height: 260px;\r\n    padding: 16px 18px;\r\n    border: 1px solid rgba(148, 163, 184, 0.08);\r\n    border-radius: 12px;\r\n    background: rgba(0, 0, 0, 0.15);\r\n    color: #e2e8f0;\r\n    font-size: 14px;\r\n    line-height: 1.9;\r\n    white-space: pre-wrap;\r\n}\r\n\r\n.decision-report.empty {\r\n    min-height: 220px;\r\n    white-space: normal;\r\n}\r\n\r\n.pill {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    padding: 4px 9px;\r\n    border-radius: 999px;\r\n    border: 1px solid rgba(14, 165, 233, 0.15);\r\n    background: rgba(14, 165, 233, 0.08);\r\n    color: #bae6fd;\r\n    font-size: 12px;\r\n}\r\n\r\n.pill.best-arima {\r\n    border-color: rgba(56, 189, 248, 0.2);\r\n    background: rgba(56, 189, 248, 0.1);\r\n}\r\n\r\n.pill.best-lstm {\r\n    border-color: rgba(99, 102, 241, 0.2);\r\n    background: rgba(99, 102, 241, 0.1);\r\n}\r\n\r\n.selection-summary {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 8px;\r\n    min-height: 42px;\r\n    padding: 10px 14px;\r\n    margin-bottom: 12px;\r\n    border: 1px solid rgba(148, 163, 184, 0.1);\r\n    border-radius: 10px;\r\n    background: rgba(255, 255, 255, 0.04);\r\n    color: #f8fafc;\r\n    font-size: 14px;\r\n    font-weight: 600;\r\n    line-height: 1.5;\r\n}\r\n\r\n.selection-summary:empty {\r\n    display: none;\r\n}\r\n\r\n.empty {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    min-height: 220px;\r\n    padding: 18px;\r\n    color: var(--muted);\r\n    font-size: 14px;\r\n    text-align: center;\r\n    line-height: 1.7;\r\n}\r\n\r\n.loading {\r\n    position: fixed;\r\n    inset: 0;\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    flex-direction: column;\r\n    gap: 14px;\r\n    background: rgba(10, 16, 28, 0.75);\r\n    backdrop-filter: blur(8px);\r\n    z-index: 300;\r\n}\r\n\r\n.loading.hidden {\r\n    display: none !important;\r\n}\r\n\r\n.spinner {\r\n    width: 52px;\r\n    height: 52px;\r\n    border-radius: 50%;\r\n    border: 3px solid rgba(14, 165, 233, 0.12);\r\n    border-top-color: var(--cyan);\r\n    animation: spin 1s linear infinite;\r\n}\r\n\r\n@keyframes spin {\r\n    to {\r\n        transform: rotate(360deg);\r\n    }\r\n}\r\n\r\n@media (max-width: 1560px) {\r\n    .filter-layout {\r\n        grid-template-columns: repeat(4, minmax(0, 1fr));\r\n    }\r\n}\r\n\r\n@media (max-width: 1240px) {\r\n    .page-shell {\r\n        width: calc(100% - 18px);\r\n        padding: 88px 9px 28px;\r\n    }\r\n\r\n    .topbar {\r\n        grid-template-columns: 1fr;\r\n    }\r\n\r\n    .conclusion-top {\r\n        flex-direction: column;\r\n        align-items: flex-start;\r\n    }\r\n\r\n    .filter-layout,\r\n    .metric-grid-dual {\r\n        grid-template-columns: 1fr 1fr;\r\n    }\r\n\r\n    .panel-head,\r\n    .preview-meta {\r\n        flex-direction: column;\r\n        align-items: flex-start;\r\n    }\r\n\r\n    .decision-facts {\r\n        grid-template-columns: 1fr 1fr;\r\n    }\r\n\r\n    .range-summary {\r\n        grid-template-columns: repeat(2, minmax(0, 1fr));\r\n    }\r\n\r\n    .main-visuals {\r\n        grid-template-columns: 1fr 1fr;\r\n        grid-template-areas:\r\n            \"conclusion time\"\r\n            \"radar time\"\r\n            \"spatial scatter\"\r\n            \"feature feature\";\r\n        align-items: stretch;\r\n    }\r\n\r\n    .main-visuals.aggregate-only {\n        grid-template-columns: 1fr 1fr;\n        grid-template-areas:\n            \"conclusion time\"\n            \"scatter scatter\";\n    }\n\r\n    .spatial-panel,\r\n    .radar-panel,\r\n    .scatter-panel {\r\n        min-height: 220px;\r\n    }\r\n\r\n    .toolbar-actions .btn {\r\n        min-width: 108px;\r\n    }\r\n}\r\n\r\n@media (max-width: 860px) {\r\n    .page-shell {\r\n        width: calc(100% - 14px);\r\n        padding: 84px 7px 22px;\r\n    }\r\n\r\n    .panel {\r\n        padding: 12px;\r\n    }\r\n\r\n    .filter-layout,\r\n    .metric-grid-dual,\r\n    .metric-values {\r\n        grid-template-columns: 1fr;\r\n    }\r\n\r\n    .filter-bar-side,\r\n    .toolbar-actions {\r\n        width: 100%;\r\n        justify-content: stretch;\r\n    }\r\n\r\n    .detail-toolbar,\r\n    .preview-meta {\r\n        align-items: stretch;\r\n    }\r\n\r\n    .search-box {\r\n        min-width: 0;\r\n    }\r\n\r\n    .inline-actions {\r\n        width: 100%;\r\n    }\r\n\r\n    .inline-actions .btn,\r\n    .toolbar-actions .btn {\r\n        width: 100%;\r\n    }\r\n\r\n    .decision-facts {\r\n        grid-template-columns: 1fr;\r\n    }\r\n\r\n    .decision-report {\r\n        min-height: 220px;\r\n        padding: 14px;\r\n    }\r\n\r\n    .main-visuals {\r\n        grid-template-columns: 1fr;\r\n        grid-template-areas:\r\n            \"conclusion\"\r\n            \"time\"\r\n            \"radar\"\r\n            \"spatial\"\r\n            \"scatter\"\r\n            \"feature\";\r\n        align-items: stretch;\r\n    }\r\n\r\n    .main-visuals.aggregate-only {\n        grid-template-columns: 1fr;\n        grid-template-areas:\n            \"conclusion\"\n            \"time\"\n            \"scatter\";\n    }\n\r\n    .spatial-panel,\r\n    .radar-panel,\r\n    .scatter-panel {\r\n        min-height: 200px;\r\n    }\r\n\r\n    .time-panel .chart {\r\n        min-height: 360px;\r\n    }\r\n\r\n    .chart,\r\n    .chart-fixed {\r\n        min-height: 240px;\r\n    }\r\n}\r\n\r\n/* ==================== 动画关键帧 ==================== */\r\n@keyframes cardEnter {\r\n    0% { opacity: 0; transform: translateY(24px) scale(0.98); }\r\n    100% { opacity: 1; transform: translateY(0) scale(1); }\r\n}\r\n\r\n@keyframes borderGlow {\r\n    0% { border-color: rgba(56, 189, 248, 0.1); }\r\n    50% { border-color: rgba(56, 189, 248, 0.35); }\r\n    100% { border-color: rgba(56, 189, 248, 0.1); }\r\n}\r\n\r\n@keyframes shimmer {\r\n    0% { background-position: -200% 0; }\r\n    100% { background-position: 200% 0; }\r\n}\r\n\r\n@keyframes pulseGlow {\r\n    0%, 100% { box-shadow: 0 0 4px rgba(14, 165, 233, 0.1); }\r\n    50% { box-shadow: 0 0 16px rgba(14, 165, 233, 0.25), 0 0 32px rgba(14, 165, 233, 0.1); }\r\n}\r\n\r\n@keyframes cornerScan {\r\n    0% { clip-path: inset(0 98% 98% 0); }\r\n    25% { clip-path: inset(0 0 98% 0); }\r\n    50% { clip-path: inset(0 0 0 98%); }\r\n    75% { clip-path: inset(98% 0 0 0); }\r\n    100% { clip-path: inset(0 98% 98% 0); }\r\n}\r\n\r\n@keyframes metricPulse {\r\n    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.15); }\r\n    70% { box-shadow: 0 0 0 8px rgba(56, 189, 248, 0); }\r\n    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }\r\n}\r\n\r\n@keyframes btnShine {\r\n    0% { left: -100%; }\r\n    100% { left: 200%; }\r\n}\r\n\r\n/* ==================== 卡片增强 ==================== */\r\n.panel {\r\n    animation: cardEnter 0.6s ease-out both;\r\n    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),\r\n                box-shadow 0.35s ease,\r\n                border-color 0.35s ease;\r\n}\r\n\r\n/* 面板逐个渐入 —— 基于在 DOM 中的顺序 */\r\n.board > .panel:nth-child(1) { animation-delay: 0.05s; }\r\n.board > .panel:nth-child(2) { animation-delay: 0.12s; }\r\n.board > .panel:nth-child(3) { animation-delay: 0.19s; }\r\n.board > .panel:nth-child(4) { animation-delay: 0.26s; }\r\n.board > .panel:nth-child(5) { animation-delay: 0.33s; }\r\n.main-visuals > .panel:nth-child(1) { animation-delay: 0.08s; }\r\n.main-visuals > .panel:nth-child(2) { animation-delay: 0.16s; }\r\n.main-visuals > .panel:nth-child(3) { animation-delay: 0.24s; }\r\n.main-visuals > .panel:nth-child(4) { animation-delay: 0.32s; }\r\n.main-visuals > .panel:nth-child(5) { animation-delay: 0.40s; }\r\n.main-visuals > .panel:nth-child(6) { animation-delay: 0.48s; }\r\n\r\n.panel:hover {\r\n    transform: translateY(-4px);\r\n    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35),\r\n                0 0 24px rgba(14, 165, 233, 0.08),\r\n                inset 0 1px 0 rgba(255, 255, 255, 0.06);\r\n    border-color: rgba(56, 189, 248, 0.25);\r\n}\r\n\r\n/* 面板顶部流光装饰线 */\r\n.panel::after {\r\n    width: 80px;\r\n    height: 2px;\r\n    background: linear-gradient(90deg,\r\n        rgba(56, 189, 248, 0.7),\r\n        rgba(34, 197, 94, 0.4),\r\n        transparent);\r\n    transition: width 0.5s ease;\r\n}\r\n\r\n.panel:hover::after {\r\n    width: 140px;\r\n}\r\n\r\n/* 面板角落扫描线伪元素 */\r\n.panel::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    inset: 0;\r\n    border-radius: inherit;\r\n    border: 1px solid transparent;\r\n    pointer-events: none;\r\n    transition: border-color 0.4s ease;\r\n}\r\n\r\n.panel:hover::before {\r\n    border-color: rgba(56, 189, 248, 0.15);\r\n    animation: cornerScan 3s linear infinite;\r\n}\r\n\r\n/* 核心结论区特殊流光背景 */\r\n.conclusion-panel:hover {\r\n    background:\r\n        radial-gradient(circle at 100% 0%, rgba(83, 211, 255, 0.12), transparent 32%),\r\n        linear-gradient(135deg, rgba(24, 34, 52, 0.75), rgba(28, 40, 60, 0.55));\r\n}\r\n\r\n/* ==================== 按钮增强 ==================== */\r\n.btn {\r\n    position: relative;\r\n    overflow: hidden;\r\n    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n\r\n/* 按钮扫光效果 */\r\n.btn::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: -100%;\r\n    width: 60%;\r\n    height: 100%;\r\n    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);\r\n    transform: skewX(-20deg);\r\n    pointer-events: none;\r\n    transition: none;\r\n}\r\n\r\n.btn:hover::before {\r\n    animation: btnShine 0.7s ease-out;\r\n}\r\n\r\n.btn:hover {\r\n    transform: translateY(-2px) scale(1.02);\r\n    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.2),\r\n                0 0 12px rgba(14, 165, 233, 0.15);\r\n}\r\n\r\n.btn:active {\r\n    transform: translateY(0) scale(0.98);\r\n    transition-duration: 0.1s;\r\n}\r\n\r\n.btn.primary {\r\n    animation: pulseGlow 3s ease-in-out infinite;\r\n}\r\n\r\n.btn.primary:hover {\r\n    animation: none;\r\n    box-shadow: 0 8px 28px rgba(14, 165, 233, 0.35),\r\n                0 0 20px rgba(14, 165, 233, 0.25);\r\n}\r\n\r\n/* ==================== 切换按钮 / 标签增强 ==================== */\r\n.toggle-btn,\r\n.check-pill,\r\n.tab {\r\n    position: relative;\r\n    overflow: hidden;\r\n    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n\r\n.toggle-btn:hover,\r\n.check-pill:hover,\r\n.tab:hover {\r\n    transform: translateY(-2px) scale(1.03);\r\n    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.15);\r\n}\r\n\r\n.toggle-btn.active,\r\n.check-pill.active,\r\n.tab.active {\r\n    animation: borderGlow 2.5s ease-in-out infinite;\r\n}\r\n\r\n.toggle-btn.active::after,\r\n.check-pill.active::after,\r\n.tab.active::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    inset: -1px;\r\n    border-radius: inherit;\r\n    border: 1px solid rgba(56, 189, 248, 0.3);\r\n    pointer-events: none;\r\n    animation: pulseGlow 2s ease-in-out infinite;\r\n}\r\n\r\n/* ==================== Metric Card 增强 ==================== */\r\n.metric-card {\r\n    position: relative;\r\n    overflow: hidden;\r\n    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n\r\n.metric-card::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    height: 1px;\r\n    background: linear-gradient(90deg,\r\n        transparent,\r\n        rgba(56, 189, 248, 0.2),\r\n        transparent);\r\n    opacity: 0;\r\n    transition: opacity 0.4s ease;\r\n}\r\n\r\n.metric-card:hover::before {\r\n    opacity: 1;\r\n}\r\n\r\n.metric-card:hover {\r\n    transform: translateY(-3px) scale(1.01);\r\n    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25),\r\n                0 0 16px rgba(56, 189, 248, 0.1);\r\n    border-color: rgba(56, 189, 248, 0.2);\r\n}\r\n\r\n.metric-card.best {\r\n    animation: metricPulse 3s ease-in-out infinite;\r\n}\r\n\r\n.metric-card.best:hover {\r\n    animation: none;\r\n    border-left-color: var(--cyan);\r\n    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25),\r\n                0 0 20px rgba(56, 189, 248, 0.15),\r\n                inset 2px 0 0 rgba(56, 189, 248, 0.3);\r\n}\r\n\r\n/* 数值变化闪烁（由 JS 动态添加 .value-flash） */\r\n.value-flash {\r\n    animation: valueFlash 0.6s ease-out;\r\n}\r\n\r\n@keyframes valueFlash {\r\n    0% { color: #fff; text-shadow: 0 0 12px rgba(56, 189, 248, 0.8); }\r\n    100% { color: #f8fafc; text-shadow: none; }\r\n}\r\n\r\n/* ==================== Filter Item 增强 ==================== */\r\n.filter-item,\r\n.filter-actions {\r\n    transition: all 0.3s ease;\r\n}\r\n\r\n.filter-item:hover,\r\n.filter-actions:hover {\r\n    border-color: rgba(56, 189, 248, 0.2);\r\n    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);\r\n    transform: translateY(-1px);\r\n}\r\n\r\n/* ==================== Range Box 增强 ==================== */\r\n.range-box {\r\n    transition: all 0.3s ease;\r\n}\r\n\r\n.range-box:hover {\r\n    border-color: rgba(56, 189, 248, 0.2);\r\n    transform: translateY(-1px);\r\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);\r\n}\r\n\r\n/* ==================== Decision Fact 增强 ==================== */\r\n.decision-fact {\r\n    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n\r\n.decision-fact:hover {\r\n    transform: translateY(-2px);\r\n    border-color: rgba(56, 189, 248, 0.2);\r\n    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);\r\n}\r\n\r\n/* ==================== Decision Report 增强 ==================== */\r\n.decision-report {\r\n    transition: all 0.3s ease;\r\n}\r\n\r\n.decision-report:not(.empty):hover {\r\n    border-color: rgba(56, 189, 248, 0.15);\r\n    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(14, 165, 233, 0.03);\r\n}\r\n\r\n/* ==================== Search Box 增强 ==================== */\r\n.search-box {\r\n    transition: all 0.3s ease;\r\n}\r\n\r\n.search-box:focus-within {\r\n    border-color: rgba(56, 189, 248, 0.35);\r\n    box-shadow: 0 0 16px rgba(14, 165, 233, 0.12);\r\n    transform: translateY(-1px);\r\n}\r\n\r\n/* ==================== Time Chip 增强 ==================== */\r\n.time-chip {\r\n    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n\r\n.time-chip:hover {\r\n    transform: translateY(-1px) scale(1.05);\r\n}\r\n\r\n.time-chip.active {\r\n    animation: borderGlow 2.5s ease-in-out infinite;\r\n}\r\n\r\n/* ==================== Chart Surface 增强 ==================== */\r\n.chart-surface {\r\n    transition: all 0.35s ease;\r\n}\r\n\r\n.chart-surface:hover {\r\n    border-color: rgba(56, 189, 248, 0.15);\r\n    box-shadow: inset 0 0 30px rgba(14, 165, 233, 0.04);\r\n}\r\n\r\n/* ==================== Pill 标签增强 ==================== */\r\n.pill {\r\n    transition: all 0.25s ease;\r\n}\r\n\r\n.pill:hover {\r\n    transform: translateY(-1px) scale(1.05);\r\n    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);\r\n}\r\n\r\n/* ==================== 表格行悬浮增强 ==================== */\r\n.preview-table tbody tr {\r\n    transition: background 0.2s ease;\r\n}\r\n\r\n.preview-table tbody tr:hover {\r\n    background: rgba(83, 211, 255, 0.08);\r\n    transform: scale(1.002);\r\n}\r\n\r\n\r\n/* ==================== 精简顶部筛选器 ==================== */\r\n.floating-actions {\r\n    display: flex;\r\n    gap: 6px;\r\n}\r\n\r\n.action-icon {\r\n    display: inline-flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    width: 28px;\r\n    height: 28px;\r\n    border-radius: 8px;\r\n    border: 1px solid rgba(148, 163, 184, 0.15);\r\n    background: rgba(255, 255, 255, 0.05);\r\n    color: #f8fafc;\r\n    font-size: 12px;\r\n    cursor: pointer;\r\n    transition: all 0.25s ease;\r\n}\r\n\r\n.action-icon:hover {\r\n    background: rgba(14, 165, 233, 0.15);\r\n    border-color: rgba(14, 165, 233, 0.35);\r\n    transform: translateY(-1px);\r\n    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);\r\n}\r\n\r\n.compact-bar {\r\n    grid-template-columns: repeat(4, minmax(0, 1fr));\r\n    gap: 8px;\r\n}\r\n\r\n.filter-bar.panel {\r\n    padding: 10px 12px;\r\n    overflow: visible;\r\n    z-index: 40;\r\n}\r\n\r\n.filter-bar-header {\r\n    margin-bottom: 6px;\r\n}\r\n\r\n.filter-item {\r\n    padding: 8px;\r\n    gap: 4px;\r\n}\r\n\r\n.filter-item-label {\r\n    font-size: 11px;\r\n}\r\n\r\n.filter-dropdown {\r\n    position: relative;\r\n}\r\n\r\n.filter-summary {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    gap: 6px;\r\n    min-height: 28px;\r\n    padding: 4px 8px;\r\n    border-radius: 8px;\r\n    border: 1px solid rgba(148, 163, 184, 0.12);\r\n    background: rgba(255, 255, 255, 0.04);\r\n    font-size: 12px;\r\n    color: #f8fafc;\r\n}\r\n\r\n.filter-summary span {\r\n    white-space: nowrap;\r\n    overflow: hidden;\r\n    text-overflow: ellipsis;\r\n}\r\n\r\n.expand-btn.micro {\r\n    width: 20px;\r\n    height: 20px;\r\n    padding: 0;\r\n    margin: 0;\r\n    border-radius: 5px;\r\n    border: none;\r\n    background: rgba(255, 255, 255, 0.08);\r\n    color: #94a3b8;\r\n    font-size: 10px;\r\n    display: inline-flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    flex-shrink: 0;\r\n}\r\n\r\n.expand-btn.micro:hover {\r\n    background: rgba(14, 165, 233, 0.2);\r\n    color: #f8fafc;\r\n}\r\n\r\n.filter-popover {\r\n    position: absolute;\r\n    top: calc(100% + 6px);\r\n    left: 0;\r\n    min-width: 220px;\r\n    max-width: 320px;\r\n    padding: 12px;\r\n    border-radius: 12px;\r\n    border: 1px solid rgba(14, 165, 233, 0.35);\r\n    background: rgba(15, 23, 42, 0.98);\r\n    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55), 0 0 24px rgba(14, 165, 233, 0.12);\r\n    backdrop-filter: blur(16px);\r\n    z-index: 200;\r\n    display: none;\r\n    animation: popoverIn 0.2s ease-out;\r\n}\r\n\r\n.filter-popover.open {\r\n    display: block;\r\n}\r\n\r\n.popover-section {\r\n    margin-bottom: 10px;\r\n}\r\n\r\n.popover-section:last-child {\r\n    margin-bottom: 0;\r\n}\r\n\r\n.popover-label {\r\n    font-size: 11px;\r\n    font-weight: 700;\r\n    letter-spacing: 0.08em;\r\n    text-transform: uppercase;\r\n    color: #e2e8f0;\r\n    margin-bottom: 6px;\r\n}\r\n\r\n@keyframes popoverIn {\r\n    0% { opacity: 0; transform: translateY(-6px); }\r\n    100% { opacity: 1; transform: translateY(0); }\r\n}\r\n\r\n/* ==================== 精简结论区指标卡片 ==================== */\r\n.metric-card.compact-metric {\r\n    padding: 10px 12px;\r\n}\r\n\r\n.metric-card.compact-metric .metric-values {\r\n    grid-template-columns: 1fr;\r\n    gap: 4px;\r\n}\r\n\r\n.metric-card.compact-metric .metric-values strong {\r\n    font-size: 22px;\r\n}\r\n\r\n.metric-tooltip {\r\n    position: relative;\r\n}\r\n\r\n.metric-tooltip .tooltip-body {\r\n    position: absolute;\r\n    bottom: calc(100% + 8px);\r\n    left: 0;\r\n    min-width: 180px;\r\n    padding: 10px 12px;\r\n    border-radius: 10px;\r\n    border: 1px solid rgba(14, 165, 233, 0.2);\r\n    background: rgba(24, 34, 52, 0.96);\r\n    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);\r\n    backdrop-filter: blur(10px);\r\n    font-size: 12px;\r\n    color: #e2e8f0;\r\n    opacity: 0;\r\n    visibility: hidden;\r\n    transform: translateY(4px);\r\n    transition: all 0.2s ease;\r\n    z-index: 50;\r\n    pointer-events: none;\r\n}\r\n\r\n.metric-tooltip:hover .tooltip-body {\r\n    opacity: 1;\r\n    visibility: visible;\r\n    transform: translateY(0);\r\n}\r\n\r\n.metric-tooltip .tooltip-body::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    top: 100%;\r\n    left: 20px;\r\n    border: 6px solid transparent;\r\n    border-top-color: rgba(24, 34, 52, 0.96);\r\n}\r\n\r\n@media (max-width: 1560px) {\r\n    .compact-bar {\r\n        grid-template-columns: auto repeat(3, minmax(0, 1fr));\r\n    }\r\n}\r\n"}</style>
<header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="w-full px-6">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
                        <i className="fa fa-tint text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">海河六域</h1>
                        <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
                    </div>
                </div>

                
                <nav className="hidden md:flex space-x-1">
                    <a href="index.html" data-page-link="index.html" className="nav-link">
                        <i className="fa fa-home mr-2"></i>
                        <span>首页</span>
                    </a>
                    <a href="dashboard.html" data-page-link="dashboard.html" className="nav-link">
                        <i className="fa fa-dashboard mr-2"></i>
                        <span>数据大屏</span>
                    </a>
                    <a href="sandbox.html" data-page-link="sandbox.html" className="nav-core mx-2">
                        <i className="fa fa-globe mr-2"></i><span>流域时空推演沙盘</span>
                    </a>
                    <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="nav-link">
                        <i className="fa fa-project-diagram mr-2"></i>
                        <span>知识图谱</span>
                    </a>
                    <a href="chat.html" data-page-link="chat.html" className="nav-link">
                        <i className="fa fa-robot mr-2"></i>
                        <span>智能问答</span>
                    </a>
                </nav>

                <div className="flex items-center space-x-4">
                    <form className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-white/10 transition-colors" data-nav-search>
                        <i className="fa fa-search text-gray-400 mr-2"></i>
                        <input type="search" className="w-40 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none" placeholder="搜索功能或页面" />
                    </form>
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <i className="fa fa-bell text-lg"></i>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none" id="userMenuBtn">
                            <div className="w-8 h-8 rounded-full bg-gradient-water flex items-center justify-center">
                                <i className="fa fa-user text-white"></i>
                            </div>
                            <span className="text-sm font-medium text-gray-300 hidden md:inline" id="userName">用户名</span>
                            <i className="fa fa-chevron-down text-xs text-gray-400"></i>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-lg shadow-2xl py-2 z-50 hidden border border-white/10" id="userMenu">
                            <a href="profile.html" data-page-link="profile.html" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-user-o mr-2"></i>个人中心
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i className="fa fa-cog mr-2"></i>设置
                            </a>
                            <div className="border-t border-white/10 my-1"></div>
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" data-legacy-click="logout()">
                                <i className="fa fa-sign-out mr-2"></i>退出登录
                            </a>
                        </div>
                    </div>
                    <button className="md:hidden text-gray-400 hover:text-white" id="mobileMenuBtn">
                        <i className="fa fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <div className="md:hidden bg-dark-light border-t border-white/10 hidden" id="mobileMenu">
            <div className="container mx-auto px-4 py-2 space-y-1">
                <a href="index.html" data-page-link="index.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-home mr-2"></i>首页
                </a>
                <a href="dashboard.html" data-page-link="dashboard.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-dashboard mr-2"></i>数据大屏
                </a>
                <a href="sandbox.html" data-page-link="sandbox.html" className="block px-4 py-3 text-white bg-gradient-water rounded-lg transition-colors">
                    <i className="fa fa-globe mr-2"></i>流域时空推演沙盘
                </a>
                <a href="knowledge-graph.html" data-page-link="knowledge-graph.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-project-diagram mr-2"></i>知识图谱
                </a>
                <a href="chat.html" data-page-link="chat.html" className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <i className="fa fa-robot mr-2"></i>智能问答
                </a>
            </div>
        </div>
    </header>

    <div className="page-shell">
        <header className="topbar">
            <section className="filter-bar panel">
                <div className="filter-bar-header">
                    <div className="selection-summary" id="selectionSummary">--</div>
                    <div className="filter-bar-side">
                        <div className="toolbar-actions floating-actions">
                            <button className="action-icon" id="refreshOverviewBtn" title="刷新"><i className="fa fa-refresh"></i></button>
                            <button className="action-icon" id="exportGlobalBtn" title="导出"><i className="fa fa-download"></i></button>
                        </div>
                    </div>
                </div>
                <div className="filter-layout compact-bar">
                    <div className="filter-item filter-dropdown" id="provinceDropdown">
                        <div className="filter-item-label">省市</div>
                        <div className="filter-summary"><span id="provinceCurrent">全流域</span><button className="expand-btn micro" id="provinceExpandBtn"><i className="fa fa-chevron-down"></i></button></div>
                        <div className="filter-popover" id="provincePopover">
                            <div className="popover-section"><div className="popover-label">范围</div><div className="toggle-row" id="scopeToggleRow"></div></div>
                            <div className="popover-section"><div className="popover-label">省市</div><div className="toggle-row wrap-row" id="provinceGrid"></div></div>
                        </div>
                    </div>
                    <div className="filter-item filter-dropdown" id="indicatorDropdown">
                        <div className="filter-item-label">指标</div>
                        <div className="filter-summary"><span id="indicatorCurrent">--</span><button className="expand-btn micro" id="indicatorExpandBtn"><i className="fa fa-chevron-down"></i></button></div>
                        <div className="filter-popover" id="indicatorPopover">
                            <div className="toggle-row wrap-row" id="indicatorTagRow"></div>
                            <select className="select-box control-hidden" id="indicatorSelect"></select>
                        </div>
                    </div>
                    <div className="filter-item compact">
                        <div className="filter-item-label">时间</div>
                        <div className="toggle-row" id="timeModeGroup"></div>
                    </div>
                    <div className="filter-item compact">
                        <div className="filter-item-label">模型</div>
                        <div className="toggle-row" id="modelModeGroup"></div>
                    </div>
                </div>
            </section>
        </header>

        <main className="board">
            <section className="main-visuals">
                <section className="panel conclusion-panel">
                    <div className="panel-head">
                        <div>
                            <h2 className="panel-title">核心结论区</h2>
                            <div className="panel-subtitle"></div>
                        </div>
                    </div>
                    <div className="conclusion-top">
                        <div className="summary-banner" id="summaryBanner">--</div>
                        <div className="range-summary">
                            <div className="range-box">
                                <label>历史监测</label>
                                <strong id="historyRange">--</strong>
                            </div>
                            <div className="range-box">
                                <label>3个月预测</label>
                                <strong id="predictionRange">--</strong>
                            </div>
                        </div>
                    </div>
                    <div className="metric-grid metric-grid-dual" id="metricGrid"></div>
                </section>
                <section className="panel spatial-panel">
                    <div className="panel-head">
                        <div>
                            <h2 className="panel-title" id="spatialTitle">省市对比热力图</h2>
                            <div className="panel-subtitle" id="spatialSubtitle">--</div>
                        </div>
                        <div className="panel-meta" id="spatialMeta">--</div>
                    </div>
                    <div className="chart-surface">
                        <div className="chart chart-fixed" id="spatialChart"></div>
                    </div>
                </section>

                <section className="panel time-panel">
                    <div className="panel-head">
                        <div>
                            <h2 className="panel-title" id="timeTitle">真实监测值 VS 模型预测值</h2>
                            <div className="panel-subtitle" id="timeSubtitle">--</div>
                        </div>
                        <div className="time-partition">
                            <span className="time-chip" id="historyChip">历史监测</span>
                            <span className="time-chip" id="forecastChip">3个月预测</span>
                        </div>
                    </div>
                    <div className="chart-surface time-surface">
                        <div className="chart" id="timeChart"></div>
                    </div>
                </section>

                <section className="panel radar-panel">
                    <div className="panel-head">
                        <div>
                            <h2 className="panel-title" id="radarTitle">多指标雷达</h2>
                            <div className="panel-subtitle" id="radarSubtitle">--</div>
                        </div>
                        <div className="panel-meta" id="radarMeta">--</div>
                    </div>
                    <div className="chart" id="radarChart"></div>
                </section>

                <section className="panel scatter-panel">
                    <div className="panel-head">
                        <div>
                            <h2 className="panel-title" id="scatterTitle">误差散点</h2>
                            <div className="panel-subtitle" id="scatterSubtitle">--</div>
                        </div>
                    </div>
                    <div className="chart chart-fixed" id="scatterChart"></div>
                </section>

                <section className="panel feature-panel">
                    <div className="panel-head">
                        <div>
                            <h2 className="panel-title" id="featureTitle">特征重要性</h2>
                            <div className="panel-subtitle" id="featureSubtitle">--</div>
                        </div>
                    </div>
                    <div className="chart-surface compact">
                        <div className="chart chart-fixed" id="featureChart"></div>
                    </div>
                    <div className="mini-table" style={{ "marginTop": "12px" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>特征</th>
                                    <th>核心权重</th>
                                </tr>
                            </thead>
                            <tbody id="featureTableBody"></tbody>
                        </table>
                    </div>
                </section>
            </section>

            <section className="panel decision-panel" id="decisionPanel">
                <div className="panel-head">
                    <div>
                        <h2 className="panel-title" id="decisionTitle">AI治理决策</h2>
                        <div className="panel-subtitle" id="decisionSubtitle">选择单个省份后，可结合预测数据与溯源图谱生成分省治理方案。</div>
                    </div>
                    <div className="inline-actions decision-actions">
                        <button className="btn primary" id="generateDecisionBtn">
                            <i className="fa fa-magic"></i>
                            <span>生成决策</span>
                        </button>
                        <button className="btn" id="refreshDecisionBtn">
                            <i className="fa fa-refresh"></i>
                            <span>重新生成</span>
                        </button>
                    </div>
                </div>
                <div className="decision-layout">
                    <div className="decision-status" id="decisionStatus">当前尚未生成治理方案。</div>
                    <div className="decision-facts" id="decisionFacts"></div>
                    <div className="decision-report empty" id="decisionReport">选择单个省份后点击“生成决策”，系统会结合 3 个月预测结果与 Neo4j 溯源图谱生成治理建议。</div>
                </div>
            </section>

            <section className="panel detail-panel">
                <div className="panel-head">
                    <div>
                        <h2 className="panel-title" id="exportTitle">数据明细表格</h2>
                        <div className="panel-subtitle" id="exportSubtitle"></div>
                    </div>
                    <div className="panel-meta" id="exportMeta">--</div>
                </div>
                <div className="detail-toolbar">
                    <label className="search-box">
                        <i className="fa fa-search"></i>
                        <input type="text" id="detailSearchInput" placeholder="搜索省市或最优模型" />
                    </label>
                    <div className="tab-row" id="detailFilterTabs"></div>
                </div>
                <div className="preview-meta">
                    <span id="detailSummary">--</span>
                    <div className="inline-actions">
                        <button className="btn" id="detailResetBtn">重置筛选</button>
                    </div>
                </div>
                <div className="preview-table" id="detailTableWrap"></div>
            </section>
        </main>
    </div>

    <div className="loading" id="loadingMask">
        <div className="spinner"></div>
        <div>数据同步中...</div>
    </div>
    </>
  );
}

function TrendAnalysisPage() {
  return (
    <>
      <style>{"* {\r\n            margin: 0;\r\n            padding: 0;\r\n            box-sizing: border-box;\r\n        }\r\n        \r\n        html, body {\r\n            width: 100%;\r\n            min-height: 100%;\r\n            overflow-x: hidden;\r\n            overflow-y: auto;\r\n            font-family: 'Microsoft YaHei', sans-serif;\r\n            background: linear-gradient(135deg, #0a0f1c 0%, #0d1321 50%, #0a0f1c 100%);\r\n            color: #fff;\r\n        }\r\n        \r\n        /* 科技感背景网格 */\r\n        .bg-grid {\r\n            position: fixed;\r\n            top: 0;\r\n            left: 0;\r\n            width: 100%;\r\n            height: 100%;\r\n            background-image: \r\n                linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),\r\n                linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);\r\n            background-size: 50px 50px;\r\n            pointer-events: none;\r\n            z-index: 0;\r\n        }\r\n        \r\n        /* 发光装饰 */\r\n        .glow-orb {\r\n            position: fixed;\r\n            border-radius: 50%;\r\n            filter: blur(100px);\r\n            pointer-events: none;\r\n            z-index: 0;\r\n        }\r\n        \r\n        .glow-orb-1 {\r\n            top: -10%;\r\n            left: -10%;\r\n            width: 400px;\r\n            height: 400px;\r\n            background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);\r\n        }\r\n        \r\n        .glow-orb-2 {\r\n            bottom: -10%;\r\n            right: -10%;\r\n            width: 500px;\r\n            height: 500px;\r\n            background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);\r\n        }\r\n        \r\n        /* 主容器 */\r\n        .main-container {\r\n            position: relative;\r\n            top: 64px;\r\n            left: 0;\r\n            right: 0;\r\n            min-height: calc(100vh - 64px);\r\n            padding: 20px;\r\n            z-index: 1;\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 20px;\r\n            padding-bottom: 40px;\r\n        }\r\n        \r\n        /* 顶部导航栏 */\r\n        .top-nav {\r\n            position: fixed;\r\n            top: 0;\r\n            left: 0;\r\n            right: 0;\r\n            height: 64px;\r\n            background: rgba(15, 23, 42, 0.95);\r\n            backdrop-filter: blur(10px);\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n            z-index: 100;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            padding: 0 30px;\r\n        }\r\n        \r\n        .nav-title {\r\n            font-size: 22px;\r\n            font-weight: bold;\r\n            background: linear-gradient(90deg, #0ea5e9, #22c55e);\r\n            -webkit-background-clip: text;\r\n            -webkit-text-fill-color: transparent;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 12px;\r\n        }\r\n        \r\n        .nav-back {\r\n            padding: 8px 20px;\r\n            background: rgba(14, 165, 233, 0.15);\r\n            border: 1px solid rgba(14, 165, 233, 0.4);\r\n            border-radius: 6px;\r\n            color: #0ea5e9;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n            font-size: 14px;\r\n        }\r\n        \r\n        .nav-back:hover {\r\n            background: rgba(14, 165, 233, 0.3);\r\n            transform: translateY(-1px);\r\n        }\r\n        \r\n        /* 核心结论栏 */\r\n        .conclusion-bar {\r\n            display: flex;\r\n            gap: 20px;\r\n            padding: 15px 20px;\r\n            background: linear-gradient(90deg, \r\n                rgba(14, 165, 233, 0.1) 0%, \r\n                rgba(34, 197, 94, 0.05) 50%,\r\n                rgba(14, 165, 233, 0.1) 100%);\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n            border-radius: 12px;\r\n            position: relative;\r\n            overflow: hidden;\r\n        }\r\n        \r\n        .conclusion-bar::before {\r\n            content: '';\r\n            position: absolute;\r\n            top: 0;\r\n            left: 0;\r\n            right: 0;\r\n            height: 2px;\r\n            background: linear-gradient(90deg, \r\n                transparent 0%, \r\n                #0ea5e9 20%, \r\n                #22c55e 50%, \r\n                #0ea5e9 80%, \r\n                transparent 100%);\r\n        }\r\n        \r\n        .conclusion-tag {\r\n            flex: 1;\r\n            padding: 15px 20px;\r\n            background: rgba(15, 23, 42, 0.6);\r\n            border-radius: 10px;\r\n            border: 1px solid;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 15px;\r\n            transition: all 0.3s;\r\n        }\r\n        \r\n        .conclusion-tag:hover {\r\n            transform: translateY(-2px);\r\n            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);\r\n        }\r\n        \r\n        .conclusion-tag.tag-1 {\r\n            border-color: rgba(0, 228, 0, 0.4);\r\n            background: linear-gradient(135deg, rgba(0, 228, 0, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .conclusion-tag.tag-2 {\r\n            border-color: rgba(14, 165, 233, 0.4);\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .conclusion-tag.tag-3 {\r\n            border-color: rgba(34, 197, 94, 0.4);\r\n            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);\r\n        }\r\n        \r\n        .tag-icon {\r\n            width: 50px;\r\n            height: 50px;\r\n            border-radius: 12px;\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: center;\r\n            font-size: 24px;\r\n        }\r\n        \r\n        .tag-1 .tag-icon {\r\n            background: rgba(0, 228, 0, 0.2);\r\n            color: #00e400;\r\n        }\r\n        \r\n        .tag-2 .tag-icon {\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        .tag-3 .tag-icon {\r\n            background: rgba(34, 197, 94, 0.2);\r\n            color: #22c55e;\r\n        }\r\n        \r\n        .tag-content {\r\n            flex: 1;\r\n        }\r\n        \r\n        .tag-title {\r\n            font-size: 13px;\r\n            color: #94a3b8;\r\n            margin-bottom: 4px;\r\n        }\r\n        \r\n        .tag-value {\r\n            font-size: 18px;\r\n            font-weight: bold;\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .tag-highlight {\r\n            color: #22c55e;\r\n            font-weight: bold;\r\n        }\r\n        \r\n        /* 主体内容区 */\r\n        .content-area {\r\n            display: grid;\r\n            grid-template-columns: 1fr 360px;\r\n            gap: 20px;\r\n            min-height: 800px;\r\n        }\r\n        \r\n        /* 图表卡片 */\r\n        .chart-card {\r\n            background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);\r\n            border: 1px solid rgba(14, 165, 233, 0.2);\r\n            border-radius: 12px;\r\n            padding: 20px;\r\n            position: relative;\r\n            overflow: hidden;\r\n            display: flex;\r\n            flex-direction: column;\r\n        }\r\n        \r\n        /* 科技感四角装饰 */\r\n        .chart-card::before,\r\n        .chart-card::after {\r\n            content: '';\r\n            position: absolute;\r\n            width: 20px;\r\n            height: 20px;\r\n            border: 2px solid #0ea5e9;\r\n        }\r\n        \r\n        .chart-card::before {\r\n            top: 0;\r\n            left: 0;\r\n            border-right: none;\r\n            border-bottom: none;\r\n            border-top-left-radius: 8px;\r\n        }\r\n        \r\n        .chart-card::after {\r\n            bottom: 0;\r\n            right: 0;\r\n            border-left: none;\r\n            border-top: none;\r\n            border-bottom-right-radius: 8px;\r\n        }\r\n        \r\n        .corner-decoration {\r\n            position: absolute;\r\n            width: 20px;\r\n            height: 20px;\r\n            border: 2px solid #0ea5e9;\r\n        }\r\n        \r\n        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-top-left-radius: 8px; }\r\n        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; border-top-right-radius: 8px; }\r\n        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; border-bottom-left-radius: 8px; }\r\n        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; border-bottom-right-radius: 8px; }\r\n        \r\n        /* 卡片标题 */\r\n        .card-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 15px;\r\n            padding-bottom: 10px;\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.2);\r\n            flex-shrink: 0;\r\n        }\r\n        \r\n        .card-title {\r\n            font-size: 16px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 10px;\r\n        }\r\n        \r\n        .card-title i {\r\n            color: #0ea5e9;\r\n            font-size: 18px;\r\n        }\r\n        \r\n        .card-subtitle {\r\n            font-size: 12px;\r\n            color: #64748b;\r\n        }\r\n        \r\n        /* 图表容器 */\r\n        .chart-container {\r\n            flex: 1;\r\n            min-height: 0;\r\n            position: relative;\r\n        }\r\n        \r\n        /* 主视觉区 */\r\n        .main-visual {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 15px;\r\n            height: fit-content;\r\n        }\r\n        \r\n        .indicator-chart {\r\n            height: 280px;\r\n            min-height: 280px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 10px;\r\n            border: 1px solid rgba(14, 165, 233, 0.15);\r\n            padding: 15px;\r\n            display: flex;\r\n            flex-direction: column;\r\n        }\r\n        \r\n        .indicator-header {\r\n            display: flex;\r\n            align-items: center;\r\n            justify-content: space-between;\r\n            margin-bottom: 10px;\r\n        }\r\n        \r\n        .indicator-name {\r\n            font-size: 14px;\r\n            font-weight: 600;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n        }\r\n        \r\n        .indicator-name.do { color: #0ea5e9; }\r\n        .indicator-name.ph { color: #22c55e; }\r\n        .indicator-name.nh { color: #f59e0b; }\r\n        \r\n        .indicator-badge {\r\n            padding: 3px 10px;\r\n            border-radius: 20px;\r\n            font-size: 11px;\r\n            font-weight: 500;\r\n        }\r\n        \r\n        .badge-level-1 { background: rgba(0, 228, 0, 0.2); color: #00e400; border: 1px solid rgba(0, 228, 0, 0.3); }\r\n        .badge-level-2 { background: rgba(255, 255, 0, 0.2); color: #ffff00; border: 1px solid rgba(255, 255, 0, 0.3); }\r\n        .badge-level-3 { background: rgba(255, 126, 0, 0.2); color: #ff7e00; border: 1px solid rgba(255, 126, 0, 0.3); }\r\n        \r\n        .indicator-chart-container {\r\n            flex: 1;\r\n            min-height: 0;\r\n        }\r\n        \r\n        /* 右侧辅助分析区 */\r\n        .right-panel {\r\n            display: flex;\r\n            flex-direction: column;\r\n            gap: 15px;\r\n            height: fit-content;\r\n        }\r\n        \r\n        .right-panel .chart-card {\r\n            min-height: 200px;\r\n        }\r\n        \r\n        /* 统计表格样式 */\r\n        .stats-table {\r\n            width: 100%;\r\n            border-collapse: collapse;\r\n            font-size: 12px;\r\n        }\r\n        \r\n        .stats-table th,\r\n        .stats-table td {\r\n            padding: 10px 8px;\r\n            text-align: center;\r\n            border-bottom: 1px solid rgba(14, 165, 233, 0.1);\r\n        }\r\n        \r\n        .stats-table th {\r\n            background: rgba(14, 165, 233, 0.1);\r\n            color: #0ea5e9;\r\n            font-weight: 600;\r\n            font-size: 11px;\r\n        }\r\n        \r\n        .stats-table td {\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .stats-table tr:hover td {\r\n            background: rgba(14, 165, 233, 0.05);\r\n        }\r\n        \r\n        .stats-indicator {\r\n            font-weight: 600;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 6px;\r\n        }\r\n        \r\n        .stats-indicator.do { color: #0ea5e9; }\r\n        .stats-indicator.ph { color: #22c55e; }\r\n        .stats-indicator.nh { color: #f59e0b; }\r\n        \r\n        /* 趋势检验结果 */\r\n        .trend-result {\r\n            padding: 12px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 8px;\r\n            border-left: 3px solid #0ea5e9;\r\n            margin-bottom: 10px;\r\n        }\r\n        \r\n        .trend-result:last-child {\r\n            margin-bottom: 0;\r\n        }\r\n        \r\n        .trend-label {\r\n            font-size: 12px;\r\n            color: #94a3b8;\r\n            margin-bottom: 4px;\r\n        }\r\n        \r\n        .trend-value {\r\n            font-size: 14px;\r\n            font-weight: 600;\r\n            color: #e2e8f0;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 8px;\r\n        }\r\n        \r\n        .trend-status {\r\n            padding: 2px 8px;\r\n            border-radius: 4px;\r\n            font-size: 11px;\r\n        }\r\n        \r\n        .status-improving {\r\n            background: rgba(34, 197, 94, 0.2);\r\n            color: #22c55e;\r\n        }\r\n        \r\n        .status-stable {\r\n            background: rgba(14, 165, 233, 0.2);\r\n            color: #0ea5e9;\r\n        }\r\n        \r\n        /* 工具栏 */\r\n        .toolbar {\r\n            display: flex;\r\n            gap: 10px;\r\n            padding: 10px 15px;\r\n            background: rgba(15, 23, 42, 0.6);\r\n            border-radius: 8px;\r\n            margin-bottom: 15px;\r\n        }\r\n        \r\n        .tool-btn {\r\n            padding: 6px 14px;\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border: 1px solid rgba(14, 165, 233, 0.3);\r\n            border-radius: 6px;\r\n            color: #94a3b8;\r\n            font-size: 12px;\r\n            cursor: pointer;\r\n            transition: all 0.3s;\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 6px;\r\n        }\r\n        \r\n        .tool-btn:hover {\r\n            background: rgba(14, 165, 233, 0.25);\r\n            color: #e2e8f0;\r\n        }\r\n        \r\n        .tool-btn.active {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(34, 197, 94, 0.3));\r\n            color: #fff;\r\n            border-color: #0ea5e9;\r\n        }\r\n        \r\n        /* 水质等级图例 */\r\n        .level-legend {\r\n            display: flex;\r\n            gap: 15px;\r\n            align-items: center;\r\n            padding: 8px 15px;\r\n            background: rgba(15, 23, 42, 0.5);\r\n            border-radius: 20px;\r\n            font-size: 11px;\r\n        }\r\n        \r\n        .legend-item {\r\n            display: flex;\r\n            align-items: center;\r\n            gap: 5px;\r\n        }\r\n        \r\n        .legend-color {\r\n            width: 12px;\r\n            height: 12px;\r\n            border-radius: 2px;\r\n        }\r\n        \r\n        /* 自定义滚动条 */\r\n        ::-webkit-scrollbar {\r\n            width: 8px;\r\n            height: 8px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-track {\r\n            background: rgba(14, 165, 233, 0.1);\r\n            border-radius: 4px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-thumb {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.5), rgba(34, 197, 94, 0.5));\r\n            border-radius: 4px;\r\n        }\r\n        \r\n        ::-webkit-scrollbar-thumb:hover {\r\n            background: linear-gradient(135deg, rgba(14, 165, 233, 0.7), rgba(34, 197, 94, 0.7));\r\n        }\r\n        \r\n        /* 响应式 */\r\n        @media (max-width: 1400px) {\r\n            .content-area {\r\n                grid-template-columns: 1fr 320px;\r\n            }\r\n        }\r\n        \r\n        @media (max-width: 1200px) {\r\n            .content-area {\r\n                grid-template-columns: 1fr;\r\n            }\r\n            .right-panel {\r\n                flex-direction: row;\r\n                flex-wrap: wrap;\r\n            }\r\n            .right-panel .chart-card {\r\n                flex: 1;\r\n                min-width: 300px;\r\n            }\r\n        }\r\n        \r\n        /* 动画 */\r\n        @keyframes fadeIn {\r\n            from { opacity: 0; transform: translateY(10px); }\r\n            to { opacity: 1; transform: translateY(0); }\r\n        }\r\n        \r\n        .animate-fade-in {\r\n            animation: fadeIn 0.5s ease-out;\r\n        }"}</style>
<div className="bg-grid"></div>
    <div className="glow-orb glow-orb-1"></div>
    <div className="glow-orb glow-orb-2"></div>
    
    
    <nav className="top-nav">
        <div className="nav-title">
            <i className="fa fa-line-chart"></i>
            时序趋势专项分析屏
        </div>
        <div style={{ "display": "flex", "alignItems": "center", "gap": "20px" }}>
            <div style={{ "color": "#94a3b8", "fontSize": "13px" }}>
                <i className="fa fa-clock-o mr-2"></i>
                <span id="currentTime">--</span>
            </div>
            <button className="nav-back" data-legacy-click="goBack()">
                <i className="fa fa-arrow-left"></i>
                返回大屏
            </button>
        </div>
    </nav>
    
    
    <div className="main-container">
        
        <div className="conclusion-bar animate-fade-in">
            <div className="conclusion-tag tag-1">
                <div className="tag-icon">
                    <i className="fa fa-tint"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">溶解氧达标情况</div>
                    <div className="tag-value">
                        <span className="tag-highlight">95%</span> 以上时间达 <span className="tag-highlight">Ⅰ类</span> 标准
                    </div>
                </div>
            </div>
            <div className="conclusion-tag tag-2">
                <div className="tag-icon">
                    <i className="fa fa-flask"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">PH 稳定范围</div>
                    <div className="tag-value">
                        全程稳定在 <span className="tag-highlight">8.0-8.5</span>，100% 符合国标
                    </div>
                </div>
            </div>
            <div className="conclusion-tag tag-3">
                <div className="tag-icon">
                    <i className="fa fa-filter"></i>
                </div>
                <div className="tag-content">
                    <div className="tag-title">氨氮达标情况</div>
                    <div className="tag-value">
                        <span className="tag-highlight">90%</span> 以上时间达 <span className="tag-highlight">Ⅱ类</span> 标准，无超标
                    </div>
                </div>
            </div>
        </div>
        
        
        <div className="content-area">
            
            <div className="chart-card main-visual">
                <div className="corner-decoration corner-tl"></div>
                <div className="corner-decoration corner-tr"></div>
                <div className="corner-decoration corner-bl"></div>
                <div className="corner-decoration corner-br"></div>
                
                <div className="card-header">
                    <div className="card-title">
                        <i className="fa fa-area-chart"></i>
                        三指标分栏时序趋势图
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "15px" }}>
                        <div className="level-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#00e400" }}></div>
                                <span style={{ "color": "#00e400" }}>Ⅰ类</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#ffff00" }}></div>
                                <span style={{ "color": "#ffff00" }}>Ⅱ类</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#ff7e00" }}></div>
                                <span style={{ "color": "#ff7e00" }}>Ⅲ类</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#ff0000" }}></div>
                                <span style={{ "color": "#ff0000" }}>Ⅳ类</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ "background": "#99004c" }}></div>
                                <span style={{ "color": "#99004c" }}>Ⅴ类</span>
                            </div>
                        </div>
                        <div className="card-subtitle">全周期时间维度变化规律</div>
                    </div>
                </div>
                
                
                <div className="toolbar">
                    <button className="tool-btn active" data-legacy-click="switchView('all')">
                        <i className="fa fa-th-large"></i>全指标视图
                    </button>
                    <button className="tool-btn" data-legacy-click="switchView('do')">
                        <i className="fa fa-tint"></i>溶解氧放大
                    </button>
                    <button className="tool-btn" data-legacy-click="switchView('ph')">
                        <i className="fa fa-flask"></i>PH放大
                    </button>
                    <button className="tool-btn" data-legacy-click="switchView('nh')">
                        <i className="fa fa-filter"></i>氨氮放大
                    </button>
                    <button className="tool-btn" data-legacy-click="toggleCompare()">
                        <i className="fa fa-exchange"></i>多指标对比
                    </button>
                </div>
                
                
                <div className="indicator-chart" id="doChartContainer" style={{ "height": "280px" }}>
                    <div className="indicator-header">
                        <div className="indicator-name do">
                            <i className="fa fa-tint"></i>
                            溶解氧 (DO)
                        </div>
                        <div style={{ "display": "flex", "gap": "8px" }}>
                            <span className="indicator-badge badge-level-1">Ⅰ类 ≥7.5</span>
                            <span className="indicator-badge badge-level-2">Ⅱ类 ≥6.0</span>
                            <span className="indicator-badge badge-level-3">Ⅲ类 ≥5.0</span>
                        </div>
                    </div>
                    <div className="indicator-chart-container" id="doChart"></div>
                </div>
                
                
                <div className="indicator-chart" id="phChartContainer" style={{ "height": "280px" }}>
                    <div className="indicator-header">
                        <div className="indicator-name ph">
                            <i className="fa fa-flask"></i>
                            PH 值
                        </div>
                        <div style={{ "display": "flex", "gap": "8px" }}>
                            <span className="indicator-badge badge-level-1">国标 6-9</span>
                        </div>
                    </div>
                    <div className="indicator-chart-container" id="phChart"></div>
                </div>
                
                
                <div className="indicator-chart" id="nhChartContainer" style={{ "height": "280px" }}>
                    <div className="indicator-header">
                        <div className="indicator-name nh">
                            <i className="fa fa-filter"></i>
                            氨氮 (NH₃-N)
                        </div>
                        <div style={{ "display": "flex", "gap": "8px" }}>
                            <span className="indicator-badge badge-level-1">Ⅰ类 ≤0.15</span>
                            <span className="indicator-badge badge-level-2">Ⅱ类 ≤0.50</span>
                            <span className="indicator-badge badge-level-3">Ⅲ类 ≤1.0</span>
                        </div>
                    </div>
                    <div className="indicator-chart-container" id="nhChart"></div>
                </div>
            </div>
            
            
            <div className="right-panel">
                
                <div className="chart-card" style={{ "minHeight": "220px" }}>
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-table"></i>
                            指标极值统计表
                        </div>
                    </div>
                    <div className="chart-container">
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>指标</th>
                                    <th>最大值</th>
                                    <th>最小值</th>
                                    <th>平均值</th>
                                    <th>中位值</th>
                                    <th>达标率</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="stats-indicator do">
                                            <i className="fa fa-tint"></i>溶解氧
                                        </div>
                                    </td>
                                    <td style={{ "color": "#22c55e" }}>12.5</td>
                                    <td style={{ "color": "#f59e0b" }}>6.8</td>
                                    <td>9.59</td>
                                    <td>9.43</td>
                                    <td style={{ "color": "#22c55e", "fontWeight": "bold" }}>100%</td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="stats-indicator ph">
                                            <i className="fa fa-flask"></i>PH
                                        </div>
                                    </td>
                                    <td style={{ "color": "#22c55e" }}>8.8</td>
                                    <td style={{ "color": "#22c55e" }}>7.8</td>
                                    <td>8.14</td>
                                    <td>8.1</td>
                                    <td style={{ "color": "#22c55e", "fontWeight": "bold" }}>100%</td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="stats-indicator nh">
                                            <i className="fa fa-filter"></i>氨氮
                                        </div>
                                    </td>
                                    <td style={{ "color": "#f59e0b" }}>0.45</td>
                                    <td style={{ "color": "#22c55e" }}>0.02</td>
                                    <td>0.167</td>
                                    <td>0.15</td>
                                    <td style={{ "color": "#22c55e", "fontWeight": "bold" }}>98.5%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                
                <div className="chart-card" style={{ "minHeight": "280px" }}>
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-bar-chart"></i>
                            分时段趋势对比
                        </div>
                        <div className="card-subtitle">汛期/非汛期、年度均值</div>
                    </div>
                    <div className="chart-container" id="seasonChart"></div>
                </div>
                
                
                <div className="chart-card" style={{ "minHeight": "240px" }}>
                    <div className="corner-decoration corner-tl"></div>
                    <div className="corner-decoration corner-tr"></div>
                    <div className="corner-decoration corner-bl"></div>
                    <div className="corner-decoration corner-br"></div>
                    
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-check-circle"></i>
                            Mann-Kendall 趋势检验
                        </div>
                    </div>
                    <div className="chart-container" id="trendTestContainer">
                        <div className="trend-result">
                            <div className="trend-label">溶解氧趋势</div>
                            <div className="trend-value" id="doTrend">
                                <i className="fa fa-spinner fa-spin" style={{ "color": "#0ea5e9" }}></i>
                                计算中...
                            </div>
                        </div>
                        <div className="trend-result">
                            <div className="trend-label">PH 稳定性</div>
                            <div className="trend-value" id="phTrend">
                                <i className="fa fa-spinner fa-spin" style={{ "color": "#0ea5e9" }}></i>
                                计算中...
                            </div>
                        </div>
                        <div className="trend-result">
                            <div className="trend-label">氨氮变化</div>
                            <div className="trend-value" id="nhTrend">
                                <i className="fa fa-spinner fa-spin" style={{ "color": "#0ea5e9" }}></i>
                                计算中...
                            </div>
                        </div>
                        <div style={{ "marginTop": "12px", "padding": "10px", "background": "rgba(14, 165, 233, 0.05)", "borderRadius": "6px", "fontSize": "11px", "color": "#64748b", "lineHeight": "1.6" }} id="trendConclusion">
                            <i className="fa fa-info-circle" style={{ "color": "#0ea5e9", "marginRight": "5px" }}></i>
                            正在分析水质变化趋势...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}

const legacyPages = {
  "boxplot-analysis.html": { title: "海河六域 - 指标分布与异常预警专项屏", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: ["const API_BASE = window.HAIHE_RUNTIME?.resolveApi\r\n                        ? window.HAIHE_RUNTIME.resolveApi('/api').replace(/\\/$/, '')\r\n                        : window.location.protocol === 'file:'\r\n                            ? 'http://127.0.0.1:5001/api'\r\n                            : `${window.location.origin}/api`;\r\n        \r\n        let charts = {};\r\n        let boxplotData = null;\r\n        \r\n        const indicatorConfig = {\r\n            '溶解氧': { unit: 'mg/L', level1: 7.5, level2: 6.0, level3: 5.0, higherBetter: true },\r\n            '氨氮': { unit: 'mg/L', level1: 0.15, level2: 0.5, level3: 1.0, higherBetter: false },\r\n            '总磷': { unit: 'mg/L', level1: 0.02, level2: 0.1, level3: 0.2, higherBetter: false },\r\n            '高锰酸盐指数': { unit: 'mg/L', level1: 2.0, level2: 4.0, level3: 6.0, higherBetter: false },\r\n            'PH': { unit: '', min: 6.0, max: 9.0, higherBetter: null }\r\n        };\r\n        \r\n        document.addEventListener('DOMContentLoaded', function() {\r\n            loadData();\r\n            updateTime();\r\n            setInterval(updateTime, 1000);\r\n        });\r\n        \r\n        function updateTime() {\r\n            const now = new Date();\r\n            document.getElementById('currentTime').textContent = now.toLocaleString('zh-CN');\r\n        }\r\n        \r\n        function goBack() {\r\n            window.location.href = 'dashboard.html';\r\n        }\r\n        \r\n        async function loadData() {\r\n            try {\r\n                console.log('Loading data from:', API_BASE);\r\n                const response = await fetch(API_BASE + '/dashboard/boxplot-data');\r\n                const result = await response.json();\r\n                console.log('Response:', result);\r\n                \r\n                if (result.success && result.data && result.data.indicators && result.data.indicators.length > 0) {\r\n                    boxplotData = result.data;\r\n                    renderAll();\r\n                    if (result.data.message) {\r\n                        showToast(result.data.message);\r\n                    }\r\n                } else {\r\n                    renderEmptyState((result.data && result.data.message) || result.error || '暂无真实箱线分析数据');\r\n                }\r\n            } catch (error) {\r\n                console.error('Error:', error);\r\n                renderEmptyState('数据加载失败，未加载到真实箱线分析数据');\r\n            }\r\n        }\r\n\r\n        function clearChartInstances() {\r\n            Object.values(charts).forEach(chart => {\r\n                if (chart) {\r\n                    chart.dispose();\r\n                }\r\n            });\r\n            charts = {};\r\n        }\r\n        \r\n        function renderAll() {\r\n            renderBoxplots();\r\n            updateStatsTable();\r\n            updateThresholdPanel();\r\n            updateStabilityPanel();\r\n        }\r\n        \r\n        function renderBoxplots() {\r\n            const container = document.getElementById('boxplotGrid');\r\n            container.innerHTML = '';\r\n            \r\n            boxplotData.indicators.forEach((indicator, index) => {\r\n                const item = document.createElement('div');\r\n                item.className = 'boxplot-item';\r\n                item.innerHTML = `\r\n                    <div class=\"boxplot-info\">\r\n                        <div class=\"boxplot-name\">${indicator.name}</div>\r\n                        <div class=\"boxplot-stats\">\r\n                            中位数: ${indicator.statistics.median}${indicator.unit}<br>\r\n                            IQR: ${indicator.statistics.iqr}<br>\r\n                            异常值: ${indicator.outlier_count}个\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"boxplot-chart\" id=\"boxplot_${index}\"></div>\r\n                `;\r\n                container.appendChild(item);\r\n                \r\n                setTimeout(() => renderSingleBoxplot(index, indicator), 0);\r\n            });\r\n        }\r\n        \r\n        function renderSingleBoxplot(index, indicator) {\r\n            const chartDom = document.getElementById(`boxplot_${index}`);\r\n            if (!chartDom) return;\r\n            \r\n            const chart = echarts.init(chartDom);\r\n            charts[`boxplot_${index}`] = chart;\r\n            \r\n            const config = indicatorConfig[indicator.name];\r\n            const boxData = indicator.boxplot;\r\n            const outliers = boxplotData.outliers && boxplotData.outliers[index] ? boxplotData.outliers[index].outliers : [];\r\n            \r\n            const outlierData = outliers.map(o => [0, o.value, o]);\r\n            \r\n            const markLines = [];\r\n            if (config) {\r\n                if (indicator.name === 'PH') {\r\n                    markLines.push({ yAxis: config.min, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: '国标下限', color: '#ef4444' } });\r\n                    markLines.push({ yAxis: config.max, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: '国标上限', color: '#ef4444' } });\r\n                } else if (config.higherBetter) {\r\n                    markLines.push({ yAxis: config.level1, lineStyle: { color: '#22c55e', type: 'dashed' }, label: { formatter: 'Ⅰ类', color: '#22c55e' } });\r\n                    markLines.push({ yAxis: config.level2, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: 'Ⅱ类', color: '#f59e0b' } });\r\n                    markLines.push({ yAxis: config.level3, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: 'Ⅲ类', color: '#ef4444' } });\r\n                } else {\r\n                    markLines.push({ yAxis: config.level1, lineStyle: { color: '#22c55e', type: 'dashed' }, label: { formatter: 'Ⅰ类', color: '#22c55e' } });\r\n                    markLines.push({ yAxis: config.level2, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: 'Ⅱ类', color: '#f59e0b' } });\r\n                    markLines.push({ yAxis: config.level3, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: 'Ⅲ类', color: '#ef4444' } });\r\n                }\r\n            }\r\n            \r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: { trigger: 'item' },\r\n                grid: { left: 10, right: 10, top: 20, bottom: 20 },\r\n                xAxis: { type: 'category', data: [''], axisLabel: { show: false }, axisLine: { show: false }, splitLine: { show: false } },\r\n                yAxis: { type: 'value', axisLabel: { color: '#64748b', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } } },\r\n                series: [\r\n                    { type: 'boxplot', data: [[boxData[0], boxData[1], boxData[2], boxData[3], boxData[4]]], itemStyle: { color: 'rgba(14, 165, 233, 0.3)', borderColor: '#0ea5e9', borderWidth: 2 }, markLine: { silent: true, symbol: 'none', data: markLines } },\r\n                    { type: 'scatter', data: outlierData, symbolSize: 10, itemStyle: { color: '#ef4444' } }\r\n                ]\r\n            };\r\n            \r\n            chart.setOption(option);\r\n            chart.on('click', function(params) { if (params.seriesType === 'scatter' && params.data[2]) showOutlierDetail(indicator, params.data[2]); });\r\n        }\r\n        \r\n        function updateStatsTable() {\r\n            const tbody = document.getElementById('statsTableBody');\r\n            tbody.innerHTML = boxplotData.indicators.map(ind => `\r\n                <tr>\r\n                    <td><div class=\"stats-indicator\">${ind.name}</div></td>\r\n                    <td>${ind.statistics.min}</td>\r\n                    <td>${ind.statistics.q1}</td>\r\n                    <td style=\"color: #22c55e; font-weight: 600;\">${ind.statistics.median}</td>\r\n                    <td>${ind.statistics.q3}</td>\r\n                    <td>${ind.statistics.max}</td>\r\n                    <td style=\"color: #0ea5e9;\">${ind.statistics.iqr}</td>\r\n                </tr>\r\n            `).join('');\r\n        }\r\n        \r\n        function updateThresholdPanel() {\r\n            const container = document.getElementById('thresholdContainer');\r\n            container.innerHTML = boxplotData.indicators.map((ind, idx) => `\r\n                <div class=\"threshold-item\">\r\n                    <div class=\"threshold-header\">\r\n                        <div class=\"threshold-name\">${ind.name} (${ind.unit})</div>\r\n                        <div class=\"threshold-range\">当前: ${ind.warning_threshold.lower} - ${ind.warning_threshold.upper}</div>\r\n                    </div>\r\n                    <div class=\"threshold-inputs\">\r\n                        <div class=\"threshold-input-group\">\r\n                            <div class=\"threshold-label\">预警下限</div>\r\n                            <input type=\"number\" class=\"threshold-input\" id=\"th_low_${idx}\" value=\"${ind.warning_threshold.lower}\" step=\"0.01\">\r\n                        </div>\r\n                        <div class=\"threshold-input-group\">\r\n                            <div class=\"threshold-label\">预警上限</div>\r\n                            <input type=\"number\" class=\"threshold-input\" id=\"th_high_${idx}\" value=\"${ind.warning_threshold.upper}\" step=\"0.01\">\r\n                        </div>\r\n                        <button class=\"save-btn\" onclick=\"saveThreshold(${idx}, '${ind.name}')\">保存</button>\r\n                    </div>\r\n                </div>\r\n            `).join('');\r\n        }\r\n        \r\n        function saveThreshold(index, name) {\r\n            const lower = document.getElementById(`th_low_${index}`).value;\r\n            const upper = document.getElementById(`th_high_${index}`).value;\r\n            alert(`${name}预警阈值已保存: ${lower} - ${upper}`);\r\n        }\r\n        \r\n        function updateStabilityPanel() {\r\n            document.getElementById('overallStability').textContent = boxplotData.overall_stability || '--';\r\n            \r\n            const list = document.getElementById('stabilityList');\r\n            list.innerHTML = boxplotData.indicators.map(ind => {\r\n                const score = ind.stability_score;\r\n                let color = '#22c55e';\r\n                if (score < 60) color = '#ef4444';\r\n                else if (score < 75) color = '#f59e0b';\r\n                else if (score < 90) color = '#0ea5e9';\r\n                \r\n                return `\r\n                    <div class=\"stability-item\">\r\n                        <div class=\"stability-indicator\">${ind.name}</div>\r\n                        <div class=\"stability-bar\"><div class=\"stability-fill\" style=\"width: ${score}%; background: ${color};\"></div></div>\r\n                        <div class=\"stability-value\" style=\"color: ${color};\">${score}</div>\r\n                    </div>\r\n                `;\r\n            }).join('');\r\n        }\r\n        \r\n        function showOutlierDetail(indicator, outlier) {\r\n            const modal = document.getElementById('outlierModal');\r\n            document.getElementById('outlierModalTitle').innerHTML = `<i class=\"fa fa-exclamation-triangle\"></i> ${indicator.name} 异常值详情`;\r\n            \r\n            let analysis = '';\r\n            const config = indicatorConfig[indicator.name];\r\n            if (indicator.name === 'PH') {\r\n                if (outlier.value < 6) analysis = 'PH值偏低，可能受酸性废水排放或酸雨影响。';\r\n                else if (outlier.value > 9) analysis = 'PH值偏高，可能受碱性废水排放影响。';\r\n            } else if (config && !config.higherBetter && outlier.value > config.level3) {\r\n                analysis = `超过Ⅲ类标准(${config.level3})，可能存在严重污染。`;\r\n            } else if (config && config.higherBetter && outlier.value < config.level3) {\r\n                analysis = `低于Ⅲ类标准(${config.level3})，溶解氧不足。`;\r\n            }\r\n            if (!analysis) analysis = '数值偏离正常范围，建议检查监测设备。';\r\n            \r\n            document.getElementById('outlierDetail').innerHTML = `\r\n                <div class=\"outlier-item\"><div class=\"outlier-label\">指标浓度</div><div class=\"outlier-value\" style=\"color: #ef4444;\">${outlier.value} ${indicator.unit}</div></div>\r\n                <div class=\"outlier-item\"><div class=\"outlier-label\">监测时间</div><div class=\"outlier-value\">${outlier.date}</div></div>\r\n                <div class=\"outlier-item\"><div class=\"outlier-label\">监测站点</div><div class=\"outlier-value\">${outlier.location}</div></div>\r\n                <div class=\"outlier-item\"><div class=\"outlier-label\">所在省份</div><div class=\"outlier-value\">${outlier.province}</div></div>\r\n                ${outlier.exceeded ? `<div class=\"outlier-item\"><div class=\"outlier-label\">超标情况</div><div class=\"outlier-value\" style=\"color: #ef4444;\">${outlier.exceeded}</div></div>` : ''}\r\n                <div style=\"padding: 12px; background: rgba(14, 165, 233, 0.1); border-radius: 8px; margin-top: 10px;\"><div style=\"font-size: 12px; color: #0ea5e9; margin-bottom: 8px; font-weight: 600;\"><i class=\"fa fa-info-circle\"></i> 异常原因分析</div><div style=\"font-size: 12px; color: #94a3b8; line-height: 1.6;\">${analysis}</div></div>\r\n            `;\r\n            modal.classList.add('active');\r\n        }\r\n        \r\n        function closeOutlierModal() {\r\n            document.getElementById('outlierModal').classList.remove('active');\r\n        }\r\n        \r\n        function renderEmptyState(message) {\r\n            clearChartInstances();\r\n            boxplotData = { indicators: [], outliers: [], overall_stability: '--', sample_count: 0 };\r\n\r\n            const boxplotGrid = document.getElementById('boxplotGrid');\r\n            const statsTableBody = document.getElementById('statsTableBody');\r\n            const thresholdContainer = document.getElementById('thresholdContainer');\r\n            const stabilityList = document.getElementById('stabilityList');\r\n\r\n            boxplotGrid.innerHTML = `\r\n                <div style=\"grid-column: 1 / -1; min-height: 280px; display: flex; align-items: center; justify-content: center; color: #94a3b8; border: 1px dashed rgba(148,163,184,0.3); border-radius: 16px; background: rgba(15,23,42,0.35);\">\r\n                    ${message}\r\n                </div>\r\n            `;\r\n            statsTableBody.innerHTML = `\r\n                <tr>\r\n                    <td colspan=\"7\" style=\"text-align: center; color: #94a3b8; padding: 24px 12px;\">${message}</td>\r\n                </tr>\r\n            `;\r\n            thresholdContainer.innerHTML = `\r\n                <div class=\"threshold-item\">\r\n                    <div class=\"threshold-header\">\r\n                        <div class=\"threshold-name\">真实阈值面板</div>\r\n                        <div class=\"threshold-range\">${message}</div>\r\n                    </div>\r\n                </div>\r\n            `;\r\n            document.getElementById('overallStability').textContent = '--';\r\n            stabilityList.innerHTML = `\r\n                <div class=\"stability-item\" style=\"justify-content: center; color: #94a3b8;\">\r\n                    ${message}\r\n                </div>\r\n            `;\r\n            closeOutlierModal();\r\n            showToast(message);\r\n        }\r\n\r\n        function showToast(message) {\r\n            const existing = document.querySelector('.toast-message');\r\n            if (existing) existing.remove();\r\n\r\n            const toast = document.createElement('div');\r\n            toast.className = 'toast-message';\r\n            toast.innerHTML = `\r\n                <div style=\"\r\n                    position: fixed;\r\n                    top: 80px;\r\n                    left: 50%;\r\n                    transform: translateX(-50%);\r\n                    background: rgba(15, 23, 42, 0.92);\r\n                    color: white;\r\n                    padding: 12px 24px;\r\n                    border-radius: 8px;\r\n                    font-size: 14px;\r\n                    z-index: 10000;\r\n                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\r\n                    border: 1px solid rgba(148, 163, 184, 0.25);\r\n                \">${message}</div>\r\n            `;\r\n            document.body.appendChild(toast);\r\n            setTimeout(() => toast.remove(), 3000);\r\n        }\r\n        \r\n        document.getElementById('outlierModal').addEventListener('click', function(e) { if (e.target === this) closeOutlierModal(); });"], Component: BoxplotAnalysisPage },
  "chat.html": { title: "海河六域 - 智能问答", scripts: ["https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: [], Component: ChatPage },
  "correlation-analysis.html": { title: "海河六域 - 指标相关性分析专项屏", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: ["// API基础URL\r\n        const API_BASE = (() => {\r\n            if (window.HAIHE_RUNTIME?.resolveApi) {\r\n                return window.HAIHE_RUNTIME.resolveApi('/api').replace(/\\/$/, '');\r\n            }\r\n            if (window.location.protocol === 'file:') {\r\n                return 'http://127.0.0.1:5001/api';\r\n            }\r\n            return `${window.location.origin}/api`;\r\n        })();\r\n        \r\n        let charts = {};\r\n        let correlationData = null;\r\n        let rawData = [];\r\n        \r\n        // 指标分类\r\n        const categoryMap = {\r\n            'physical': ['水温', '溶解氧', 'PH'],\r\n            'nutrient': ['氨氮', '总磷', '总氮'],\r\n            'pollution': ['电导率', '浊度', '高锰酸盐指数']\r\n        };\r\n        \r\n        // 指标英文名映射（用于显示）\r\n        const indicatorNames = ['水温', 'PH', '溶解氧', '电导率', '浊度', '高锰酸盐指数', '氨氮', '总磷', '总氮'];\r\n        \r\n        // 初始化\r\n        document.addEventListener('DOMContentLoaded', function() {\r\n            initCharts();\r\n            loadRealData();\r\n            updateTime();\r\n            setInterval(updateTime, 1000);\r\n            \r\n            window.addEventListener('resize', function() {\r\n                Object.values(charts).forEach(chart => chart && chart.resize());\r\n            });\r\n        });\r\n        \r\n        // 更新时间\r\n        function updateTime() {\r\n            const now = new Date();\r\n            const timeStr = now.toLocaleString('zh-CN', {\r\n                year: 'numeric',\r\n                month: '2-digit',\r\n                day: '2-digit',\r\n                hour: '2-digit',\r\n                minute: '2-digit',\r\n                second: '2-digit'\r\n            });\r\n            document.getElementById('currentTime').textContent = timeStr;\r\n        }\r\n        \r\n        // 返回大屏\r\n        function goBack() {\r\n            window.location.href = 'dashboard.html';\r\n        }\r\n        \r\n        // 初始化图表\r\n        function initCharts() {\r\n            charts.heatmap = echarts.init(document.getElementById('heatmapChart'));\r\n        }\r\n        \r\n        // 加载真实数据\r\n        async function loadRealData() {\r\n            try {\r\n                showLoading();\r\n                console.log('[DEBUG] Loading correlation data from:', API_BASE);\r\n                \r\n                const response = await fetch(`${API_BASE}/dashboard/correlation-heatmap`);\r\n                const result = await response.json();\r\n                \r\n                console.log('[DEBUG] Correlation response:', result);\r\n                \r\n                if (result.success && result.data && result.data.values && result.data.values.length > 0) {\r\n                    correlationData = result.data;\r\n                    rawData = result.data.values;\r\n                    \r\n                    renderHeatmap();\r\n                    updateFeatureRecommendations();\r\n                    updateControlList();\r\n                    \r\n                    if (result.data.message) {\r\n                        showToast(result.data.message);\r\n                    }\r\n                } else {\r\n                    const message = (result.data && result.data.message) || result.error || '暂无真实相关性数据';\r\n                    console.warn('[DEBUG] No valid correlation data:', message);\r\n                    renderNoDataState(message);\r\n                    showToast(message);\r\n                }\r\n                \r\n                hideLoading();\r\n            } catch (error) {\r\n                console.error('[DEBUG] Error loading data:', error);\r\n                renderNoDataState('数据加载失败，未加载到真实相关性数据');\r\n                showToast('数据加载失败，未加载到真实相关性数据');\r\n                hideLoading();\r\n            }\r\n        }\r\n\r\n        function makePairKey(indicator1, indicator2) {\r\n            return [indicator1, indicator2].sort().join(' | ');\r\n        }\r\n\r\n        function getPairSampleCount(indicator1, indicator2) {\r\n            if (!correlationData || !correlationData.pair_sample_counts) return 0;\r\n            return correlationData.pair_sample_counts[makePairKey(indicator1, indicator2)] || 0;\r\n        }\r\n\r\n        function getPairScatterSamples(indicator1, indicator2) {\r\n            if (!correlationData || !correlationData.scatter_samples) return [];\r\n            return correlationData.scatter_samples[makePairKey(indicator1, indicator2)] || [];\r\n        }\r\n\r\n        function renderHeatmapEmpty(message) {\r\n            charts.heatmap.clear();\r\n            charts.heatmap.setOption({\r\n                backgroundColor: 'transparent',\r\n                graphic: {\r\n                    type: 'text',\r\n                    left: 'center',\r\n                    top: 'middle',\r\n                    style: {\r\n                        text: message,\r\n                        fill: '#94a3b8',\r\n                        font: '14px \"Microsoft YaHei\"',\r\n                        textAlign: 'center'\r\n                    }\r\n                }\r\n            }, true);\r\n        }\r\n\r\n        function renderFeatureTags(selector, features, className, emptyLabel) {\r\n            const container = document.querySelector(selector);\r\n            if (!container) return;\r\n            if (features && features.length > 0) {\r\n                container.innerHTML = features.map(item => `<span class=\"feature-tag ${className}\">${item}</span>`).join('');\r\n            } else {\r\n                container.innerHTML = `<span class=\"feature-tag ${className}\">${emptyLabel}</span>`;\r\n            }\r\n        }\r\n\r\n        function generateCorrelationInterpretation(indicator1, indicator2, correlation, sampleCount) {\r\n            const absCorr = Math.abs(correlation);\r\n            const strength = absCorr >= 0.7 ? '强' : absCorr >= 0.4 ? '中等' : '弱';\r\n            const direction = correlation > 0 ? '正相关' : '负相关';\r\n            return {\r\n                analysis: `${indicator1} 与 ${indicator2} 基于 ${sampleCount} 组真实配对样本呈${strength}${direction}（r=${correlation}）`,\r\n                environment: correlation > 0\r\n                    ? '两项指标通常同步变化，建议结合排放过程、季节因素和上下游扰动共同分析'\r\n                    : '两项指标在真实样本中存在反向联动，建议重点排查温度、水动力或治理措施带来的耦合影响',\r\n                application: absCorr >= 0.5\r\n                    ? '建议将这两项指标纳入联动监测清单，作为同源波动或治理成效复核的重要参考'\r\n                    : '建议持续积累样本并结合站点、时段和污染类型做分组复核，避免单次相关性被偶然波动放大'\r\n            };\r\n        }\r\n\r\n        function renderNoDataState(message) {\r\n            correlationData = {\r\n                indicators: indicatorNames,\r\n                values: [],\r\n                feature_recommendations: {\r\n                    core_features: [],\r\n                    pollution_features: [],\r\n                    auxiliary_features: [],\r\n                    redundant_pairs: []\r\n                },\r\n                pollution_control: {},\r\n                pair_sample_counts: {},\r\n                scatter_samples: {}\r\n            };\r\n            rawData = [];\r\n            renderHeatmapEmpty(message);\r\n            updateFeatureRecommendations();\r\n            updateControlList();\r\n            closeDetail();\r\n        }\r\n        \r\n        // 渲染热力图\r\n        function renderHeatmap(categoryFilter = 'all') {\r\n            if (!correlationData) return;\r\n            \r\n            let indicators = correlationData.indicators;\r\n            let values = correlationData.values;\r\n            \r\n            // 如果有过滤，重新组织数据\r\n            if (categoryFilter !== 'all' && categoryMap[categoryFilter]) {\r\n                const filteredIndicators = categoryMap[categoryFilter];\r\n                const indices = filteredIndicators.map(name => indicators.indexOf(name)).filter(i => i >= 0);\r\n                \r\n                indicators = filteredIndicators;\r\n                values = [];\r\n                for (let i of indices) {\r\n                    for (let j of indices) {\r\n                        const origValue = rawData.find(v => v[0] === i && v[1] === j);\r\n                        if (origValue) {\r\n                            values.push([indices.indexOf(i), indices.indexOf(j), origValue[2]]);\r\n                        }\r\n                    }\r\n                }\r\n            }\r\n            \r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    position: 'top',\r\n                    formatter: function(params) {\r\n                        const val = params.data[2];\r\n                        const currentIndicator1 = indicators[params.data[0]];\r\n                        const currentIndicator2 = indicators[params.data[1]];\r\n                        const sampleCount = getPairSampleCount(currentIndicator1, currentIndicator2);\r\n                        const strength = Math.abs(val) > 0.5 ? '强' : Math.abs(val) > 0.3 ? '中等' : '弱';\r\n                        const direction = val > 0 ? '正' : '负';\r\n                        return `<div style=\"font-weight:bold\">${currentIndicator1} × ${currentIndicator2}</div>\r\n                                <div>相关系数: <b style=\"color:${val > 0 ? '#ef4444' : '#3b82f6'}\">${val}</b></div>\r\n                                <div>相关强度: ${strength}${direction}相关</div>\r\n                                <div>配对样本: ${sampleCount}</div>\r\n                                <div style=\"color:#64748b;font-size:12px;margin-top:5px\">点击查看详情</div>`;\r\n                    }\r\n                },\r\n                grid: {\r\n                    top: '10%',\r\n                    left: '15%',\r\n                    right: '10%',\r\n                    bottom: '15%'\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    data: indicators,\r\n                    splitArea: { show: true },\r\n                    axisLabel: {\r\n                        color: '#e2e8f0',\r\n                        fontSize: 11,\r\n                        rotate: 45\r\n                    },\r\n                    axisLine: { show: false }\r\n                },\r\n                yAxis: {\r\n                    type: 'category',\r\n                    data: indicators,\r\n                    splitArea: { show: true },\r\n                    axisLabel: {\r\n                        color: '#e2e8f0',\r\n                        fontSize: 11\r\n                    },\r\n                    axisLine: { show: false }\r\n                },\r\n                visualMap: {\r\n                    min: -1,\r\n                    max: 1,\r\n                    calculable: true,\r\n                    orient: 'horizontal',\r\n                    left: 'center',\r\n                    bottom: '0%',\r\n                    itemWidth: 15,\r\n                    itemHeight: 100,\r\n                    inRange: {\r\n                        color: ['#3b82f6', '#ffffff', '#ef4444']\r\n                    },\r\n                    textStyle: { color: '#94a3b8', fontSize: 10 }\r\n                },\r\n                series: [{\r\n                    name: '相关性',\r\n                    type: 'heatmap',\r\n                    data: values,\r\n                    label: {\r\n                        show: true,\r\n                        color: function(params) {\r\n                            const val = params.data[2];\r\n                            return Math.abs(val) > 0.5 ? '#fff' : '#1e293b';\r\n                        },\r\n                        fontSize: 10,\r\n                        fontWeight: 'bold',\r\n                        formatter: function(params) {\r\n                            return params.data[2].toFixed(2);\r\n                        }\r\n                    },\r\n                    itemStyle: {\r\n                        borderColor: function(params) {\r\n                            const val = params.data[2];\r\n                            // 强相关单元格高亮边框\r\n                            return Math.abs(val) > 0.5 ? '#f59e0b' : 'transparent';\r\n                        },\r\n                        borderWidth: function(params) {\r\n                            const val = params.data[2];\r\n                            return Math.abs(val) > 0.5 ? 2 : 0;\r\n                        }\r\n                    },\r\n                    emphasis: {\r\n                        itemStyle: {\r\n                            shadowBlur: 10,\r\n                            shadowColor: 'rgba(0, 0, 0, 0.5)'\r\n                        }\r\n                    }\r\n                }]\r\n            };\r\n            \r\n            charts.heatmap.setOption(option, true);\r\n            \r\n            // 点击事件\r\n            charts.heatmap.off('click');\r\n            charts.heatmap.on('click', function(params) {\r\n                const i = params.data[0];\r\n                const j = params.data[1];\r\n                const val = params.data[2];\r\n                \r\n                showDetail(indicators[i], indicators[j], val);\r\n            });\r\n        }\r\n        \r\n        // 显示详情\r\n        function showDetail(indicator1, indicator2, correlation) {\r\n            if (indicator1 === indicator2) return;\r\n            \r\n            const panel = document.getElementById('detailPanel');\r\n            const title = document.getElementById('detailTitle');\r\n            const sampleCount = getPairSampleCount(indicator1, indicator2);\r\n            \r\n            title.innerHTML = `${indicator1} × ${indicator2} <span style=\"color:${correlation > 0 ? '#ef4444' : '#3b82f6'};margin-left:10px\">r=${correlation}</span><span style=\"color:#94a3b8;margin-left:10px\">n=${sampleCount}</span>`;\r\n            \r\n            const interp = generateCorrelationInterpretation(indicator1, indicator2, correlation, sampleCount);\r\n            \r\n            document.getElementById('corrAnalysis').textContent = interp.analysis;\r\n            document.getElementById('envInterpretation').textContent = interp.environment;\r\n            document.getElementById('applicationAdvice').textContent = interp.application;\r\n            \r\n            panel.classList.add('active');\r\n            \r\n            // 渲染散点图\r\n            setTimeout(() => renderScatterChart(indicator1, indicator2, correlation), 100);\r\n            \r\n            // 滚动到详情面板\r\n            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });\r\n        }\r\n        \r\n        // 关闭详情\r\n        function closeDetail() {\r\n            document.getElementById('detailPanel').classList.remove('active');\r\n        }\r\n        \r\n        // 渲染散点图\r\n        function renderScatterChart(indicator1, indicator2, correlation) {\r\n            const chartDom = document.getElementById('scatterChart');\r\n            if (!chartDom) return;\r\n            \r\n            if (charts.scatter) {\r\n                charts.scatter.dispose();\r\n            }\r\n            charts.scatter = echarts.init(chartDom);\r\n            \r\n            const scatterData = getPairScatterSamples(indicator1, indicator2);\r\n            if (!scatterData.length) {\r\n                charts.scatter.setOption({\r\n                    backgroundColor: 'transparent',\r\n                    graphic: {\r\n                        type: 'text',\r\n                        left: 'center',\r\n                        top: 'middle',\r\n                        style: {\r\n                            text: '暂无真实配对散点样本',\r\n                            fill: '#94a3b8',\r\n                            font: '14px \"Microsoft YaHei\"',\r\n                            textAlign: 'center'\r\n                        }\r\n                    }\r\n                }, true);\r\n                return;\r\n            }\r\n\r\n            const xValues = scatterData.map(item => item[0]);\r\n            const yValues = scatterData.map(item => item[1]);\r\n            const meanX = xValues.reduce((sum, value) => sum + value, 0) / xValues.length;\r\n            const meanY = yValues.reduce((sum, value) => sum + value, 0) / yValues.length;\r\n            let numerator = 0;\r\n            let denominator = 0;\r\n            xValues.forEach((value, index) => {\r\n                numerator += (value - meanX) * (yValues[index] - meanY);\r\n                denominator += (value - meanX) * (value - meanX);\r\n            });\r\n\r\n            let trendLine = [];\r\n            if (denominator > 0) {\r\n                const slope = numerator / denominator;\r\n                const intercept = meanY - slope * meanX;\r\n                const minX = Math.min(...xValues);\r\n                const maxX = Math.max(...xValues);\r\n                trendLine = [\r\n                    [minX, slope * minX + intercept],\r\n                    [maxX, slope * maxX + intercept]\r\n                ];\r\n            }\r\n            \r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                grid: { top: 30, left: 50, right: 20, bottom: 40 },\r\n                xAxis: {\r\n                    type: 'value',\r\n                    name: indicator1,\r\n                    nameLocation: 'middle',\r\n                    nameGap: 25,\r\n                    nameTextStyle: { color: '#94a3b8', fontSize: 11 },\r\n                    axisLabel: { color: '#64748b', fontSize: 9 },\r\n                    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } }\r\n                },\r\n                yAxis: {\r\n                    type: 'value',\r\n                    name: indicator2,\r\n                    nameLocation: 'middle',\r\n                    nameGap: 35,\r\n                    nameTextStyle: { color: '#94a3b8', fontSize: 11 },\r\n                    axisLabel: { color: '#64748b', fontSize: 9 },\r\n                    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } }\r\n                },\r\n                series: [{\r\n                    type: 'scatter',\r\n                    data: scatterData,\r\n                    symbolSize: 8,\r\n                    itemStyle: {\r\n                        color: correlation > 0 ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.6)',\r\n                        borderColor: correlation > 0 ? '#ef4444' : '#3b82f6',\r\n                        borderWidth: 1\r\n                    }\r\n                }, {\r\n                    type: 'line',\r\n                    data: trendLine,\r\n                    smooth: false,\r\n                    symbol: 'none',\r\n                    lineStyle: {\r\n                        color: correlation > 0 ? '#ef4444' : '#3b82f6',\r\n                        width: 2,\r\n                        type: 'dashed'\r\n                    }\r\n                }]\r\n            };\r\n            \r\n            charts.scatter.setOption(option);\r\n        }\r\n        \r\n        // 筛选分类\r\n        function filterCategory(category) {\r\n            // 更新按钮状态\r\n            document.querySelectorAll('.category-tag').forEach(tag => {\r\n                tag.classList.remove('active');\r\n            });\r\n            document.querySelector(`[data-category=\"${category}\"]`).classList.add('active');\r\n            \r\n            // 更新描述\r\n            const descMap = {\r\n                'all': '显示全部9项指标的相关性分析',\r\n                'physical': '物理生态类指标：水温、溶解氧、PH',\r\n                'nutrient': '营养盐类指标：氨氮、总磷、总氮',\r\n                'pollution': '污染类指标：电导率、浊度、高锰酸盐指数'\r\n            };\r\n            document.getElementById('categoryDesc').textContent = descMap[category];\r\n            \r\n            // 重新渲染热力图\r\n            renderHeatmap(category);\r\n            \r\n            // 关闭详情面板\r\n            closeDetail();\r\n        }\r\n        \r\n        // 更新特征推荐\r\n        function updateFeatureRecommendations() {\r\n            if (!correlationData || !correlationData.feature_recommendations) return;\r\n            \r\n            const rec = correlationData.feature_recommendations;\r\n            const redundantList = document.getElementById('redundantList');\r\n            renderFeatureTags('.feature-item.core .feature-tags', rec.core_features, 'tag-core', '暂无真实推荐');\r\n            renderFeatureTags('.feature-item.pollution .feature-tags', rec.pollution_features, 'tag-pollution', '暂无真实推荐');\r\n            renderFeatureTags('.feature-item.auxiliary .feature-tags', rec.auxiliary_features, 'tag-auxiliary', '暂无真实推荐');\r\n            \r\n            if (rec.redundant_pairs && rec.redundant_pairs.length > 0) {\r\n                redundantList.innerHTML = rec.redundant_pairs.map(pair => `\r\n                    <div class=\"redundant-item\">\r\n                        <b>保留 ${pair.keep}</b>，剔除 ${pair.remove}<br/>\r\n                        <span style=\"color:#64748b\">原因：${pair.reason}</span>\r\n                    </div>\r\n                `).join('');\r\n            } else {\r\n                redundantList.innerHTML = '<div class=\"redundant-item\">暂无冗余特征建议</div>';\r\n            }\r\n        }\r\n        \r\n        // 更新管控清单\r\n        function updateControlList() {\r\n            const pc = correlationData.pollution_control;\r\n            const container = document.getElementById('controlContainer');\r\n            if (!pc || Object.keys(pc).length === 0) {\r\n                container.innerHTML = `\r\n                    <div class=\"control-list\">\r\n                        <div class=\"control-item\">\r\n                            <div class=\"control-header\">\r\n                                <div class=\"control-type\">暂无真实联动关系</div>\r\n                            </div>\r\n                            <div class=\"control-suggestion\">当前数据库样本不足以生成联动管控建议</div>\r\n                        </div>\r\n                    </div>\r\n                `;\r\n                return;\r\n            }\r\n            \r\n            let html = '<div class=\"control-list\">';\r\n            \r\n            Object.entries(pc).forEach(([key, item]) => {\r\n                html += `\r\n                    <div class=\"control-item\">\r\n                        <div class=\"control-header\">\r\n                            <div class=\"control-type\">${item.title || (key === 'organic_pollution' ? '有机污染同源' : key === 'nutrient_pollution' ? '营养盐污染同源' : '物理生态关联')}</div>\r\n                            <div class=\"control-corr\">r=${item.correlation}</div>\r\n                        </div>\r\n                        <div class=\"control-indicators\">${item.indicators.join(' × ')}</div>\r\n                        <div class=\"control-suggestion\" style=\"margin-bottom:6px;color:#64748b\">配对样本: ${item.sample_count || 0}</div>\r\n                        <div class=\"control-suggestion\">${item.suggestion}</div>\r\n                    </div>\r\n                `;\r\n            });\r\n            \r\n            html += '</div>';\r\n            container.innerHTML = html;\r\n        }\r\n        \r\n        // 显示加载状态\r\n        function showLoading() {\r\n            document.body.style.cursor = 'wait';\r\n        }\r\n        \r\n        // 隐藏加载状态\r\n        function hideLoading() {\r\n            document.body.style.cursor = 'default';\r\n        }\r\n        \r\n        // Toast提示\r\n        function showToast(message) {\r\n            const existing = document.querySelector('.toast-message');\r\n            if (existing) existing.remove();\r\n            \r\n            const toast = document.createElement('div');\r\n            toast.className = 'toast-message';\r\n            toast.innerHTML = `\r\n                <div style=\"\r\n                    position: fixed;\r\n                    top: 80px;\r\n                    left: 50%;\r\n                    transform: translateX(-50%);\r\n                    background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(34, 197, 94, 0.9));\r\n                    color: white;\r\n                    padding: 12px 24px;\r\n                    border-radius: 8px;\r\n                    font-size: 14px;\r\n                    z-index: 10000;\r\n                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\r\n                \">${message}</div>\r\n            `;\r\n            document.body.appendChild(toast);\r\n            setTimeout(() => toast.remove(), 3000);\r\n        }"], Component: CorrelationAnalysisPage },
  "dashboard.html": { title: "海河六域・水质时空演变智能治理系统", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: [], Component: DashboardPage },
  "forgot-password.html": { title: "海河六域 - 忘记密码", scripts: ["../config/site.config.js","../config/runtime-config.js","https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"], inlineScripts: [], Component: ForgotPasswordPage },
  "index.html": { title: "海河六域 - 流域水质时空演变与知识图谱智能治理系统", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: [], Component: IndexPage },
  "knowledge-graph.html": { title: "海河六域｜知识图谱", scripts: ["https://cdn.jsdelivr.net/npm/vis-network@9.1.9/dist/vis-network.min.js","https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: [], Component: KnowledgeGraphPage },
  "login.html": { title: "海河六域 - 登录", scripts: ["../config/site.config.js","../config/runtime-config.js","https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"], inlineScripts: [], Component: LoginPage },
  "profile.html": { title: "海河六域 - 个人中心", scripts: [], inlineScripts: [], Component: ProfilePage },
  "province-comparison.html": { title: "海河六域 - 省际空间对比专项屏", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: ["// API基础URL\r\n        const API_BASE = (() => {\r\n            if (window.HAIHE_RUNTIME?.resolveApi) {\r\n                return window.HAIHE_RUNTIME.resolveApi('/api').replace(/\\/$/, '');\r\n            }\r\n            if (window.location.protocol === 'file:') {\r\n                return 'http://127.0.0.1:5001/api';\r\n            }\r\n            return `${window.location.origin}/api`;\r\n        })();\r\n        \r\n        let charts = {};\r\n        let provinceData = [];\r\n        let mapData = [];\r\n        let sortField = 'score';\r\n        let sortAsc = false;\r\n        \r\n        // 水质等级标准\r\n        const waterQualityStandards = {\r\n            do: { level1: 7.5, level2: 6.0, level3: 5.0 },\r\n            nh: { level1: 0.15, level2: 0.5, level3: 1.0 },\r\n            tp: { level1: 0.02, level2: 0.1, level3: 0.2 }\r\n        };\r\n        \r\n        const provinceTrendCache = {};\r\n        \r\n        // 初始化\r\n        document.addEventListener('DOMContentLoaded', function() {\r\n            initCharts();\r\n            loadRealData();\r\n            updateTime();\r\n            setInterval(updateTime, 1000);\r\n            initSortHandlers();\r\n            \r\n            window.addEventListener('resize', function() {\r\n                Object.values(charts).forEach(chart => chart && chart.resize());\r\n            });\r\n        });\r\n        \r\n        // 更新时间\r\n        function updateTime() {\r\n            const now = new Date();\r\n            const timeStr = now.toLocaleString('zh-CN', {\r\n                year: 'numeric',\r\n                month: '2-digit',\r\n                day: '2-digit',\r\n                hour: '2-digit',\r\n                minute: '2-digit',\r\n                second: '2-digit'\r\n            });\r\n            document.getElementById('currentTime').textContent = timeStr;\r\n        }\r\n        \r\n        // 返回大屏\r\n        function goBack() {\r\n            window.location.href = 'dashboard.html';\r\n        }\r\n        \r\n        // 初始化图表\r\n        function initCharts() {\r\n            charts.bar = echarts.init(document.getElementById('barChart'));\r\n            charts.map = echarts.init(document.getElementById('mapChart'));\r\n        }\r\n        \r\n        // 加载真实数据\r\n        async function loadRealData() {\r\n            try {\r\n                showLoading();\r\n                console.log('[DEBUG] Starting to load data from:', API_BASE);\r\n                \r\n                // 并行加载数据\r\n                const [provinceRes, mapRes, overviewRes] = await Promise.all([\r\n                    fetch(`${API_BASE}/dashboard/province-comparison`).then(r => {\r\n                        console.log('[DEBUG] Province comparison response:', r.status);\r\n                        return r.json();\r\n                    }).catch(e => {\r\n                        console.error('[DEBUG] Province comparison error:', e);\r\n                        return { success: false, error: e.message };\r\n                    }),\r\n                    fetch(`${API_BASE}/dashboard/map-data`).then(r => {\r\n                        console.log('[DEBUG] Map data response:', r.status);\r\n                        return r.json();\r\n                    }).catch(e => {\r\n                        console.error('[DEBUG] Map data error:', e);\r\n                        return { success: false, error: e.message };\r\n                    }),\r\n                    fetch(`${API_BASE}/dashboard/overview-stats`).then(r => {\r\n                        console.log('[DEBUG] Overview stats response:', r.status);\r\n                        return r.json();\r\n                    }).catch(e => {\r\n                        console.error('[DEBUG] Overview stats error:', e);\r\n                        return { success: false, error: e.message };\r\n                    })\r\n                ]);\r\n                \r\n                console.log('[DEBUG] Province response:', provinceRes);\r\n                console.log('[DEBUG] Map response:', mapRes);\r\n                \r\n                // 处理省份对比数据\r\n                if (provinceRes.success && provinceRes.data && provinceRes.data.provinces && provinceRes.data.provinces.length > 0) {\r\n                    console.log('[DEBUG] Processing province data:', provinceRes.data);\r\n                    processProvinceData(provinceRes.data);\r\n                    renderBarChart();\r\n                    updateRankingTable();\r\n                    updateSuggestions();\r\n                } else {\r\n                    const message = (provinceRes.data && provinceRes.data.message) || provinceRes.error || '暂无真实省份对比数据';\r\n                    provinceData = [];\r\n                    console.error('[DEBUG] Province comparison unavailable:', message);\r\n                    renderBarEmptyState(message);\r\n                    updateRankingTable();\r\n                    updateSuggestions();\r\n                    showToast(message);\r\n                }\r\n                \r\n                // 处理地图数据\r\n                if (mapRes.success && mapRes.data && mapRes.data.length > 0) {\r\n                    mapData = mapRes.data;\r\n                    renderMap();\r\n                } else {\r\n                    console.warn('[DEBUG] Map data unavailable');\r\n                    mapData = [];\r\n                    renderMapFallback((mapRes.data && mapRes.data.message) || mapRes.error || '暂无真实站点地图数据');\r\n                }\r\n                \r\n                hideLoading();\r\n            } catch (error) {\r\n                console.error('[DEBUG] Global error:', error);\r\n                provinceData = [];\r\n                mapData = [];\r\n                renderBarEmptyState('数据加载失败，未加载到真实省份对比数据');\r\n                renderMapFallback('数据加载失败，未加载到真实站点地图数据');\r\n                updateRankingTable();\r\n                updateSuggestions();\r\n                showToast('数据加载失败，未加载到真实省份对比数据');\r\n                hideLoading();\r\n            }\r\n        }\r\n\r\n        function renderChartEmpty(chart, title, message) {\r\n            if (!chart) return;\r\n            chart.clear();\r\n            chart.setOption({\r\n                backgroundColor: 'transparent',\r\n                title: {\r\n                    text: title,\r\n                    subtext: message,\r\n                    left: 'center',\r\n                    top: 'center',\r\n                    textStyle: { color: '#e2e8f0', fontSize: 16 },\r\n                    subtextStyle: { color: '#94a3b8', fontSize: 12 }\r\n                }\r\n            }, true);\r\n        }\r\n\r\n        function renderBarEmptyState(message) {\r\n            renderChartEmpty(charts.bar, '六省市水质对比', message);\r\n            closePopup();\r\n        }\r\n\r\n        function getProvinceSuggestion(province) {\r\n            const data = provinceData.find(item => item.province === province);\r\n            if (!data) {\r\n                return {\r\n                    advantage: '暂无真实评估结果',\r\n                    weakness: '暂无真实评估结果',\r\n                    priority: '待补充',\r\n                    tags: ['暂无真实数据']\r\n                };\r\n            }\r\n\r\n            const rank = provinceData.findIndex(item => item.province === province) + 1;\r\n            const strengths = [\r\n                {\r\n                    key: 'do',\r\n                    score: data.do / waterQualityStandards.do.level1,\r\n                    advantage: `溶解氧均值为 ${data.do} mg/L，是当前最突出的优势指标`,\r\n                    weakness: `溶解氧距离Ⅰ类目标仍差 ${(waterQualityStandards.do.level1 - data.do).toFixed(2)} mg/L`\r\n                },\r\n                {\r\n                    key: 'nh',\r\n                    score: waterQualityStandards.nh.level1 / Math.max(data.nh, 0.001),\r\n                    advantage: `氨氮均值为 ${data.nh} mg/L，污染控制表现较好`,\r\n                    weakness: `氨氮较Ⅰ类目标高出 ${(data.nh - waterQualityStandards.nh.level1).toFixed(3)} mg/L`\r\n                },\r\n                {\r\n                    key: 'tp',\r\n                    score: waterQualityStandards.tp.level1 / Math.max(data.tp, 0.001),\r\n                    advantage: `总磷均值为 ${data.tp} mg/L，营养盐控制相对稳定`,\r\n                    weakness: `总磷较Ⅰ类目标高出 ${(data.tp - waterQualityStandards.tp.level1).toFixed(3)} mg/L`\r\n                }\r\n            ];\r\n\r\n            const sortedByStrength = [...strengths].sort((a, b) => b.score - a.score);\r\n            const bestMetric = sortedByStrength[0];\r\n            const weakestMetric = sortedByStrength[sortedByStrength.length - 1];\r\n\r\n            let priority = '提升';\r\n            if (rank <= 2 && data.level === 'Ⅰ类') {\r\n                priority = '维持';\r\n            } else if (rank >= Math.max(4, provinceData.length - 1) || data.level === 'Ⅲ类') {\r\n                priority = '重点整治';\r\n            }\r\n\r\n            const tags = [];\r\n            if (bestMetric.key === 'do') tags.push('溶解氧优势');\r\n            if (bestMetric.key === 'nh') tags.push('氨氮稳控');\r\n            if (bestMetric.key === 'tp') tags.push('总磷稳控');\r\n            if (weakestMetric.key === 'do' && data.do < waterQualityStandards.do.level1) tags.push('补氧提升');\r\n            if (weakestMetric.key === 'nh' && data.nh > waterQualityStandards.nh.level1) tags.push('氨氮削减');\r\n            if (weakestMetric.key === 'tp' && data.tp > waterQualityStandards.tp.level1) tags.push('总磷治理');\r\n            tags.push(rank <= 3 ? '保持优势' : '持续优化');\r\n\r\n            return {\r\n                advantage: bestMetric.advantage,\r\n                weakness: weakestMetric.score >= 1 ? '各核心指标整体稳定，建议保持现有治理节奏' : weakestMetric.weakness,\r\n                priority,\r\n                tags\r\n            };\r\n        }\r\n        \r\n        // 处理省份数据\r\n        function processProvinceData(data) {\r\n            provinceData = data.provinces.map((province, index) => {\r\n                const do_value = Number(data.dissolved_oxygen[index] ?? 0);\r\n                const nh_value = Number(data.ammonia_nitrogen[index] ?? 0);\r\n                const tp_value = Number(data.total_phosphorus[index] ?? 0);\r\n                \r\n                // 计算综合得分（满分100）\r\n                // DO: 满分30分（>=7.5得30分）\r\n                // NH: 满分40分（<=0.15得40分）\r\n                // TP: 满分30分（<=0.02得30分）\r\n                const do_score = Math.min(30, (do_value / 7.5) * 30);\r\n                const nh_score = nh_value <= 0.15 ? 40 : Math.max(0, 40 - (nh_value - 0.15) * 20);\r\n                const tp_score = tp_value <= 0.02 ? 30 : Math.max(0, 30 - (tp_value - 0.02) * 100);\r\n                const total_score = do_score + nh_score + tp_score;\r\n                \r\n                // 判断水质等级\r\n                let level = 'Ⅲ类';\r\n                let levelClass = 'level-3';\r\n                if (do_value >= 7.5 && nh_value <= 0.15 && tp_value <= 0.02) {\r\n                    level = 'Ⅰ类';\r\n                    levelClass = 'level-1';\r\n                } else if (do_value >= 6.0 && nh_value <= 0.5 && tp_value <= 0.1) {\r\n                    level = 'Ⅱ类';\r\n                    levelClass = 'level-2';\r\n                }\r\n                \r\n                return {\r\n                    province,\r\n                    do: do_value,\r\n                    nh: nh_value,\r\n                    tp: tp_value,\r\n                    score: total_score,\r\n                    level,\r\n                    levelClass\r\n                };\r\n            });\r\n            \r\n            // 按综合得分排序\r\n            provinceData.sort((a, b) => b.score - a.score);\r\n        }\r\n        \r\n        // 渲染柱状图\r\n        function renderBarChart() {\r\n            const provinces = provinceData.map(d => d.province.replace('省', '').replace('市', ''));\r\n            const doData = provinceData.map(d => ({\r\n                value: d.do,\r\n                itemStyle: { color: d.do >= 7.5 ? '#00e400' : d.do >= 6.0 ? '#ffff00' : '#ff7e00' }\r\n            }));\r\n            const nhData = provinceData.map(d => ({\r\n                value: d.nh,\r\n                itemStyle: { color: d.nh <= 0.15 ? '#00e400' : d.nh <= 0.5 ? '#ffff00' : '#ff7e00' }\r\n            }));\r\n            const tpData = provinceData.map(d => ({\r\n                value: d.tp,\r\n                itemStyle: { color: d.tp <= 0.02 ? '#00e400' : d.tp <= 0.1 ? '#ffff00' : '#ff7e00' }\r\n            }));\r\n            \r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    trigger: 'axis',\r\n                    axisPointer: { type: 'shadow' },\r\n                    formatter: function(params) {\r\n                        const index = params[0].dataIndex;\r\n                        const data = provinceData[index];\r\n                        let html = `<div style=\"font-weight:bold;margin-bottom:5px\">${data.province}</div>`;\r\n                        params.forEach(p => {\r\n                            const indicator = p.seriesName;\r\n                            const value = p.value;\r\n                            let level = '';\r\n                            let diff = '';\r\n                            if (indicator === '溶解氧') {\r\n                                level = value >= 7.5 ? 'Ⅰ类' : value >= 6.0 ? 'Ⅱ类' : 'Ⅲ类';\r\n                                diff = value >= 7.5 ? '达标' : `距Ⅰ类差${(7.5 - value).toFixed(2)}`;\r\n                            } else if (indicator === '氨氮') {\r\n                                level = value <= 0.15 ? 'Ⅰ类' : value <= 0.5 ? 'Ⅱ类' : 'Ⅲ类';\r\n                                diff = value <= 0.15 ? '达标' : `距Ⅰ类差${(value - 0.15).toFixed(3)}`;\r\n                            } else {\r\n                                level = value <= 0.02 ? 'Ⅰ类' : value <= 0.1 ? 'Ⅱ类' : 'Ⅲ类';\r\n                                diff = value <= 0.02 ? '达标' : `距Ⅰ类差${(value - 0.02).toFixed(3)}`;\r\n                            }\r\n                            html += `<div style=\"display:flex;align-items:center;gap:8px;margin:3px 0\">\r\n                                <span style=\"display:inline-block;width:10px;height:10px;background:${p.color};border-radius:2px\"></span>\r\n                                <span>${indicator}: <b>${value}</b> (${level}, ${diff})\r\n                            </div>`;\r\n                        });\r\n                        return html;\r\n                    }\r\n                },\r\n                legend: {\r\n                    data: ['溶解氧', '氨氮', '总磷'],\r\n                    textStyle: { color: '#94a3b8', fontSize: 12 },\r\n                    top: 0\r\n                },\r\n                grid: {\r\n                    top: '15%',\r\n                    left: '3%',\r\n                    right: '4%',\r\n                    bottom: '10%',\r\n                    containLabel: true\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    data: provinces,\r\n                    axisLabel: {\r\n                        color: '#e2e8f0',\r\n                        fontSize: 13,\r\n                        fontWeight: 'bold'\r\n                    },\r\n                    axisLine: { lineStyle: { color: 'rgba(14, 165, 233, 0.3)' } }\r\n                },\r\n                yAxis: [\r\n                    {\r\n                        type: 'value',\r\n                        name: '溶解氧(mg/L)',\r\n                        position: 'left',\r\n                        axisLabel: { color: '#94a3b8', fontSize: 11 },\r\n                        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },\r\n                        nameTextStyle: { color: '#0ea5e9' }\r\n                    },\r\n                    {\r\n                        type: 'value',\r\n                        name: '氨氮/总磷(mg/L)',\r\n                        position: 'right',\r\n                        axisLabel: { color: '#94a3b8', fontSize: 11 },\r\n                        nameTextStyle: { color: '#f59e0b' }\r\n                    }\r\n                ],\r\n                series: [\r\n                    {\r\n                        name: '溶解氧',\r\n                        type: 'bar',\r\n                        data: doData,\r\n                        barWidth: '20%',\r\n                        label: {\r\n                            show: true,\r\n                            position: 'top',\r\n                            color: '#0ea5e9',\r\n                            fontSize: 10,\r\n                            formatter: '{c}'\r\n                        }\r\n                    },\r\n                    {\r\n                        name: '氨氮',\r\n                        type: 'bar',\r\n                        yAxisIndex: 1,\r\n                        data: nhData,\r\n                        barWidth: '20%',\r\n                        label: {\r\n                            show: true,\r\n                            position: 'top',\r\n                            color: '#f59e0b',\r\n                            fontSize: 10,\r\n                            formatter: '{c}'\r\n                        }\r\n                    },\r\n                    {\r\n                        name: '总磷',\r\n                        type: 'bar',\r\n                        yAxisIndex: 1,\r\n                        data: tpData,\r\n                        barWidth: '20%',\r\n                        label: {\r\n                            show: true,\r\n                            position: 'top',\r\n                            color: '#8b5cf6',\r\n                            fontSize: 10,\r\n                            formatter: '{c}'\r\n                        }\r\n                    }\r\n                ]\r\n            };\r\n            \r\n            charts.bar.setOption(option);\r\n            \r\n            // 点击事件\r\n            charts.bar.on('click', function(params) {\r\n                const index = params.dataIndex;\r\n                const province = provinceData[index].province;\r\n                focusMapOnProvince(province);\r\n                showProvincePopup(province);\r\n            });\r\n        }\r\n        \r\n        // 渲染地图\r\n        function renderMap() {\r\n            fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')\r\n                .then(res => res.json())\r\n                .then(geoJson => {\r\n                    echarts.registerMap('china', geoJson);\r\n                    \r\n                    // 高亮六省市\r\n                    const highlightProvinces = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省'];\r\n                    \r\n                    const option = {\r\n                        backgroundColor: 'transparent',\r\n                        tooltip: {\r\n                            trigger: 'item',\r\n                            formatter: function(params) {\r\n                                if (params.dataType === 'geo') {\r\n                                    return highlightProvinces.includes(params.name) ? \r\n                                        `<b>${params.name}</b><br/>点击查看详情` : params.name;\r\n                                }\r\n                                const d = params.data;\r\n                                return `<div style=\"font-weight:bold\">${d.name}</div>\r\n                                        <div>溶解氧: ${d.dissolved_oxygen} mg/L</div>\r\n                                        <div>氨氮: ${d.ammonia_nitrogen} mg/L</div>\r\n                                        <div>等级: ${d.level}</div>`;\r\n                            }\r\n                        },\r\n                        geo: {\r\n                            map: 'china',\r\n                            roam: true,\r\n                            zoom: 5,\r\n                            center: [115, 37],\r\n                            label: {\r\n                                show: true,\r\n                                color: '#e2e8f0',\r\n                                fontSize: 11,\r\n                                fontWeight: 'bold'\r\n                            },\r\n                            itemStyle: {\r\n                                areaColor: 'rgba(30, 41, 59, 0.8)',\r\n                                borderColor: 'rgba(14, 165, 233, 0.3)',\r\n                                borderWidth: 1\r\n                            },\r\n                            emphasis: {\r\n                                label: { color: '#fff' },\r\n                                itemStyle: {\r\n                                    areaColor: 'rgba(14, 165, 233, 0.4)'\r\n                                }\r\n                            },\r\n                            select: {\r\n                                itemStyle: {\r\n                                    areaColor: 'rgba(34, 197, 94, 0.5)'\r\n                                }\r\n                            },\r\n                            regions: highlightProvinces.map(p => ({\r\n                                name: p,\r\n                                itemStyle: {\r\n                                    areaColor: 'rgba(14, 165, 233, 0.2)',\r\n                                    borderColor: '#0ea5e9',\r\n                                    borderWidth: 2\r\n                                },\r\n                                emphasis: {\r\n                                    itemStyle: {\r\n                                        areaColor: 'rgba(14, 165, 233, 0.5)'\r\n                                    }\r\n                                }\r\n                            }))\r\n                        },\r\n                        series: [{\r\n                            type: 'effectScatter',\r\n                            coordinateSystem: 'geo',\r\n                            data: mapData,\r\n                            symbolSize: function(val) {\r\n                                return Math.max(8, Math.min(20, val[2] || 8));\r\n                            },\r\n                            showEffectOn: 'render',\r\n                            rippleEffect: {\r\n                                brushType: 'stroke',\r\n                                scale: 3\r\n                            },\r\n                            itemStyle: {\r\n                                color: function(params) {\r\n                                    return params.data.color || '#0ea5e9';\r\n                                }\r\n                            }\r\n                        }]\r\n                    };\r\n                    \r\n                    charts.map.setOption(option);\r\n                    \r\n                    // 地图点击事件\r\n                    charts.map.on('click', function(params) {\r\n                        if (highlightProvinces.includes(params.name)) {\r\n                            showProvincePopup(params.name);\r\n                        }\r\n                    });\r\n                })\r\n                .catch(err => {\r\n                    console.error('[DEBUG] Map load failed:', err);\r\n                    renderMapFallback('地图底图加载失败，暂无法展示真实站点分布');\r\n                });\r\n        }\r\n        \r\n        // 地图加载失败时的回退显示\r\n        function renderMapFallback(message = '暂无真实站点地图数据') {\r\n            console.log('[DEBUG] Rendering map empty state');\r\n            charts.map.clear();\r\n            charts.map.setOption({\r\n                backgroundColor: 'transparent',\r\n                title: {\r\n                    text: '六省市监测站点分布',\r\n                    subtext: message,\r\n                    left: 'center',\r\n                    top: 'center',\r\n                    textStyle: { color: '#e2e8f0', fontSize: 16 },\r\n                    subtextStyle: { color: '#64748b', fontSize: 12 }\r\n                }\r\n            }, true);\r\n        }\r\n        \r\n        // 聚焦地图到指定省份\r\n        function focusMapOnProvince(province) {\r\n            // 地图聚焦逻辑\r\n            const provinceCenters = {\r\n                '北京市': [116.4, 39.9],\r\n                '天津市': [117.2, 39.1],\r\n                '河北省': [114.5, 38.0],\r\n                '山西省': [112.5, 37.9],\r\n                '山东省': [117.0, 36.7],\r\n                '河南省': [113.6, 34.8]\r\n            };\r\n            \r\n            const center = provinceCenters[province];\r\n            if (center) {\r\n                charts.map.setOption({\r\n                    geo: {\r\n                        center: center,\r\n                        zoom: 7\r\n                    }\r\n                });\r\n            }\r\n        }\r\n        \r\n        // 显示省份弹窗\r\n        function showProvincePopup(province) {\r\n            const data = provinceData.find(d => d.province === province);\r\n            if (!data) return;\r\n            \r\n            const popup = document.getElementById('mapPopup');\r\n            const title = document.getElementById('popupTitle');\r\n            const content = document.getElementById('popupContent');\r\n            \r\n            title.textContent = province;\r\n            \r\n            const rank = provinceData.findIndex(d => d.province === province) + 1;\r\n            const suggestion = getProvinceSuggestion(province);\r\n            \r\n            content.innerHTML = `\r\n                <div class=\"indicator-row\">\r\n                    <div class=\"indicator-info\">\r\n                        <div class=\"indicator-icon do\"><i class=\"fa fa-tint\"></i></div>\r\n                        <div class=\"indicator-name-popup\">溶解氧</div>\r\n                    </div>\r\n                    <div style=\"display:flex;align-items:center;gap:10px\">\r\n                        <div class=\"indicator-value\" style=\"color:#0ea5e9\">${data.do}</div>\r\n                        <div class=\"indicator-level ${data.do >= 7.5 ? 'level-1' : data.do >= 6.0 ? 'level-2' : 'level-3'}\">\r\n                            ${data.do >= 7.5 ? 'Ⅰ类' : data.do >= 6.0 ? 'Ⅱ类' : 'Ⅲ类'}\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                <div class=\"indicator-row\">\r\n                    <div class=\"indicator-info\">\r\n                        <div class=\"indicator-icon nh\"><i class=\"fa fa-filter\"></i></div>\r\n                        <div class=\"indicator-name-popup\">氨氮</div>\r\n                    </div>\r\n                    <div style=\"display:flex;align-items:center;gap:10px\">\r\n                        <div class=\"indicator-value\" style=\"color:#f59e0b\">${data.nh}</div>\r\n                        <div class=\"indicator-level ${data.nh <= 0.15 ? 'level-1' : data.nh <= 0.5 ? 'level-2' : 'level-3'}\">\r\n                            ${data.nh <= 0.15 ? 'Ⅰ类' : data.nh <= 0.5 ? 'Ⅱ类' : 'Ⅲ类'}\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                <div class=\"indicator-row\">\r\n                    <div class=\"indicator-info\">\r\n                        <div class=\"indicator-icon tp\"><i class=\"fa fa-flask\"></i></div>\r\n                        <div class=\"indicator-name-popup\">总磷</div>\r\n                    </div>\r\n                    <div style=\"display:flex;align-items:center;gap:10px\">\r\n                        <div class=\"indicator-value\" style=\"color:#8b5cf6\">${data.tp}</div>\r\n                        <div class=\"indicator-level ${data.tp <= 0.02 ? 'level-1' : data.tp <= 0.1 ? 'level-2' : 'level-3'}\">\r\n                            ${data.tp <= 0.02 ? 'Ⅰ类' : data.tp <= 0.1 ? 'Ⅱ类' : 'Ⅲ类'}\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                <div class=\"rank-info\">\r\n                    <div class=\"rank-box\">\r\n                        <div class=\"rank-label\">综合排名</div>\r\n                        <div class=\"rank-value\">第${rank}名</div>\r\n                    </div>\r\n                    <div class=\"rank-box\">\r\n                        <div class=\"rank-label\">综合得分</div>\r\n                        <div class=\"rank-value\">${data.score.toFixed(1)}</div>\r\n                    </div>\r\n                </div>\r\n                <div style=\"margin-top:10px;padding:10px;background:rgba(14,165,233,0.1);border-radius:8px\">\r\n                    <div style=\"font-size:12px;color:#94a3b8;margin-bottom:5px\"><i class=\"fa fa-star\" style=\"color:#f59e0b;margin-right:5px\"></i>核心优势</div>\r\n                    <div style=\"font-size:13px;color:#e2e8f0\">${suggestion.advantage}</div>\r\n                </div>\r\n                <div style=\"padding:10px;background:rgba(239,68,68,0.1);border-radius:8px\">\r\n                    <div style=\"font-size:12px;color:#94a3b8;margin-bottom:5px\"><i class=\"fa fa-exclamation-circle\" style=\"color:#ef4444;margin-right:5px\"></i>提升短板</div>\r\n                    <div style=\"font-size:13px;color:#e2e8f0\">${suggestion.weakness}</div>\r\n                </div>\r\n                <div class=\"mini-chart\" id=\"miniChart_${province}\"></div>\r\n            `;\r\n            \r\n            popup.classList.add('active');\r\n            popup.style.left = '50%';\r\n            popup.style.top = '50%';\r\n            popup.style.transform = 'translate(-50%, -50%)';\r\n            \r\n            // 渲染迷你趋势图\r\n            setTimeout(() => renderMiniChart(province), 100);\r\n        }\r\n        \r\n        // 关闭弹窗\r\n        function closePopup() {\r\n            document.getElementById('mapPopup').classList.remove('active');\r\n        }\r\n        \r\n        async function fetchProvinceTrendData(province) {\r\n            if (Object.prototype.hasOwnProperty.call(provinceTrendCache, province)) {\r\n                return provinceTrendCache[province];\r\n            }\r\n\r\n            try {\r\n                const response = await fetch(`${API_BASE}/dashboard/data-by-province?province=${encodeURIComponent(province)}`);\r\n                const result = await response.json();\r\n                if (result.success && result.data && result.data.line && result.data.line.dates && result.data.line.dates.length > 0) {\r\n                    provinceTrendCache[province] = result.data.line;\r\n                    return provinceTrendCache[province];\r\n                }\r\n            } catch (error) {\r\n                console.error('[DEBUG] Province mini trend load failed:', error);\r\n            }\r\n\r\n            provinceTrendCache[province] = null;\r\n            return null;\r\n        }\r\n\r\n        // 渲染迷你趋势图\r\n        async function renderMiniChart(province) {\r\n            const chartDom = document.getElementById(`miniChart_${province}`);\r\n            if (!chartDom) return;\r\n            \r\n            const miniChart = echarts.init(chartDom);\r\n            const lineData = await fetchProvinceTrendData(province);\r\n            if (!lineData) {\r\n                miniChart.setOption({\r\n                    backgroundColor: 'transparent',\r\n                    graphic: {\r\n                        type: 'text',\r\n                        left: 'center',\r\n                        top: 'middle',\r\n                        style: {\r\n                            text: '暂无真实时序数据',\r\n                            fill: '#94a3b8',\r\n                            font: '12px \"Microsoft YaHei\"',\r\n                            textAlign: 'center'\r\n                        }\r\n                    }\r\n                }, true);\r\n                return;\r\n            }\r\n\r\n            let seriesName = '溶解氧';\r\n            let seriesData = lineData.dissolved_oxygen || [];\r\n            let lineColor = '#0ea5e9';\r\n            if (!seriesData.length && lineData.ammonia_nitrogen && lineData.ammonia_nitrogen.length) {\r\n                seriesName = '氨氮';\r\n                seriesData = lineData.ammonia_nitrogen;\r\n                lineColor = '#f59e0b';\r\n            } else if (!seriesData.length && lineData.ph && lineData.ph.length) {\r\n                seriesName = 'PH';\r\n                seriesData = lineData.ph;\r\n                lineColor = '#22c55e';\r\n            }\r\n\r\n            const axisLabels = (lineData.dates || []).map(date => String(date).slice(5, 10));\r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                grid: { top: 10, left: 10, right: 10, bottom: 20 },\r\n                tooltip: {\r\n                    trigger: 'axis',\r\n                    formatter: params => `${seriesName}: ${params[0].value}`\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    data: axisLabels,\r\n                    axisLine: { show: false },\r\n                    axisTick: { show: false },\r\n                    axisLabel: { color: '#64748b', fontSize: 9 }\r\n                },\r\n                yAxis: {\r\n                    type: 'value',\r\n                    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } },\r\n                    axisLabel: { show: false }\r\n                },\r\n                series: [{\r\n                    type: 'line',\r\n                    smooth: true,\r\n                    data: seriesData,\r\n                    lineStyle: { color: lineColor, width: 2 },\r\n                    areaStyle: {\r\n                        color: {\r\n                            type: 'linear',\r\n                            x: 0, y: 0, x2: 0, y2: 1,\r\n                            colorStops: [\r\n                                { offset: 0, color: `${lineColor}4D` },\r\n                                { offset: 1, color: `${lineColor}00` }\r\n                            ]\r\n                        }\r\n                    },\r\n                    symbol: 'none'\r\n                }]\r\n            };\r\n            miniChart.setOption(option);\r\n        }\r\n        \r\n        // 更新排名表\r\n        function updateRankingTable() {\r\n            const tbody = document.getElementById('rankingTableBody');\r\n            \r\n            // 排序数据\r\n            let sortedData = [...provinceData];\r\n            if (sortField === 'do') {\r\n                sortedData.sort((a, b) => sortAsc ? a.do - b.do : b.do - a.do);\r\n            } else if (sortField === 'nh') {\r\n                sortedData.sort((a, b) => sortAsc ? a.nh - b.nh : b.nh - a.nh);\r\n            } else if (sortField === 'tp') {\r\n                sortedData.sort((a, b) => sortAsc ? a.tp - b.tp : b.tp - a.tp);\r\n            } else {\r\n                sortedData.sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);\r\n            }\r\n\r\n            if (!sortedData.length) {\r\n                tbody.innerHTML = `\r\n                    <tr>\r\n                        <td colspan=\"7\" style=\"text-align:center;color:#94a3b8;padding:24px 12px;\">暂无真实省份对比数据</td>\r\n                    </tr>\r\n                `;\r\n                return;\r\n            }\r\n            \r\n            tbody.innerHTML = sortedData.map((data, index) => `\r\n                <tr>\r\n                    <td>\r\n                        <span class=\"rank-badge ${index < 3 ? `rank-${index + 1}` : 'rank-other'}\">${index + 1}</span>\r\n                    </td>\r\n                    <td>\r\n                        <div class=\"province-name\">\r\n                            <i class=\"fa fa-map-marker\" style=\"color: #0ea5e9;\"></i>\r\n                            ${data.province}\r\n                        </div>\r\n                    </td>\r\n                    <td style=\"color: ${data.do >= 7.5 ? '#22c55e' : '#f59e0b'}; font-weight: 600;\">${data.do}</td>\r\n                    <td style=\"color: ${data.nh <= 0.15 ? '#22c55e' : '#f59e0b'}; font-weight: 600;\">${data.nh}</td>\r\n                    <td style=\"color: ${data.tp <= 0.02 ? '#22c55e' : '#f59e0b'}; font-weight: 600;\">${data.tp}</td>\r\n                    <td style=\"color: #0ea5e9; font-weight: bold;\">${data.score.toFixed(1)}</td>\r\n                    <td>\r\n                        <span class=\"indicator-level ${data.levelClass}\">${data.level}</span>\r\n                    </td>\r\n                </tr>\r\n            `).join('');\r\n        }\r\n        \r\n        // 初始化排序处理器\r\n        function initSortHandlers() {\r\n            document.querySelectorAll('.ranking-table th.sortable').forEach(th => {\r\n                th.addEventListener('click', function() {\r\n                    const field = this.dataset.sort;\r\n                    if (sortField === field) {\r\n                        sortAsc = !sortAsc;\r\n                    } else {\r\n                        sortField = field;\r\n                        sortAsc = true;\r\n                    }\r\n                    \r\n                    // 更新排序指示器\r\n                    document.querySelectorAll('.ranking-table th').forEach(h => {\r\n                        h.classList.remove('sort-asc', 'sort-desc');\r\n                    });\r\n                    this.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');\r\n                    \r\n                    updateRankingTable();\r\n                });\r\n            });\r\n        }\r\n        \r\n        // 更新管控建议\r\n        function updateSuggestions() {\r\n            const container = document.getElementById('suggestionsContainer');\r\n            if (!provinceData.length) {\r\n                container.innerHTML = `\r\n                    <div class=\"suggestion-card\">\r\n                        <div class=\"suggestion-title\">\r\n                            <i class=\"fa fa-info-circle\"></i>\r\n                            暂无真实建议\r\n                        </div>\r\n                        <div class=\"suggestion-content\">当前数据库暂无足够的省份对比样本，无法生成治理建议。</div>\r\n                    </div>\r\n                `;\r\n                return;\r\n            }\r\n            \r\n            // 根据排名显示建议\r\n            const top3 = provinceData.slice(0, 3);\r\n            const bottom3 = provinceData.slice(3);\r\n            \r\n            let html = '';\r\n            \r\n            // 表现优秀的省份\r\n            top3.forEach(data => {\r\n                const suggestion = getProvinceSuggestion(data.province);\r\n                if (suggestion) {\r\n                    html += `\r\n                        <div class=\"suggestion-card\">\r\n                            <div class=\"suggestion-title\">\r\n                                <i class=\"fa fa-check-circle\"></i>\r\n                                ${data.province} - 优秀示范\r\n                            </div>\r\n                            <div class=\"suggestion-content\">${suggestion.advantage}</div>\r\n                            <div>\r\n                                <span class=\"suggestion-tag tag-maintain\">维持现状</span>\r\n                                ${suggestion.tags.map(t => `<span class=\"suggestion-tag tag-improve\">${t}</span>`).join('')}\r\n                            </div>\r\n                        </div>\r\n                    `;\r\n                }\r\n            });\r\n            \r\n            // 需要改进的省份\r\n            bottom3.forEach(data => {\r\n                const suggestion = getProvinceSuggestion(data.province);\r\n                if (suggestion) {\r\n                    html += `\r\n                        <div class=\"suggestion-card\" style=\"border-left-color: #ef4444;\">\r\n                            <div class=\"suggestion-title\" style=\"color: #ef4444;\">\r\n                                <i class=\"fa fa-exclamation-triangle\"></i>\r\n                                ${data.province} - 重点整改\r\n                            </div>\r\n                            <div class=\"suggestion-content\">${suggestion.weakness}</div>\r\n                            <div>\r\n                                <span class=\"suggestion-tag tag-priority\">${suggestion.priority}</span>\r\n                                ${suggestion.tags.map(t => `<span class=\"suggestion-tag tag-improve\">${t}</span>`).join('')}\r\n                            </div>\r\n                        </div>\r\n                    `;\r\n                }\r\n            });\r\n            \r\n            container.innerHTML = html;\r\n        }\r\n        \r\n        // 导出数据\r\n        function exportData() {\r\n            if (!provinceData.length) {\r\n                showToast('暂无真实数据可导出');\r\n                return;\r\n            }\r\n            const headers = ['排名', '省市', '溶解氧(mg/L)', '氨氮(mg/L)', '总磷(mg/L)', '综合得分', '水质等级'];\r\n            const rows = provinceData.map((data, index) => [\r\n                index + 1,\r\n                data.province,\r\n                data.do,\r\n                data.nh,\r\n                data.tp,\r\n                data.score.toFixed(1),\r\n                data.level\r\n            ]);\r\n            \r\n            let csv = '\\uFEFF' + headers.join(',') + '\\n';\r\n            rows.forEach(row => {\r\n                csv += row.join(',') + '\\n';\r\n            });\r\n            \r\n            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });\r\n            const link = document.createElement('a');\r\n            link.href = URL.createObjectURL(blob);\r\n            link.download = `津水流域六省市水质对比_${new Date().toISOString().slice(0, 10)}.csv`;\r\n            link.click();\r\n            \r\n            showToast('数据导出成功');\r\n        }\r\n        \r\n        // 显示加载状态\r\n        function showLoading() {\r\n            document.body.style.cursor = 'wait';\r\n        }\r\n        \r\n        // 隐藏加载状态\r\n        function hideLoading() {\r\n            document.body.style.cursor = 'default';\r\n        }\r\n        \r\n        // Toast提示\r\n        function showToast(message) {\r\n            const existing = document.querySelector('.toast-message');\r\n            if (existing) existing.remove();\r\n            \r\n            const toast = document.createElement('div');\r\n            toast.className = 'toast-message';\r\n            toast.innerHTML = `\r\n                <div style=\"\r\n                    position: fixed;\r\n                    top: 80px;\r\n                    left: 50%;\r\n                    transform: translateX(-50%);\r\n                    background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(34, 197, 94, 0.9));\r\n                    color: white;\r\n                    padding: 12px 24px;\r\n                    border-radius: 8px;\r\n                    font-size: 14px;\r\n                    z-index: 10000;\r\n                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\r\n                \">${message}</div>\r\n            `;\r\n            document.body.appendChild(toast);\r\n            setTimeout(() => toast.remove(), 3000);\r\n        }\r\n        \r\n        // 点击空白处关闭弹窗\r\n        document.addEventListener('click', function(e) {\r\n            const popup = document.getElementById('mapPopup');\r\n            const mapChart = document.getElementById('mapChart');\r\n            if (popup.classList.contains('active') && !popup.contains(e.target) && !mapChart.contains(e.target)) {\r\n                closePopup();\r\n            }\r\n        });"], Component: ProvinceComparisonPage },
  "register.html": { title: "海河六域 - 注册", scripts: ["../config/site.config.js","../config/runtime-config.js","https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"], inlineScripts: [], Component: RegisterPage },
  "sandbox.html": { title: "流域时空推演沙盘｜模型预测与多维验证", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: [], Component: SandboxPage },
  "trend-analysis.html": { title: "海河六域 - 时序趋势专项分析屏", scripts: ["https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js","../config/site.config.js","../config/runtime-config.js"], inlineScripts: ["// API基础URL\r\n        const API_BASE = (() => {\r\n            if (window.HAIHE_RUNTIME?.resolveApi) {\r\n                return window.HAIHE_RUNTIME.resolveApi('/api').replace(/\\/$/, '');\r\n            }\r\n            if (window.location.protocol === 'file:') {\r\n                return 'http://127.0.0.1:5001/api';\r\n            }\r\n            return `${window.location.origin}/api`;\r\n        })();\r\n        \r\n        let charts = {};\r\n        let currentView = 'all';\r\n        \r\n        // 真实数据存储\r\n        const timeSeriesData = {\r\n            dates: [],\r\n            dissolved_oxygen: [],\r\n            ph: [],\r\n            ammonia_nitrogen: []\r\n        };\r\n        \r\n        // 统计数据存储\r\n        const statsData = {\r\n            do: { max: 0, min: 0, avg: 0, median: 0, compliance: 0 },\r\n            ph: { max: 0, min: 0, avg: 0, median: 0, compliance: 0 },\r\n            nh: { max: 0, min: 0, avg: 0, median: 0, compliance: 0 }\r\n        };\r\n        \r\n        // 初始化\r\n        document.addEventListener('DOMContentLoaded', function() {\r\n            initCharts();\r\n            loadRealData();\r\n            updateTime();\r\n            setInterval(updateTime, 1000);\r\n            \r\n            window.addEventListener('resize', function() {\r\n                Object.values(charts).forEach(chart => chart && chart.resize());\r\n            });\r\n        });\r\n        \r\n        // 加载真实数据\r\n        async function loadRealData() {\r\n            try {\r\n                showLoading();\r\n                console.log('[DEBUG] Loading trend analysis data from:', API_BASE);\r\n                \r\n                // 并行加载时序数据和统计数据\r\n                const [timeseriesRes, overviewRes, boxplotRes] = await Promise.all([\r\n                    fetch(`${API_BASE}/dashboard/timeseries-data`).then(r => {\r\n                        console.log('[DEBUG] Timeseries response status:', r.status);\r\n                        return r.json();\r\n                    }).catch(e => {\r\n                        console.error('[DEBUG] Timeseries fetch error:', e);\r\n                        return { success: false, error: e.message };\r\n                    }),\r\n                    fetch(`${API_BASE}/dashboard/overview-stats`).then(r => r.json()).catch(e => {\r\n                        console.error('[DEBUG] Overview fetch error:', e);\r\n                        return { success: false };\r\n                    }),\r\n                    fetch(`${API_BASE}/dashboard/boxplot-data`).then(r => r.json()).catch(e => {\r\n                        console.error('[DEBUG] Boxplot fetch error:', e);\r\n                        return { success: false };\r\n                    })\r\n                ]);\r\n                \r\n                console.log('[DEBUG] Timeseries response:', timeseriesRes);\r\n                \r\n                if (timeseriesRes.success && timeseriesRes.data && timeseriesRes.data.dates && timeseriesRes.data.dates.length > 0) {\r\n                    console.log('[DEBUG] Processing timeseries data:', timeseriesRes.data);\r\n                    timeSeriesData.dates = timeseriesRes.data.dates;\r\n                    timeSeriesData.dissolved_oxygen = timeseriesRes.data.dissolved_oxygen;\r\n                    timeSeriesData.ph = timeseriesRes.data.ph;\r\n                    timeSeriesData.ammonia_nitrogen = timeseriesRes.data.ammonia_nitrogen;\r\n                    \r\n                    // 更新图表\r\n                    renderDOChart();\r\n                    renderPHChart();\r\n                    renderNHChart();\r\n                    \r\n                    // 计算并更新统计数据\r\n                    calculateStats();\r\n                    updateStatsTable();\r\n                    \r\n                    // 更新分时段对比图\r\n                    renderSeasonChart();\r\n                    \r\n                    // 更新趋势检验结果\r\n                    updateTrendAnalysis();\r\n                    \r\n                    if (timeseriesRes.data.message) {\r\n                        showToast(timeseriesRes.data.message);\r\n                    }\r\n                } else {\r\n                    const message = (timeseriesRes.data && timeseriesRes.data.message) || timeseriesRes.error || '暂无真实时序数据';\r\n                    console.warn('[DEBUG] No valid timeseries data:', message);\r\n                    renderNoDataState(message);\r\n                    showToast(message);\r\n                }\r\n                \r\n                // 处理箱线图数据（用于极值统计）\r\n                if (boxplotRes.success && boxplotRes.data && timeSeriesData.dates.length > 0) {\r\n                    updateStatsFromBoxplot(boxplotRes.data);\r\n                }\r\n                \r\n                hideLoading();\r\n            } catch (error) {\r\n                console.error('[DEBUG] Global error:', error);\r\n                renderNoDataState('数据加载失败，未加载到真实时序数据');\r\n                showToast('数据加载失败，未加载到真实时序数据');\r\n                hideLoading();\r\n            }\r\n        }\r\n\r\n        function setStatsPlaceholder() {\r\n            statsData.do = { max: '--', min: '--', avg: '--', median: '--', compliance: '--' };\r\n            statsData.ph = { max: '--', min: '--', avg: '--', median: '--', compliance: '--' };\r\n            statsData.nh = { max: '--', min: '--', avg: '--', median: '--', compliance: '--' };\r\n        }\r\n\r\n        function renderChartEmpty(chart, message) {\r\n            if (!chart) return;\r\n            chart.clear();\r\n            chart.setOption({\r\n                backgroundColor: 'transparent',\r\n                graphic: {\r\n                    type: 'text',\r\n                    left: 'center',\r\n                    top: 'middle',\r\n                    style: {\r\n                        text: message,\r\n                        fill: '#94a3b8',\r\n                        font: '14px \"Microsoft YaHei\"',\r\n                        textAlign: 'center'\r\n                    }\r\n                }\r\n            }, true);\r\n        }\r\n\r\n        function renderNoDataState(message) {\r\n            timeSeriesData.dates = [];\r\n            timeSeriesData.dissolved_oxygen = [];\r\n            timeSeriesData.ph = [];\r\n            timeSeriesData.ammonia_nitrogen = [];\r\n\r\n            setStatsPlaceholder();\r\n            updateStatsTable();\r\n            updateConclusionBar(true);\r\n\r\n            const emptyMessage = message || '暂无真实时序数据';\r\n            renderChartEmpty(charts.do, emptyMessage);\r\n            renderChartEmpty(charts.ph, emptyMessage);\r\n            renderChartEmpty(charts.nh, emptyMessage);\r\n            renderChartEmpty(charts.season, emptyMessage);\r\n\r\n            const doEl = document.getElementById('doTrend');\r\n            const phEl = document.getElementById('phTrend');\r\n            const nhEl = document.getElementById('nhTrend');\r\n            const conclusionEl = document.getElementById('trendConclusion');\r\n\r\n            if (doEl) doEl.innerHTML = '<i class=\"fa fa-minus\" style=\"color: #64748b;\"></i> 暂无真实趋势数据 <span class=\"trend-status status-stable\">待补充</span>';\r\n            if (phEl) phEl.innerHTML = '<i class=\"fa fa-minus\" style=\"color: #64748b;\"></i> 暂无真实趋势数据 <span class=\"trend-status status-stable\">待补充</span>';\r\n            if (nhEl) nhEl.innerHTML = '<i class=\"fa fa-minus\" style=\"color: #64748b;\"></i> 暂无真实趋势数据 <span class=\"trend-status status-stable\">待补充</span>';\r\n            if (conclusionEl) {\r\n                conclusionEl.innerHTML = `\r\n                    <i class=\"fa fa-info-circle\" style=\"color: #64748b; margin-right: 5px;\"></i>\r\n                    ${emptyMessage}\r\n                `;\r\n            }\r\n        }\r\n        \r\n        // 显示加载状态\r\n        function showLoading() {\r\n            document.body.style.cursor = 'wait';\r\n        }\r\n        \r\n        // 隐藏加载状态\r\n        function hideLoading() {\r\n            document.body.style.cursor = 'default';\r\n        }\r\n        \r\n        // 计算统计数据\r\n        function calculateStats() {\r\n            // 溶解氧统计\r\n            const doValues = timeSeriesData.dissolved_oxygen;\r\n            statsData.do.max = Math.max(...doValues);\r\n            statsData.do.min = Math.min(...doValues);\r\n            statsData.do.avg = (doValues.reduce((a, b) => a + b, 0) / doValues.length).toFixed(2);\r\n            statsData.do.median = calculateMedian(doValues);\r\n            // 计算达标率（>= 7.5 为 I 类）\r\n            statsData.do.compliance = ((doValues.filter(v => v >= 7.5).length / doValues.length) * 100).toFixed(1);\r\n            \r\n            // PH统计\r\n            const phValues = timeSeriesData.ph;\r\n            statsData.ph.max = Math.max(...phValues);\r\n            statsData.ph.min = Math.min(...phValues);\r\n            statsData.ph.avg = (phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(2);\r\n            statsData.ph.median = calculateMedian(phValues);\r\n            // 计算达标率（6-9 为达标）\r\n            statsData.ph.compliance = ((phValues.filter(v => v >= 6 && v <= 9).length / phValues.length) * 100).toFixed(1);\r\n            \r\n            // 氨氮统计\r\n            const nhValues = timeSeriesData.ammonia_nitrogen;\r\n            statsData.nh.max = Math.max(...nhValues);\r\n            statsData.nh.min = Math.min(...nhValues);\r\n            statsData.nh.avg = (nhValues.reduce((a, b) => a + b, 0) / nhValues.length).toFixed(3);\r\n            statsData.nh.median = calculateMedian(nhValues);\r\n            // 计算达标率（<= 0.5 为 II 类）\r\n            statsData.nh.compliance = ((nhValues.filter(v => v <= 0.5).length / nhValues.length) * 100).toFixed(1);\r\n        }\r\n        \r\n        // 计算中位数\r\n        function calculateMedian(arr) {\r\n            const sorted = [...arr].sort((a, b) => a - b);\r\n            const mid = Math.floor(sorted.length / 2);\r\n            return sorted.length % 2 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);\r\n        }\r\n        \r\n        // Mann-Kendall趋势检验（简化版）\r\n        function calculateMannKendall(data) {\r\n            const n = data.length;\r\n            if (n < 3) return { trend: 'stable', pValue: 1 };\r\n            \r\n            let s = 0;\r\n            for (let i = 0; i < n - 1; i++) {\r\n                for (let j = i + 1; j < n; j++) {\r\n                    s += Math.sign(data[j] - data[i]);\r\n                }\r\n            }\r\n            \r\n            // 计算方差\r\n            const varS = n * (n - 1) * (2 * n + 5) / 18;\r\n            \r\n            // 计算Z值\r\n            let z = 0;\r\n            if (s > 0) {\r\n                z = (s - 1) / Math.sqrt(varS);\r\n            } else if (s < 0) {\r\n                z = (s + 1) / Math.sqrt(varS);\r\n            }\r\n            \r\n            // 判断趋势\r\n            const absZ = Math.abs(z);\r\n            let trend = 'stable';\r\n            if (absZ > 1.96) {\r\n                trend = z > 0 ? 'increasing' : 'decreasing';\r\n            }\r\n            \r\n            // 寻找突变点（简化：找到趋势变化最大的位置）\r\n            let changePoint = -1;\r\n            let maxChange = 0;\r\n            for (let i = 1; i < n; i++) {\r\n                const change = Math.abs(data[i] - data[i-1]);\r\n                if (change > maxChange) {\r\n                    maxChange = change;\r\n                    changePoint = i;\r\n                }\r\n            }\r\n            \r\n            return { trend, z, changePoint: changePoint > 0 ? changePoint : -1 };\r\n        }\r\n        \r\n        // 更新趋势检验结果\r\n        function updateTrendAnalysis() {\r\n            // 溶解氧趋势\r\n            const doResult = calculateMannKendall(timeSeriesData.dissolved_oxygen);\r\n            const doEl = document.getElementById('doTrend');\r\n            if (doEl) {\r\n                const doIcon = doResult.trend === 'increasing' ? 'fa-arrow-up' : \r\n                              doResult.trend === 'decreasing' ? 'fa-arrow-down' : 'fa-minus';\r\n                const doColor = doResult.trend === 'increasing' ? '#22c55e' : \r\n                               doResult.trend === 'decreasing' ? '#ef4444' : '#0ea5e9';\r\n                const doText = doResult.trend === 'increasing' ? '整体呈上升趋势' :\r\n                              doResult.trend === 'decreasing' ? '整体呈下降趋势' : '整体保持稳定';\r\n                const doStatus = doResult.trend === 'increasing' ? '显著改善' :\r\n                                 doResult.trend === 'decreasing' ? '需关注' : '高度稳定';\r\n                const doStatusClass = doResult.trend === 'increasing' ? 'status-improving' :\r\n                                      doResult.trend === 'decreasing' ? 'status-stable' : 'status-stable';\r\n                \r\n                doEl.innerHTML = `\r\n                    <i class=\"fa ${doIcon}\" style=\"color: ${doColor};\"></i>\r\n                    ${doText}\r\n                    <span class=\"trend-status ${doStatusClass}\">${doStatus}</span>\r\n                `;\r\n            }\r\n            \r\n            // PH趋势\r\n            const phResult = calculateMannKendall(timeSeriesData.ph);\r\n            const phEl = document.getElementById('phTrend');\r\n            if (phEl) {\r\n                const phIcon = phResult.trend === 'stable' ? 'fa-minus' : \r\n                              phResult.trend === 'increasing' ? 'fa-arrow-up' : 'fa-arrow-down';\r\n                const phText = phResult.trend === 'stable' ? '波动幅度小' :\r\n                              phResult.trend === 'increasing' ? '略有上升' : '略有下降';\r\n                \r\n                phEl.innerHTML = `\r\n                    <i class=\"fa ${phIcon}\" style=\"color: #0ea5e9;\"></i>\r\n                    ${phText}\r\n                    <span class=\"trend-status status-stable\">高度稳定</span>\r\n                `;\r\n            }\r\n            \r\n            // 氨氮趋势\r\n            const nhResult = calculateMannKendall(timeSeriesData.ammonia_nitrogen);\r\n            const nhEl = document.getElementById('nhTrend');\r\n            if (nhEl) {\r\n                const nhIcon = nhResult.trend === 'decreasing' ? 'fa-arrow-down' :\r\n                              nhResult.trend === 'increasing' ? 'fa-arrow-up' : 'fa-minus';\r\n                const nhColor = nhResult.trend === 'decreasing' ? '#22c55e' :\r\n                               nhResult.trend === 'increasing' ? '#ef4444' : '#0ea5e9';\r\n                const nhText = nhResult.trend === 'decreasing' ? '浓度逐步降低' :\r\n                              nhResult.trend === 'increasing' ? '浓度有所上升' : '浓度保持稳定';\r\n                const nhStatus = nhResult.trend === 'decreasing' ? '持续改善' :\r\n                                 nhResult.trend === 'increasing' ? '需关注' : '基本稳定';\r\n                const nhStatusClass = nhResult.trend === 'decreasing' ? 'status-improving' :\r\n                                      nhResult.trend === 'increasing' ? 'status-stable' : 'status-stable';\r\n                \r\n                nhEl.innerHTML = `\r\n                    <i class=\"fa ${nhIcon}\" style=\"color: ${nhColor};\"></i>\r\n                    ${nhText}\r\n                    <span class=\"trend-status ${nhStatusClass}\">${nhStatus}</span>\r\n                `;\r\n            }\r\n            \r\n            // 更新结论\r\n            const conclusionEl = document.getElementById('trendConclusion');\r\n            if (conclusionEl && doResult.changePoint > 0) {\r\n                const changeDate = timeSeriesData.dates[doResult.changePoint] || '未知';\r\n                conclusionEl.innerHTML = `\r\n                    <i class=\"fa fa-info-circle\" style=\"color: #0ea5e9; margin-right: 5px;\"></i>\r\n                    检验结果：${changeDate} 前后出现水质变化趋势拐点，可能与季节变化或治理措施有关\r\n                `;\r\n            }\r\n        }\r\n        \r\n        // 从箱线图数据更新统计\r\n        function updateStatsFromBoxplot(data) {\r\n            if (data.indicators && data.indicators.length > 0) {\r\n                const indicatorMap = {};\r\n                data.indicators.forEach(item => {\r\n                    indicatorMap[item.name] = item.statistics || {};\r\n                });\r\n\r\n                const doStats = indicatorMap['溶解氧'];\r\n                const phStats = indicatorMap['PH'];\r\n                const nhStats = indicatorMap['氨氮'];\r\n\r\n                if (doStats) {\r\n                    statsData.do.min = doStats.min;\r\n                    statsData.do.max = doStats.max;\r\n                    statsData.do.median = doStats.median;\r\n                }\r\n                if (phStats) {\r\n                    statsData.ph.min = phStats.min;\r\n                    statsData.ph.max = phStats.max;\r\n                    statsData.ph.median = phStats.median;\r\n                }\r\n                if (nhStats) {\r\n                    statsData.nh.min = nhStats.min;\r\n                    statsData.nh.max = nhStats.max;\r\n                    statsData.nh.median = nhStats.median;\r\n                }\r\n            }\r\n            updateStatsTable();\r\n        }\r\n        \r\n        // 更新统计表格\r\n        function updateStatsTable() {\r\n            const tbody = document.querySelector('.stats-table tbody');\r\n            if (tbody) {\r\n                const formatCompliance = value => value === '--' ? '--' : `${value}%`;\r\n                tbody.innerHTML = `\r\n                    <tr>\r\n                        <td>\r\n                            <div class=\"stats-indicator do\">\r\n                                <i class=\"fa fa-tint\"></i>溶解氧\r\n                            </div>\r\n                        </td>\r\n                        <td style=\"color: #22c55e;\">${statsData.do.max}</td>\r\n                        <td style=\"color: #f59e0b;\">${statsData.do.min}</td>\r\n                        <td>${statsData.do.avg}</td>\r\n                        <td>${statsData.do.median}</td>\r\n                        <td style=\"color: #22c55e; font-weight: bold;\">${formatCompliance(statsData.do.compliance)}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <div class=\"stats-indicator ph\">\r\n                                <i class=\"fa fa-flask\"></i>PH\r\n                            </div>\r\n                        </td>\r\n                        <td style=\"color: #22c55e;\">${statsData.ph.max}</td>\r\n                        <td style=\"color: #22c55e;\">${statsData.ph.min}</td>\r\n                        <td>${statsData.ph.avg}</td>\r\n                        <td>${statsData.ph.median}</td>\r\n                        <td style=\"color: #22c55e; font-weight: bold;\">${formatCompliance(statsData.ph.compliance)}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <div class=\"stats-indicator nh\">\r\n                                <i class=\"fa fa-filter\"></i>氨氮\r\n                            </div>\r\n                        </td>\r\n                        <td style=\"color: #f59e0b;\">${statsData.nh.max}</td>\r\n                        <td style=\"color: #22c55e;\">${statsData.nh.min}</td>\r\n                        <td>${statsData.nh.avg}</td>\r\n                        <td>${statsData.nh.median}</td>\r\n                        <td style=\"color: #22c55e; font-weight: bold;\">${formatCompliance(statsData.nh.compliance)}</td>\r\n                    </tr>\r\n                `;\r\n            }\r\n            \r\n            // 更新顶部结论栏\r\n            updateConclusionBar();\r\n        }\r\n        \r\n        // 更新顶部结论栏\r\n        function updateConclusionBar(isEmpty = false) {\r\n            const tags = document.querySelectorAll('.conclusion-tag');\r\n            if (tags.length >= 3) {\r\n                if (isEmpty) {\r\n                    tags[0].querySelector('.tag-value').innerHTML = '暂无真实数据';\r\n                    tags[1].querySelector('.tag-value').innerHTML = '暂无真实数据';\r\n                    tags[2].querySelector('.tag-value').innerHTML = '暂无真实数据';\r\n                    return;\r\n                }\r\n                tags[0].querySelector('.tag-value').innerHTML = `\r\n                    <span class=\"tag-highlight\">${statsData.do.compliance}%</span> 以上时间达 <span class=\"tag-highlight\">Ⅰ类</span> 标准\r\n                `;\r\n                tags[1].querySelector('.tag-value').innerHTML = `\r\n                    全程稳定在 <span class=\"tag-highlight\">${statsData.ph.min}-${statsData.ph.max}</span>，${statsData.ph.compliance}% 符合国标\r\n                `;\r\n                tags[2].querySelector('.tag-value').innerHTML = `\r\n                    <span class=\"tag-highlight\">${statsData.nh.compliance}%</span> 以上时间达 <span class=\"tag-highlight\">Ⅱ类</span> 标准，无超标\r\n                `;\r\n            }\r\n        }\r\n        \r\n        // Toast提示\r\n        function showToast(message) {\r\n            const existing = document.querySelector('.toast-message');\r\n            if (existing) existing.remove();\r\n            \r\n            const toast = document.createElement('div');\r\n            toast.className = 'toast-message';\r\n            toast.innerHTML = `\r\n                <div style=\"\r\n                    position: fixed;\r\n                    top: 80px;\r\n                    left: 50%;\r\n                    transform: translateX(-50%);\r\n                    background: rgba(239, 68, 68, 0.9);\r\n                    color: white;\r\n                    padding: 12px 24px;\r\n                    border-radius: 8px;\r\n                    font-size: 14px;\r\n                    z-index: 10000;\r\n                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\r\n                \">${message}</div>\r\n            `;\r\n            document.body.appendChild(toast);\r\n            setTimeout(() => toast.remove(), 3000);\r\n        }\r\n        \r\n        // 更新时间\r\n        function updateTime() {\r\n            const now = new Date();\r\n            const timeStr = now.toLocaleString('zh-CN', {\r\n                year: 'numeric',\r\n                month: '2-digit',\r\n                day: '2-digit',\r\n                hour: '2-digit',\r\n                minute: '2-digit',\r\n                second: '2-digit'\r\n            });\r\n            document.getElementById('currentTime').textContent = timeStr;\r\n        }\r\n        \r\n        // 返回大屏\r\n        function goBack() {\r\n            window.location.href = 'dashboard.html';\r\n        }\r\n        \r\n        // 初始化图表\r\n        function initCharts() {\r\n            charts.do = echarts.init(document.getElementById('doChart'));\r\n            charts.ph = echarts.init(document.getElementById('phChart'));\r\n            charts.nh = echarts.init(document.getElementById('nhChart'));\r\n            charts.season = echarts.init(document.getElementById('seasonChart'));\r\n        }\r\n        \r\n        // 渲染溶解氧图表\r\n        function renderDOChart() {\r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    trigger: 'axis',\r\n                    formatter: function(params) {\r\n                        const data = params[0];\r\n                        const value = data.value;\r\n                        let level = 'Ⅰ类';\r\n                        if (value < 7.5) level = 'Ⅱ类';\r\n                        if (value < 6.0) level = 'Ⅲ类';\r\n                        \r\n                        let reason = '正常运行';\r\n                        const month = parseInt(data.name.split('-')[1]);\r\n                        if (month >= 6 && month <= 8) reason = '夏季水温升高，溶解氧自然降低';\r\n                        if (month >= 12 || month <= 2) reason = '冬季水温低，溶解氧饱和度高';\r\n                        \r\n                        return `<div style=\"font-weight:bold\">${data.name}</div>\r\n                                <div>溶解氧: <span style=\"color:#0ea5e9;font-weight:bold\">${value}</span> mg/L</div>\r\n                                <div>水质等级: <span style=\"color:#00e400\">${level}</span></div>\r\n                                <div style=\"color:#94a3b8;font-size:12px;margin-top:5px\">${reason}</div>`;\r\n                    }\r\n                },\r\n                grid: {\r\n                    top: '10%',\r\n                    left: '3%',\r\n                    right: '4%',\r\n                    bottom: '5%',\r\n                    containLabel: true\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    boundaryGap: false,\r\n                    data: timeSeriesData.dates,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10,\r\n                        rotate: 30\r\n                    },\r\n                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }\r\n                },\r\n                yAxis: {\r\n                    type: 'value',\r\n                    min: 5,\r\n                    max: 13,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10,\r\n                        formatter: '{value} mg/L'\r\n                    },\r\n                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }\r\n                },\r\n                series: [\r\n                    // Ⅰ类水质区间背景\r\n                    {\r\n                        type: 'line',\r\n                        markArea: {\r\n                            silent: true,\r\n                            itemStyle: {\r\n                                color: 'rgba(0, 228, 0, 0.1)'\r\n                            },\r\n                            data: [[{\r\n                                yAxis: 7.5\r\n                            }, {\r\n                                yAxis: 13\r\n                            }]]\r\n                        }\r\n                    },\r\n                    // Ⅱ类水质区间背景\r\n                    {\r\n                        type: 'line',\r\n                        markArea: {\r\n                            silent: true,\r\n                            itemStyle: {\r\n                                color: 'rgba(255, 255, 0, 0.1)'\r\n                            },\r\n                            data: [[{\r\n                                yAxis: 6.0\r\n                            }, {\r\n                                yAxis: 7.5\r\n                            }]]\r\n                        }\r\n                    },\r\n                    // Ⅲ类水质区间背景\r\n                    {\r\n                        type: 'line',\r\n                        markArea: {\r\n                            silent: true,\r\n                            itemStyle: {\r\n                                color: 'rgba(255, 126, 0, 0.1)'\r\n                            },\r\n                            data: [[{\r\n                                yAxis: 5.0\r\n                            }, {\r\n                                yAxis: 6.0\r\n                            }]]\r\n                        }\r\n                    },\r\n                    // 国标限值线\r\n                    {\r\n                        type: 'line',\r\n                        markLine: {\r\n                            silent: true,\r\n                            symbol: 'none',\r\n                            lineStyle: {\r\n                                type: 'dashed',\r\n                                width: 1\r\n                            },\r\n                            data: [\r\n                                { yAxis: 7.5, lineStyle: { color: '#00e400' }, label: { formatter: 'Ⅰ类线', color: '#00e400', fontSize: 10 } },\r\n                                { yAxis: 6.0, lineStyle: { color: '#ffff00' }, label: { formatter: 'Ⅱ类线', color: '#ffff00', fontSize: 10 } },\r\n                                { yAxis: 5.0, lineStyle: { color: '#ff7e00' }, label: { formatter: 'Ⅲ类线', color: '#ff7e00', fontSize: 10 } }\r\n                            ]\r\n                        }\r\n                    },\r\n                    // 数据折线\r\n                    {\r\n                        name: '溶解氧',\r\n                        type: 'line',\r\n                        smooth: true,\r\n                        data: timeSeriesData.dissolved_oxygen,\r\n                        lineStyle: { color: '#0ea5e9', width: 2 },\r\n                        itemStyle: { color: '#0ea5e9' },\r\n                        symbol: 'circle',\r\n                        symbolSize: 6,\r\n                        markPoint: {\r\n                            data: [\r\n                                { type: 'max', name: '最大值', itemStyle: { color: '#22c55e' } },\r\n                                { type: 'min', name: '最小值', itemStyle: { color: '#f59e0b' } }\r\n                            ],\r\n                            label: { color: '#fff', fontSize: 10 }\r\n                        }\r\n                    }\r\n                ]\r\n            };\r\n            \r\n            charts.do.setOption(option);\r\n        }\r\n        \r\n        // 渲染PH图表\r\n        function renderPHChart() {\r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    trigger: 'axis',\r\n                    formatter: function(params) {\r\n                        const data = params[0];\r\n                        const value = data.value;\r\n                        let status = '符合国标';\r\n                        if (value < 6 || value > 9) status = '超标';\r\n                        \r\n                        return `<div style=\"font-weight:bold\">${data.name}</div>\r\n                                <div>PH值: <span style=\"color:#22c55e;font-weight:bold\">${value}</span></div>\r\n                                <div>状态: <span style=\"color:#22c55e\">${status}</span></div>\r\n                                <div style=\"color:#94a3b8;font-size:12px;margin-top:5px\">水质酸碱度稳定</div>`;\r\n                    }\r\n                },\r\n                grid: {\r\n                    top: '10%',\r\n                    left: '3%',\r\n                    right: '4%',\r\n                    bottom: '5%',\r\n                    containLabel: true\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    boundaryGap: false,\r\n                    data: timeSeriesData.dates,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10,\r\n                        rotate: 30\r\n                    },\r\n                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }\r\n                },\r\n                yAxis: {\r\n                    type: 'value',\r\n                    min: 7.5,\r\n                    max: 9.0,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10\r\n                    },\r\n                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }\r\n                },\r\n                series: [\r\n                    // 国标区间背景\r\n                    {\r\n                        type: 'line',\r\n                        markArea: {\r\n                            silent: true,\r\n                            itemStyle: {\r\n                                color: 'rgba(34, 197, 94, 0.1)'\r\n                            },\r\n                            data: [[{\r\n                                yAxis: 6\r\n                            }, {\r\n                                yAxis: 9\r\n                            }]]\r\n                        }\r\n                    },\r\n                    // 国标限值线\r\n                    {\r\n                        type: 'line',\r\n                        markLine: {\r\n                            silent: true,\r\n                            symbol: 'none',\r\n                            lineStyle: {\r\n                                type: 'dashed',\r\n                                width: 1,\r\n                                color: '#22c55e'\r\n                            },\r\n                            data: [\r\n                                { yAxis: 6, label: { formatter: '国标下限', color: '#22c55e', fontSize: 10 } },\r\n                                { yAxis: 9, label: { formatter: '国标上限', color: '#22c55e', fontSize: 10 } }\r\n                            ]\r\n                        }\r\n                    },\r\n                    // 数据折线\r\n                    {\r\n                        name: 'PH',\r\n                        type: 'line',\r\n                        smooth: true,\r\n                        data: timeSeriesData.ph,\r\n                        lineStyle: { color: '#22c55e', width: 2 },\r\n                        itemStyle: { color: '#22c55e' },\r\n                        symbol: 'circle',\r\n                        symbolSize: 6,\r\n                        markPoint: {\r\n                            data: [\r\n                                { type: 'max', name: '最大值', itemStyle: { color: '#0ea5e9' } },\r\n                                { type: 'min', name: '最小值', itemStyle: { color: '#0ea5e9' } }\r\n                            ],\r\n                            label: { color: '#fff', fontSize: 10 }\r\n                        }\r\n                    }\r\n                ]\r\n            };\r\n            \r\n            charts.ph.setOption(option);\r\n        }\r\n        \r\n        // 渲染氨氮图表\r\n        function renderNHChart() {\r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    trigger: 'axis',\r\n                    formatter: function(params) {\r\n                        const data = params[0];\r\n                        const value = data.value;\r\n                        let level = 'Ⅰ类';\r\n                        if (value > 0.15) level = 'Ⅱ类';\r\n                        if (value > 0.5) level = 'Ⅲ类';\r\n                        if (value > 1.0) level = 'Ⅳ类';\r\n                        \r\n                        let reason = '正常运行';\r\n                        const month = parseInt(data.name.split('-')[1]);\r\n                        if (month >= 6 && month <= 8) reason = '雨季水量大，稀释作用明显';\r\n                        if (month <= 2 || month >= 11) reason = '枯水期，水体自净能力减弱';\r\n                        \r\n                        return `<div style=\"font-weight:bold\">${data.name}</div>\r\n                                <div>氨氮: <span style=\"color:#f59e0b;font-weight:bold\">${value}</span> mg/L</div>\r\n                                <div>水质等级: <span style=\"color:${value <= 0.15 ? '#00e400' : value <= 0.5 ? '#ffff00' : '#ff7e00'}\">${level}</span></div>\r\n                                <div style=\"color:#94a3b8;font-size:12px;margin-top:5px\">${reason}</div>`;\r\n                    }\r\n                },\r\n                grid: {\r\n                    top: '10%',\r\n                    left: '3%',\r\n                    right: '4%',\r\n                    bottom: '5%',\r\n                    containLabel: true\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    boundaryGap: false,\r\n                    data: timeSeriesData.dates,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10,\r\n                        rotate: 30\r\n                    },\r\n                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }\r\n                },\r\n                yAxis: {\r\n                    type: 'value',\r\n                    max: 0.6,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10,\r\n                        formatter: '{value} mg/L'\r\n                    },\r\n                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }\r\n                },\r\n                series: [\r\n                    // Ⅰ类水质区间背景\r\n                    {\r\n                        type: 'line',\r\n                        markArea: {\r\n                            silent: true,\r\n                            itemStyle: {\r\n                                color: 'rgba(0, 228, 0, 0.1)'\r\n                            },\r\n                            data: [[{\r\n                                yAxis: 0\r\n                            }, {\r\n                                yAxis: 0.15\r\n                            }]]\r\n                        }\r\n                    },\r\n                    // Ⅱ类水质区间背景\r\n                    {\r\n                        type: 'line',\r\n                        markArea: {\r\n                            silent: true,\r\n                            itemStyle: {\r\n                                color: 'rgba(255, 255, 0, 0.1)'\r\n                            },\r\n                            data: [[{\r\n                                yAxis: 0.15\r\n                            }, {\r\n                                yAxis: 0.5\r\n                            }]]\r\n                        }\r\n                    },\r\n                    // 国标限值线\r\n                    {\r\n                        type: 'line',\r\n                        markLine: {\r\n                            silent: true,\r\n                            symbol: 'none',\r\n                            lineStyle: {\r\n                                type: 'dashed',\r\n                                width: 1\r\n                            },\r\n                            data: [\r\n                                { yAxis: 0.15, lineStyle: { color: '#00e400' }, label: { formatter: 'Ⅰ类线', color: '#00e400', fontSize: 10 } },\r\n                                { yAxis: 0.5, lineStyle: { color: '#ffff00' }, label: { formatter: 'Ⅱ类线', color: '#ffff00', fontSize: 10 } }\r\n                            ]\r\n                        }\r\n                    },\r\n                    // 数据折线\r\n                    {\r\n                        name: '氨氮',\r\n                        type: 'line',\r\n                        smooth: true,\r\n                        data: timeSeriesData.ammonia_nitrogen,\r\n                        lineStyle: { color: '#f59e0b', width: 2 },\r\n                        itemStyle: { color: '#f59e0b' },\r\n                        symbol: 'circle',\r\n                        symbolSize: 6,\r\n                        markPoint: {\r\n                            data: [\r\n                                { type: 'max', name: '最大值', itemStyle: { color: '#ef4444' } },\r\n                                { type: 'min', name: '最小值', itemStyle: { color: '#22c55e' } }\r\n                            ],\r\n                            label: { color: '#fff', fontSize: 10 }\r\n                        }\r\n                    }\r\n                ]\r\n            };\r\n            \r\n            charts.nh.setOption(option);\r\n        }\r\n        \r\n        // 渲染分时段对比图表\r\n        function renderSeasonChart() {\r\n            // 计算汛期/非汛期数据\r\n            const seasonData = calculateSeasonData();\r\n            \r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    trigger: 'axis',\r\n                    axisPointer: { type: 'shadow' }\r\n                },\r\n                legend: {\r\n                    data: ['汛期(6-9月)', '非汛期', '年度均值'],\r\n                    textStyle: { color: '#94a3b8', fontSize: 10 },\r\n                    top: 0,\r\n                    itemWidth: 12,\r\n                    itemHeight: 10\r\n                },\r\n                grid: {\r\n                    top: '20%',\r\n                    left: '3%',\r\n                    right: '4%',\r\n                    bottom: '5%',\r\n                    containLabel: true\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    data: seasonData.years,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 11\r\n                    },\r\n                    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }\r\n                },\r\n                yAxis: {\r\n                    type: 'value',\r\n                    name: '综合水质指数',\r\n                    nameTextStyle: { color: '#64748b', fontSize: 10 },\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10\r\n                    },\r\n                    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }\r\n                },\r\n                series: [\r\n                    {\r\n                        name: '汛期(6-9月)',\r\n                        type: 'bar',\r\n                        data: seasonData.floodSeason,\r\n                        itemStyle: { color: '#0ea5e9' }\r\n                    },\r\n                    {\r\n                        name: '非汛期',\r\n                        type: 'bar',\r\n                        data: seasonData.nonFloodSeason,\r\n                        itemStyle: { color: '#22c55e' }\r\n                    },\r\n                    {\r\n                        name: '年度均值',\r\n                        type: 'line',\r\n                        data: seasonData.annualAvg,\r\n                        lineStyle: { color: '#f59e0b', width: 2 },\r\n                        itemStyle: { color: '#f59e0b' },\r\n                        symbol: 'circle',\r\n                        symbolSize: 8\r\n                    }\r\n                ]\r\n            };\r\n            \r\n            charts.season.setOption(option);\r\n        }\r\n        \r\n        // 计算汛期/非汛期数据\r\n        function calculateSeasonData() {\r\n            const yearData = {};\r\n            \r\n            // 按年份分组\r\n            timeSeriesData.dates.forEach((date, index) => {\r\n                const year = date.slice(0, 4);\r\n                const month = parseInt(date.slice(5, 7));\r\n                \r\n                if (!yearData[year]) {\r\n                    yearData[year] = {\r\n                        flood: [],\r\n                        nonFlood: []\r\n                    };\r\n                }\r\n                \r\n                // 计算综合水质指数（基于三个指标）\r\n                const doScore = Math.min(timeSeriesData.dissolved_oxygen[index] / 10, 1);\r\n                const phScore = 1 - Math.abs(timeSeriesData.ph[index] - 8) / 2;\r\n                const nhScore = 1 - Math.min(timeSeriesData.ammonia_nitrogen[index] / 0.5, 1);\r\n                const compositeScore = (doScore + phScore + nhScore) / 3;\r\n                \r\n                // 6-9月为汛期\r\n                if (month >= 6 && month <= 9) {\r\n                    yearData[year].flood.push(compositeScore);\r\n                } else {\r\n                    yearData[year].nonFlood.push(compositeScore);\r\n                }\r\n            });\r\n            \r\n            const years = Object.keys(yearData).sort();\r\n            const floodSeason = [];\r\n            const nonFloodSeason = [];\r\n            const annualAvg = [];\r\n            \r\n            years.forEach(year => {\r\n                const floodAvg = yearData[year].flood.length > 0 \r\n                    ? yearData[year].flood.reduce((a, b) => a + b, 0) / yearData[year].flood.length \r\n                    : 0;\r\n                const nonFloodAvg = yearData[year].nonFlood.length > 0 \r\n                    ? yearData[year].nonFlood.reduce((a, b) => a + b, 0) / yearData[year].nonFlood.length \r\n                    : 0;\r\n                const all = [...yearData[year].flood, ...yearData[year].nonFlood];\r\n                const avg = all.length > 0 ? all.reduce((a, b) => a + b, 0) / all.length : 0;\r\n                \r\n                floodSeason.push(Number(floodAvg.toFixed(2)));\r\n                nonFloodSeason.push(Number(nonFloodAvg.toFixed(2)));\r\n                annualAvg.push(Number(avg.toFixed(2)));\r\n            });\r\n            \r\n            return { years, floodSeason, nonFloodSeason, annualAvg };\r\n        }\r\n        \r\n        // 切换视图\r\n        function switchView(view) {\r\n            currentView = view;\r\n            \r\n            // 更新按钮状态\r\n            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));\r\n            event.target.closest('.tool-btn').classList.add('active');\r\n            \r\n            const doContainer = document.getElementById('doChartContainer');\r\n            const phContainer = document.getElementById('phChartContainer');\r\n            const nhContainer = document.getElementById('nhChartContainer');\r\n            \r\n            if (view === 'all') {\r\n                doContainer.style.display = 'flex';\r\n                phContainer.style.display = 'flex';\r\n                nhContainer.style.display = 'flex';\r\n                doContainer.style.height = '280px';\r\n                phContainer.style.height = '280px';\r\n                nhContainer.style.height = '280px';\r\n            } else if (view === 'do') {\r\n                doContainer.style.display = 'flex';\r\n                phContainer.style.display = 'none';\r\n                nhContainer.style.display = 'none';\r\n                doContainer.style.height = '600px';\r\n            } else if (view === 'ph') {\r\n                doContainer.style.display = 'none';\r\n                phContainer.style.display = 'flex';\r\n                nhContainer.style.display = 'none';\r\n                phContainer.style.height = '600px';\r\n            } else if (view === 'nh') {\r\n                doContainer.style.display = 'none';\r\n                phContainer.style.display = 'none';\r\n                nhContainer.style.display = 'flex';\r\n                nhContainer.style.height = '600px';\r\n            }\r\n            \r\n            // 重新调整图表大小\r\n            setTimeout(() => {\r\n                Object.values(charts).forEach(chart => chart && chart.resize());\r\n            }, 100);\r\n        }\r\n        \r\n        // 切换对比模式\r\n        function toggleCompare() {\r\n            // 更新按钮状态\r\n            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));\r\n            event.target.closest('.tool-btn').classList.add('active');\r\n            \r\n            // 创建对比图表\r\n            const compareChart = echarts.init(document.getElementById('doChart'));\r\n            \r\n            const option = {\r\n                backgroundColor: 'transparent',\r\n                tooltip: {\r\n                    trigger: 'axis'\r\n                },\r\n                legend: {\r\n                    data: ['溶解氧', 'PH', '氨氮'],\r\n                    textStyle: { color: '#94a3b8', fontSize: 10 },\r\n                    top: 0\r\n                },\r\n                grid: {\r\n                    top: '15%',\r\n                    left: '3%',\r\n                    right: '4%',\r\n                    bottom: '15%',\r\n                    containLabel: true\r\n                },\r\n                xAxis: {\r\n                    type: 'category',\r\n                    boundaryGap: false,\r\n                    data: timeSeriesData.dates,\r\n                    axisLabel: {\r\n                        color: '#94a3b8',\r\n                        fontSize: 10,\r\n                        rotate: 30\r\n                    }\r\n                },\r\n                yAxis: [\r\n                    {\r\n                        type: 'value',\r\n                        name: 'DO/PH',\r\n                        position: 'left',\r\n                        axisLabel: { color: '#94a3b8', fontSize: 10 },\r\n                        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }\r\n                    },\r\n                    {\r\n                        type: 'value',\r\n                        name: '氨氮',\r\n                        position: 'right',\r\n                        axisLabel: { color: '#94a3b8', fontSize: 10 }\r\n                    }\r\n                ],\r\n                dataZoom: [\r\n                    { type: 'inside', start: 0, end: 100 },\r\n                    { type: 'slider', start: 0, end: 100, bottom: 5, height: 20 }\r\n                ],\r\n                series: [\r\n                    {\r\n                        name: '溶解氧',\r\n                        type: 'line',\r\n                        smooth: true,\r\n                        data: timeSeriesData.dissolved_oxygen,\r\n                        lineStyle: { color: '#0ea5e9', width: 2 },\r\n                        itemStyle: { color: '#0ea5e9' }\r\n                    },\r\n                    {\r\n                        name: 'PH',\r\n                        type: 'line',\r\n                        smooth: true,\r\n                        data: timeSeriesData.ph,\r\n                        lineStyle: { color: '#22c55e', width: 2 },\r\n                        itemStyle: { color: '#22c55e' }\r\n                    },\r\n                    {\r\n                        name: '氨氮',\r\n                        type: 'line',\r\n                        smooth: true,\r\n                        yAxisIndex: 1,\r\n                        data: timeSeriesData.ammonia_nitrogen,\r\n                        lineStyle: { color: '#f59e0b', width: 2 },\r\n                        itemStyle: { color: '#f59e0b' }\r\n                    }\r\n                ]\r\n            };\r\n            \r\n            compareChart.setOption(option);\r\n            \r\n            // 隐藏其他图表容器，放大溶解氧容器用于显示对比图\r\n            const doContainer = document.getElementById('doChartContainer');\r\n            doContainer.style.display = 'flex';\r\n            doContainer.style.height = '600px';\r\n            document.getElementById('phChartContainer').style.display = 'none';\r\n            document.getElementById('nhChartContainer').style.display = 'none';\r\n            \r\n            // 重新调整图表大小\r\n            setTimeout(() => {\r\n                compareChart.resize();\r\n            }, 100);\r\n        }"], Component: TrendAnalysisPage },
};

export default legacyPages;

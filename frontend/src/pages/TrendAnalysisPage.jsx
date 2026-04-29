import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function initTrendAnalysisRuntime() {
  let cleanup;
  let cancelled = false;

  import('./trendAnalysisRuntime.js').then(({ initTrendAnalysisRuntime: initRuntime }) => {
    if (!cancelled) cleanup = initRuntime();
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}

function TrendAnalysisPageMarkup() {
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
            <button className="nav-back" data-analysis-action="go-back">
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
                    <button className="tool-btn active" data-view="all" data-analysis-action="switch-view">
                        <i className="fa fa-th-large"></i>全指标视图
                    </button>
                    <button className="tool-btn" data-view="do" data-analysis-action="switch-view">
                        <i className="fa fa-tint"></i>溶解氧放大
                    </button>
                    <button className="tool-btn" data-view="ph" data-analysis-action="switch-view">
                        <i className="fa fa-flask"></i>PH放大
                    </button>
                    <button className="tool-btn" data-view="nh" data-analysis-action="switch-view">
                        <i className="fa fa-filter"></i>氨氮放大
                    </button>
                    <button className="tool-btn" data-analysis-action="toggle-compare">
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

export default function TrendAnalysisPage({ page }) {
  useLegacyPageRuntime(page, initTrendAnalysisRuntime);

  return <TrendAnalysisPageMarkup />;
}



import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function initCorrelationAnalysisRuntime() {
  let cleanup;
  let cancelled = false;

  import('./correlationAnalysisRuntime.js').then(({ initCorrelationAnalysisRuntime: initRuntime }) => {
    if (!cancelled) cleanup = initRuntime();
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}

function CorrelationAnalysisPageMarkup() {
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
                        <button className="detail-close" data-analysis-action="close-detail">
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
                            <button className="category-tag active" data-category="all" data-analysis-action="filter-category">
                                <i className="fa fa-th-large"></i> 全部
                            </button>
                            <button className="category-tag" data-category="physical" data-analysis-action="filter-category">
                                <i className="fa fa-thermometer"></i> 物理生态类
                            </button>
                            <button className="category-tag" data-category="nutrient" data-analysis-action="filter-category">
                                <i className="fa fa-flask"></i> 营养盐类
                            </button>
                            <button className="category-tag" data-category="pollution" data-analysis-action="filter-category">
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

export default function CorrelationAnalysisPage({ page }) {
  useLegacyPageRuntime(page, initCorrelationAnalysisRuntime);

  return <CorrelationAnalysisPageMarkup />;
}




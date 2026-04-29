import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function initProvinceComparisonRuntime() {
  let cleanup;
  let cancelled = false;

  import('./provinceComparisonRuntime.js').then(({ initProvinceComparisonRuntime: initRuntime }) => {
    if (!cancelled) cleanup = initRuntime();
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}

function ProvinceComparisonPageMarkup() {
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
                        <button className="popup-close" data-analysis-action="close-popup">
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
                    <button className="export-btn" data-analysis-action="export-data">
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

export default function ProvinceComparisonPage({ page }) {
  useLegacyPageRuntime(page, initProvinceComparisonRuntime);

  return <ProvinceComparisonPageMarkup />;
}



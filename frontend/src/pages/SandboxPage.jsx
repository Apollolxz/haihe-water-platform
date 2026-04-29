import { useLegacyPageRuntime } from './useLegacyPageRuntime.js';

function initSandboxRuntime() {
  let cleanup;
  let cancelled = false;

  import('./sandboxRuntime.js').then(async ({ initSandboxRuntime: initRuntime }) => {
    const runtimeCleanup = await initRuntime();
    if (cancelled) {
      runtimeCleanup?.();
    } else {
      cleanup = runtimeCleanup;
    }
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}

function SandboxPageMarkup() {
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
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" data-logout-link>
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

export default function SandboxPage({ page }) {
  useLegacyPageRuntime(page, initSandboxRuntime);

  return <SandboxPageMarkup />;
}


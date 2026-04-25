// 主题配置文件

/**
 * 颜色配置
 */
export const COLORS = {
    // 主色调
    primary: '#06b6d4',
    secondary: '#10b981',
    accent: '#3b82f6',
    
    // 背景色
    dark: '#0f172a',
    'dark-light': '#1e293b',
    'dark-lighter': '#334155',
    
    // 文字色
    'text-light': '#e2e8f0',
    'text-gray': '#9ca3af',
    
    // 状态色
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
};

/**
 * 渐变配置
 */
export const GRADIENTS = {
    eco: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
    dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    wave: 'linear-gradient(-45deg, #06b6d4, #10b981, #3b82f6, #06b6d4)',
    text: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)'
};

/**
 * 动画配置
 */
export const ANIMATIONS = {
    fadeIn: {
        duration: '0.5s',
        easing: 'ease-in-out'
    },
    slideUp: {
        duration: '0.5s',
        easing: 'ease-in-out'
    },
    float: {
        duration: '3s',
        easing: 'ease-in-out',
        iteration: 'infinite'
    },
    wave: {
        duration: '10s',
        easing: 'linear',
        iteration: 'infinite'
    },
    glow: {
        duration: '2s',
        easing: 'ease-in-out',
        iteration: 'infinite alternate'
    }
};

/**
 * 阴影配置
 */
export const SHADOWS = {
    card: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    glow: '0 0 15px rgba(6, 182, 212, 0.8)',
    input: '0 0 5px rgba(6, 182, 212, 0.5)'
};

/**
 * 玻璃效果配置
 */
export const GLASS = {
    background: 'rgba(30, 41, 59, 0.7)',
    'background-light': 'rgba(49, 64, 84, 0.7)',
    blur: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
};

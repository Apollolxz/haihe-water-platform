// API配置文件

/**
 * API基础配置
 */
export const API_CONFIG = {
    // 后端服务地址
    BASE_URL: 'http://127.0.0.1:5001',
    
    // API版本
    VERSION: 'v1',
    
    // 超时时间（毫秒）
    TIMEOUT: 10000,
    
    // 重试次数
    RETRY_COUNT: 3
};

/**
 * API端点配置
 */
export const API_ENDPOINTS = {
    // 认证相关
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout'
    },
    
    // 聊天相关
    CHAT: {
        SEND: '/api/chat/',
        TEST: '/api/chat/test-deepseek'
    },
    
    // 知识图谱相关
    GRAPH: {
        GET: '/api/graph'
    },
    
    // 水质数据相关
    WATER_QUALITY: {
        STATIONS: '/api/water-quality/stations',
        LATEST: '/api/water-quality/latest',
        HISTORICAL: '/api/water-quality/historical',
        TIANJIN: '/api/water-quality/tianjin',
        SYNC: '/api/water-quality/sync'
    }
};

/**
 * 获取完整API URL
 * @param {string} endpoint - API端点
 * @returns {string} - 完整URL
 */
export function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

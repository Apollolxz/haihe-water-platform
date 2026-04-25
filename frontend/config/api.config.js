// API configuration

function resolveBaseUrl() {
    if (typeof window === 'undefined') {
        return '';
    }
    if (window.HAIHE_RUNTIME?.apiBaseUrl) {
        return window.HAIHE_RUNTIME.apiBaseUrl;
    }
    if (window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5001';
    }
    return window.location.origin;
}

export const API_CONFIG = {
    BASE_URL: resolveBaseUrl(),
    VERSION: 'v1',
    TIMEOUT: 10000,
    RETRY_COUNT: 3
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout'
    },

    CHAT: {
        SEND: '/api/chat/',
        TEST: '/api/chat/test-deepseek'
    },

    GRAPH: {
        GET: '/api/graph'
    },

    WATER_QUALITY: {
        STATIONS: '/api/water-quality/stations',
        LATEST: '/api/water-quality/latest',
        HISTORICAL: '/api/water-quality/historical',
        TIANJIN: '/api/water-quality/tianjin',
        SYNC: '/api/water-quality/sync'
    }
};

export function getApiUrl(endpoint) {
    if (typeof window !== 'undefined' && typeof window.HAIHE_RUNTIME?.resolveApi === 'function') {
        return window.HAIHE_RUNTIME.resolveApi(endpoint);
    }

    const normalizedEndpoint = String(endpoint || '').startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    return `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
}

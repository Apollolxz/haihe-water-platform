// 全局状态管理

/**
 * 创建响应式状态
 * @param {Object} initialState - 初始状态
 * @returns {Object} - 响应式状态对象
 */
export function createStore(initialState = {}) {
    let state = { ...initialState };
    const listeners = new Map();

    return {
        /**
         * 获取状态
         * @param {string} key - 状态键名
         * @returns {any} - 状态值
         */
        get(key) {
            return state[key];
        },

        /**
         * 设置状态
         * @param {string} key - 状态键名
         * @param {any} value - 状态值
         */
        set(key, value) {
            const oldValue = state[key];
            state[key] = value;
            
            // 通知监听器
            if (listeners.has(key)) {
                listeners.get(key).forEach(callback => {
                    callback(value, oldValue);
                });
            }
        },

        /**
         * 批量设置状态
         * @param {Object} newState - 新状态对象
         */
        setMultiple(newState) {
            Object.keys(newState).forEach(key => {
                this.set(key, newState[key]);
            });
        },

        /**
         * 订阅状态变化
         * @param {string} key - 状态键名
         * @param {Function} callback - 回调函数
         * @returns {Function} - 取消订阅函数
         */
        subscribe(key, callback) {
            if (!listeners.has(key)) {
                listeners.set(key, new Set());
            }
            listeners.get(key).add(callback);

            // 返回取消订阅函数
            return () => {
                listeners.get(key).delete(callback);
            };
        },

        /**
         * 获取整个状态对象
         * @returns {Object} - 状态对象
         */
        getState() {
            return { ...state };
        },

        /**
         * 重置状态
         */
        reset() {
            state = { ...initialState };
            listeners.clear();
        }
    };
}

// 创建全局状态实例
export const globalStore = createStore({
    // 用户信息
    user: null,
    isLoggedIn: false,
    
    // 聊天状态
    chatHistory: [],
    currentChat: null,
    
    // 页面状态
    currentPage: '',
    isLoading: false,
    
    // 主题状态
    theme: 'dark',
    
    // 通知状态
    notifications: []
});

/**
 * 用户状态管理
 */
export const userStore = {
    /**
     * 获取当前用户
     * @returns {Object|null}
     */
    getUser() {
        return globalStore.get('user');
    },

    /**
     * 设置当前用户
     * @param {Object} user
     */
    setUser(user) {
        globalStore.set('user', user);
        globalStore.set('isLoggedIn', !!user);
        
        // 保存到本地存储
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    },

    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return globalStore.get('isLoggedIn');
    },

    /**
     * 退出登录
     */
    logout() {
        this.setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    },

    /**
     * 从本地存储加载用户
     */
    loadFromStorage() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.setUser(JSON.parse(user));
        }
    }
};

/**
 * 聊天状态管理
 */
export const chatStore = {
    /**
     * 获取聊天历史
     * @returns {Array}
     */
    getHistory() {
        return globalStore.get('chatHistory') || [];
    },

    /**
     * 添加聊天记录
     * @param {Object} message
     */
    addMessage(message) {
        const history = this.getHistory();
        history.unshift({
            ...message,
            timestamp: new Date().toLocaleString()
        });
        
        // 只保留最近20条
        if (history.length > 20) {
            history.pop();
        }
        
        globalStore.set('chatHistory', history);
        
        // 保存到本地存储
        localStorage.setItem('chatHistory', JSON.stringify(history));
    },

    /**
     * 清空历史记录
     */
    clearHistory() {
        globalStore.set('chatHistory', []);
        localStorage.removeItem('chatHistory');
    },

    /**
     * 从本地存储加载历史
     */
    loadFromStorage() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            globalStore.set('chatHistory', JSON.parse(history));
        }
    }
};

/**
 * 通知状态管理
 */
export const notificationStore = {
    /**
     * 添加通知
     * @param {Object} notification
     */
    add(notification) {
        const notifications = globalStore.get('notifications') || [];
        notifications.unshift({
            ...notification,
            id: Date.now(),
            timestamp: new Date().toLocaleString()
        });
        
        // 只保留最近10条
        if (notifications.length > 10) {
            notifications.pop();
        }
        
        globalStore.set('notifications', notifications);
    },

    /**
     * 移除通知
     * @param {number} id
     */
    remove(id) {
        const notifications = globalStore.get('notifications') || [];
        const index = notifications.findIndex(n => n.id === id);
        if (index > -1) {
            notifications.splice(index, 1);
            globalStore.set('notifications', notifications);
        }
    },

    /**
     * 清空所有通知
     */
    clear() {
        globalStore.set('notifications', []);
    }
};

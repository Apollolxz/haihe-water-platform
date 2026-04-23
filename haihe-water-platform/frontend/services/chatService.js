// 聊天服务，处理与后端的API通信
const chatService = {
    /**
     * 调用聊天API获取回答
     * @param {string} message - 用户输入的消息
     * @param {string} token - 用户认证token
     * @returns {Promise<string>} - 聊天机器人的回答
     */
    async callChatAPI(message, token) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // 只有当token存在时才添加Authorization头
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://127.0.0.1:5001/api/chat/test-deepseek', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ question: message })
            });

            const data = await response.json();
            
            if (data.success) {
                return data.data.answer;
            } else {
                throw new Error(data.error || '未知错误');
            }
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    },

    /**
     * 获取用户token
     * @returns {string} - 用户token
     */
    getToken() {
        return localStorage.getItem('token') || '';
    },

    /**
     * 检查用户是否已登录
     * @returns {boolean} - 是否已登录
     */
    isLoggedIn() {
        return !!this.getToken();
    }
};

// 全局导出
window.chatService = chatService;

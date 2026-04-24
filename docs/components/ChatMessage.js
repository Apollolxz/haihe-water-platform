// 聊天消息组件
const chatMessage = {
    /**
     * 创建用户消息元素
     * @param {string} message - 消息内容
     * @returns {HTMLElement} - 消息元素
     */
    createUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 justify-end">
                <div>
                    <p class="text-sm">${message}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0">
                    <i class="fa fa-user text-white"></i>
                </div>
            </div>
        `;
        return messageDiv;
    },

    /**
     * 创建机器人消息元素
     * @param {string} message - 消息内容
     * @returns {HTMLElement} - 消息元素
     */
    createBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
                    <i class="fa fa-robot text-white"></i>
                </div>
                <div>
                    <p class="text-sm">${message}</p>
                    <div class="mt-1 text-xs text-gray-400 flex items-center">
                        <i class="fa fa-bolt mr-1"></i>
                        <span>DeepSeek 智能分析</span>
                    </div>
                </div>
            </div>
        `;
        return messageDiv;
    },

    /**
     * 创建正在输入元素
     * @returns {HTMLElement} - 正在输入元素
     */
    createTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
                    <i class="fa fa-robot text-white"></i>
                </div>
                <div>
                    <div class="text-sm text-text-light mb-2">思考中...</div>
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot" style="animation-delay: 0.2s"></div>
                        <div class="typing-dot" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>
        `;
        return typingDiv;
    },

    /**
     * 隐藏正在输入元素
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
};

// 全局导出
window.chatMessage = chatMessage;

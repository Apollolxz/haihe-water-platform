// 页面布局组件
const layout = {
    /**
     * 初始化导航栏事件
     */
    initNavigation() {
        // 移动端菜单按钮
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function() {
                const mobileMenu = document.getElementById('mobileMenu');
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // 用户菜单按钮
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', function() {
                const userMenu = document.getElementById('userMenu');
                userMenu.classList.toggle('hidden');
            });
        }
        
        // 点击页面其他地方关闭用户菜单
        document.addEventListener('click', function(e) {
            const userMenu = document.getElementById('userMenu');
            const userMenuBtn = document.getElementById('userMenuBtn');
            if (userMenu && userMenuBtn && !userMenu.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
            if (!e.target.closest('#mobileMenuBtn') && !e.target.closest('#mobileMenu')) {
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    },

    /**
     * 更新用户信息
     * @param {Object} user - 用户信息
     */
    updateUserInfo(user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.username || '访客';
        }
    },

    /**
     * 绑定聊天表单事件
     * @param {Function} onSubmit - 表单提交回调函数
     */
    bindChatForm(onSubmit) {
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const messageInput = document.getElementById('messageInput');
                const message = messageInput.value.trim();
                
                if (message) {
                    onSubmit(message);
                    messageInput.value = '';
                }
            });
        }
    },

    /**
     * 绑定热门问题点击事件
     * @param {Function} onQuestionClick - 问题点击回调函数
     */
    bindHotQuestions(onQuestionClick) {
        document.querySelectorAll('.hot-question').forEach(button => {
            button.addEventListener('click', function() {
                const question = this.textContent.trim();
                onQuestionClick(question);
            });
        });
    },

    /**
     * 绑定清空聊天按钮事件
     * @param {Function} onClear - 清空回调函数
     */
    bindClearChat(onClear) {
        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', function() {
                if (confirm('确定要清空聊天记录吗？')) {
                    onClear();
                }
            });
        }
    }
};

// 全局导出
window.layout = layout;

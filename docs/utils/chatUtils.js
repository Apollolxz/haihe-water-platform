// 聊天工具函数，处理聊天相关的通用功能
const chatUtils = {
    /**
     * 保存聊天记录到本地存储
     * @param {string} message - 用户输入的消息
     */
    saveToHistory(message) {
        let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        history.unshift({ message, timestamp: new Date().toLocaleString() });
        // 只保留最近10条记录
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        localStorage.setItem('chatHistory', JSON.stringify(history));
    },

    /**
     * 加载聊天历史记录
     * @returns {Array} - 聊天历史记录
     */
    loadHistory() {
        return JSON.parse(localStorage.getItem('chatHistory')) || [];
    },

    /**
     * 清空聊天历史记录
     */
    clearHistory() {
        localStorage.removeItem('chatHistory');
    },

    /**
     * 获取当前用户信息
     * @returns {Object} - 用户信息
     */
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || { username: '访客', role: '未登录' };
    },

    /**
     * 退出登录
     */
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    },

    /**
     * 初始化粒子背景
     */
    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: '#06b6d4'
                    },
                    shape: {
                        type: 'circle',
                        stroke: {
                            width: 0,
                            color: '#000000'
                        }
                    },
                    opacity: {
                        value: 0.5,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.1,
                            sync: false
                        }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 2,
                            size_min: 0.1,
                            sync: false
                        }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#06b6d4',
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: {
                            enable: true,
                            mode: 'repulse'
                        },
                        onclick: {
                            enable: true,
                            mode: 'push'
                        },
                        resize: true
                    },
                    modes: {
                        repulse: {
                            distance: 100,
                            duration: 0.4
                        },
                        push: {
                            particles_nb: 4
                        }
                    }
                },
                retina_detect: true
            });
        }
    }
};

// 全局导出
window.chatUtils = chatUtils;

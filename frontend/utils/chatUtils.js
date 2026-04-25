// 鑱婂ぉ宸ュ叿鍑芥暟锛屽鐞嗚亰澶╃浉鍏崇殑閫氱敤鍔熻兘
const chatUtils = {
    saveToHistory(message) {
        let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        history.unshift({ message, timestamp: new Date().toLocaleString() });
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        localStorage.setItem('chatHistory', JSON.stringify(history));
    },

    loadHistory() {
        return JSON.parse(localStorage.getItem('chatHistory')) || [];
    },

    clearHistory() {
        localStorage.removeItem('chatHistory');
    },

    getCurrentUser() {
        const isLoggedIn = Boolean(localStorage.getItem('token'));
        if (!isLoggedIn) {
            return { username: '访客', role: '未登录' };
        }

        const stored = localStorage.getItem('currentUser') || localStorage.getItem('user');
        if (!stored) {
            return { username: '用户', role: '已登录' };
        }

        try {
            return JSON.parse(stored);
        } catch (error) {
            console.warn('Failed to parse cached user info:', error);
            return { username: '用户', role: '已登录' };
        }
    },

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    },

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

window.chatUtils = chatUtils;

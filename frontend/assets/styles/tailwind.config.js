// Tailwind CSS 配置文件

tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#06b6d4',
                secondary: '#10b981',
                accent: '#3b82f6',
                dark: '#0f172a',
                'dark-light': '#1e293b',
                'dark-lighter': '#334155',
                'text-light': '#e2e8f0'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif']
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-in-out',
                'pulse-slow': 'pulse 3s infinite',
                'float': 'float 3s ease-in-out infinite',
                'wave': 'wave 10s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                wave: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(16, 185, 129, 0.5)' }
                }
            }
        }
    }
}

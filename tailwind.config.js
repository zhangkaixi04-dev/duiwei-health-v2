/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 藏真 Morandi Palette (Updated)
        cangzhen: {
          bg: '#F0E8DD',      // 全局暖米白底色
          text: {
            main: 'hsl(25, 12%, 20%)',  // 正文深棕
            secondary: 'hsl(25, 8%, 52%)', // 辅助说明
          },
          sensation: {        // 感知馆 (伯利克之星)
            main: '#D6CEAB',  // 暖黄绿
          },
          emotion: {          // 情绪馆 (铃兰)
            main: '#C5CCAE',  // 灰绿
          },
          inspiration: {      // 灵感馆 (鸢尾花)
            main: '#C4BAD0',  // 灰紫
          },
          custom: {           // 自定义馆 (满天星)
            main: '#E0D8C8',  // 暂定米灰
          },
        },
        // Legacy Duiwei colors
        brand: {
          DEFAULT: '#4A7C59', // 翡翠绿
          light: '#EDF5F0',   // 浅绿
        },
        accent: {
          DEFAULT: '#E6A57E', // 柔珊瑚
        },
        bg: {
          DEFAULT: '#FAF9F6', // 米白
          secondary: '#EDF5F0', // 浅绿 (辅助底色)
        },
        text: {
          main: '#333333',    // 深灰
          muted: '#888888',   // 浅灰
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'SimSun', 'serif'], // 标题/展示
        sans: ['"Noto Sans SC"', '"PingFang SC"', 'sans-serif'], // 正文/UI
        italic: ['"Cormorant Garamond"', 'serif'], // 辅助/英文
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gentle-float': 'gentleFloat 4s ease-in-out infinite',
        'ambient': 'ambientGradient 24s ease infinite',
        'stamp': 'stampSpring 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'bloom': 'bloomIn 0.8s ease-out forwards',
        'pulse-glow': 'glowPulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ambientGradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        stampSpring: {
          '0%': { transform: 'scale(1.5)', opacity: '0' },
          '50%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bloomIn: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,255,255,0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255,255,255,0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem', // 大圆角
      }
    },
  },
  plugins: [],
}

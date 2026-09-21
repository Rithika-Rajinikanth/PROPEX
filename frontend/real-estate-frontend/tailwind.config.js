/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          // Primary Color Palette - Soft Blue & Purple
          primary: {
            50: '#f0f4ff',
            100: '#e0eaff',
            200: '#c7d7fe',
            300: '#a5bbfd',
            400: '#8097f8',
            500: '#6172f3',
            600: '#4e5ce6',
            700: '#3f48cc',
            800: '#363fa5',
            900: '#323982',
          },
          // Secondary Color Palette - Purple Accent
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          // Neutral Palette - Modern Grays
          neutral: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
          // Accent Colors
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        },
        fontSize: {
          'xs': ['0.75rem', { lineHeight: '1rem' }],
          'sm': ['0.875rem', { lineHeight: '1.25rem' }],
          'base': ['1rem', { lineHeight: '1.5rem' }],
          'lg': ['1.125rem', { lineHeight: '1.75rem' }],
          'xl': ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
          '5xl': ['3rem', { lineHeight: '1' }],
          '6xl': ['3.75rem', { lineHeight: '1' }],
          '7xl': ['4.5rem', { lineHeight: '1' }],
          '8xl': ['6rem', { lineHeight: '1' }],
          '9xl': ['8rem', { lineHeight: '1' }],
        },
        borderRadius: {
          'none': '0',
          'sm': '8px',
          'md': '12px',
          'lg': '16px',
          'xl': '20px',
          '2xl': '24px',
          '3xl': '32px',
          'full': '9999px',
        },
        boxShadow: {
          'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
          'card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
          'glow': '0 0 20px rgba(97, 114, 243, 0.4)',
          'glow-secondary': '0 0 20px rgba(139, 92, 246, 0.4)',
          'none': 'none',
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #6172f3 0%, #8b5cf6 100%)',
          'gradient-secondary': 'linear-gradient(135deg, #a78bfa 0%, #f0abfc 100%)',
          'gradient-subtle': 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
          'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out forwards',
          'slide-in-right': 'slideInRight 0.4s ease-out forwards',
          'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
          'scale-in': 'scaleIn 0.3s ease-out forwards',
          'shimmer': 'shimmer 2s infinite',
          'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
          'spin': 'spin 0.8s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideInRight: {
            '0%': { opacity: '0', transform: 'translateX(30px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          slideInLeft: {
            '0%': { opacity: '0', transform: 'translateX(-30px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          scaleIn: {
            '0%': { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
          },
          shimmer: {
            '0%': { backgroundPosition: '-1000px 0' },
            '100%': { backgroundPosition: '1000px 0' },
          },
          pulseGlow: {
            '0%, 100%': { boxShadow: '0 0 20px rgba(97, 114, 243, 0.3)' },
            '50%': { boxShadow: '0 0 40px rgba(97, 114, 243, 0.6)' },
          },
          spin: {
            'to': { transform: 'rotate(360deg)' },
          },
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem',
        },
        transitionDuration: {
          '400': '400ms',
        },
        transitionTimingFunction: {
          'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        backdropBlur: {
          'xs': '2px',
        },
      },
    },
    plugins: [],
  }
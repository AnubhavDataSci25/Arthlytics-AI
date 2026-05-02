export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50:  '#eefbf3',
                    100: '#d6f5e3',
                    200: '#b0eaca',
                    300: '#7dd8aa',
                    400: '#49be85',
                    500: '#27a268',   // primary
                    600: '#1a8454',
                    700: '#176944',
                    800: '#165337',
                    900: '#13452f',
                    950: '#09271b', 
                },
                surface: {
                    900: '#0c0f0e',
                    800: '#111613',
                    700: '#171e1a',
                    600: '#1e2822',
                    500: '#253029',
                },
            },
            fontFamily: {
                display: ['"Syne"', 'sans-serif'],
                body: ['"DM Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            borderRadius: {
                x12: '1rem',
                x13: '1.5rem',
            },
            animation: {
                'fade-up':   'fadeUp 0.5s ease forwards',
                'fade-in':   'fadeIn 0.4s ease forwards',
                'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
            },
            keyframes: {
                fadeUp: {
                    '0%':   { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseDot: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.4)', opacity: '0.6' },
                },
            },
        },
    },
    plugins: [],
}

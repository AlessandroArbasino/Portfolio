/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-family-sans)', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
            },
        },
    },
    plugins: [],
}

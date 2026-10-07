/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        board: 'var(--board)',
        'board-2': 'var(--board-2)',
        copper: 'var(--copper)',
        gold: 'var(--gold)',
        silk: 'var(--silkscreen)',
        muted: 'var(--muted)',
        signal: 'var(--signal)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

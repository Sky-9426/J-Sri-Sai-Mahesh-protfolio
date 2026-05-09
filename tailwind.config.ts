import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg:      '#2c001e',
          surface: '#1a0010',
          border:  'rgba(255,255,255,0.1)',
          green:   '#4e9a06',
          amber:   '#c4a000',
          cyan:    '#06989a',
          white:   '#ffffff',
          grey:    '#555555',
          grey2:   '#888888',
          red:     '#cc0000',
        }
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      }
    },
  },
  plugins: [],
}
export default config

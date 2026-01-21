import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        moss: '#2b7a78',
        sand: '#f8f5f2',
        coral: '#ff7a59',
        cloud: '#e2e8f0',
        plum: '#5b4b8a'
      },
      boxShadow: {
        soft: '0 20px 60px -40px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;

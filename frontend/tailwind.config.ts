import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        moss: '#374151',
        sand: '#f3f4f6',
        coral: '#ef4444',
        cloud: '#e5e7eb',
        plum: '#6366f1',
        mist: '#f8fafc'
      },
      boxShadow: {
        soft: '0 20px 60px -40px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af' },
        accent: { 50: '#fff7ed', 500: '#f97316', 600: '#ea580c' },
        success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
        danger: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}


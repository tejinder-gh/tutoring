/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: ({ opacityVariable, opacityValue }) => {
          if (opacityValue) return `rgba(var(--background-rgb), ${opacityValue})`;
          if (opacityVariable) return `rgba(var(--background-rgb), var(${opacityVariable}, 1))`;
          return `rgb(var(--background-rgb))`;
        },
        foreground: ({ opacityVariable, opacityValue }) => {
          if (opacityValue) return `rgba(var(--foreground-rgb), ${opacityValue})`;
          if (opacityVariable) return `rgba(var(--foreground-rgb), var(${opacityVariable}, 1))`;
          return `rgb(var(--foreground-rgb))`;
        },
        primary: ({ opacityVariable, opacityValue }) => {
          if (opacityValue) return `rgba(var(--primary-rgb), ${opacityValue})`;
          if (opacityVariable) return `rgba(var(--primary-rgb), var(${opacityVariable}, 1))`;
          return `rgb(var(--primary-rgb))`;
        },
        accent: ({ opacityVariable, opacityValue }) => {
          if (opacityValue) return `rgba(var(--accent-rgb), ${opacityValue})`;
          if (opacityVariable) return `rgba(var(--accent-rgb), var(${opacityVariable}, 1))`;
          return `rgb(var(--accent-rgb))`;
        },
        border: ({ opacityVariable, opacityValue }) => {
          if (opacityValue) return `rgba(var(--border-rgb), ${opacityValue})`;
          if (opacityVariable) return `rgba(var(--border-rgb), var(${opacityVariable}, 1))`;
          return `rgb(var(--border-rgb))`;
        },
        'text-muted': ({ opacityVariable, opacityValue }) => {
          if (opacityValue) return `rgba(var(--text-muted-rgb), ${opacityValue})`;
          if (opacityVariable) return `rgba(var(--text-muted-rgb), var(${opacityVariable}, 1))`;
          return `rgb(var(--text-muted-rgb))`;
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
};

import flowbiteTypography from 'flowbite-typography';

export default {
  content: [
    './templates/**/*.html',
    './open_politics_project/**/*.html',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-linear': 'linear-gradient(var(--tw-gradient-angle), var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      }),
      colors: {
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        'fluorescent-green': '#32ff7e'

      },
    },
  },
  variants: {},
  plugins: [
    flowbiteTypography,
  ],
  darkMode: 'class',
};
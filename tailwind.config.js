module.exports = {
  content: [
    './templates/**/*.html',
    './open_politics_project/**/*.html',
    // Add other directories where you have HTML files that use Tailwind CSS classes
  ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-linear': 'linear-gradient(var(--tw-gradient-angle), var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      }),
    },
  },
  variants: {},
  plugins: [],
  darkMode: 'class',
}

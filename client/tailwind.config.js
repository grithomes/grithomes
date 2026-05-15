export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Vibrant Blue
          hover: '#1D4ED8',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        sidebar: '#111827',
        sidebarHover: '#1F2937',
        sidebarText: '#F9FAFB',
        textMain: '#111827',
        textMuted: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        borderLight: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'std': '8px',
        'lg-card': '12px',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

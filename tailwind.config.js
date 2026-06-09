/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  // Preflight is disabled: the ported design-system.css owns the base reset and
  // is the visual source of truth. Tailwind utilities remain available on top.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#67B2D8',
          deep: '#4A93BC',
          press: '#3C82AA',
          soft: '#E8F3F9',
          'soft-2': '#D6EAF4',
          tint: '#F2F9FC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F9FBFC',
        },
        ink: {
          DEFAULT: '#1F2933',
          2: '#52606D',
          3: '#8A95A1',
        },
        ok: '#2E9E73',
        warn: '#C98A1E',
        danger: '#D6533F',
        info: '#4A93BC',
        purple: '#7B6FCB',
      },
      fontFamily: {
        en: ['Poppins', 'system-ui', 'sans-serif'],
        ar: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '8px',
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F9FA",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.75)",
          solid: "#FFFFFF",
          muted: "rgba(241, 245, 249, 0.8)",
          card: "rgba(255, 255, 255, 0.85)",
        },
        brand: {
          emerald: "#10B981",
          emeraldGlow: "#059669",
          amber: "#F59E0B",
          amberGlow: "#D97706",
          indigo: "#6366F1",
          indigoGlow: "#4F46E5",
          rose: "#F43F5E",
        },
        slate: {
          850: "#151e2e",
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.45)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.45)',
        'glow-indigo': '0 0 25px -4px rgba(99, 102, 241, 0.45)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
// Paleta: dominio Legal/Corporativo — frontend-quality skill
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2C3E50",
          50:  "#EBF0F5",
          100: "#C8D6E3",
          200: "#9BB5CC",
          300: "#6E94B5",
          400: "#4D7A9E",
          500: "#2C3E50",
          600: "#243444",
          700: "#1B2A38",
          800: "#13202B",
          900: "#0A151F",
        },
        secondary: {
          DEFAULT: "#7F8C8D",
          100: "#DEE2E2",
          500: "#7F8C8D",
          700: "#5D6D6E",
        },
        accent: {
          DEFAULT: "#C0392B",
          100: "#F5C6C2",
          500: "#C0392B",
          700: "#922B21",
        },
        success: {
          DEFAULT: "#27AE60",
          100: "#D5EFE1",
          500: "#27AE60",
        },
        warning: {
          DEFAULT: "#F39C12",
          100: "#FDEBC8",
          500: "#F39C12",
        },
        danger: {
          DEFAULT: "#C0392B",
          100: "#F5C6C2",
          500: "#C0392B",
        },
        background: "#FDFCFB",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        muted: "#6B7280",
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs:   ["12px", { lineHeight: "1.5" }],
        sm:   ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.6" }],
        lg:   ["20px", { lineHeight: "1.4" }],
        xl:   ["24px", { lineHeight: "1.3" }],
        "2xl":["32px", { lineHeight: "1.2" }],
        "3xl":["40px", { lineHeight: "1.1" }],
        "4xl":["48px", { lineHeight: "1.1" }],
      },
      spacing: {
        // Sistema de 8px — frontend-quality skill
        1: "8px",
        2: "16px",
        3: "24px",
        4: "32px",
        5: "40px",
        6: "48px",
        8: "64px",
        10: "80px",
        12: "96px",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.08)",
        DEFAULT: "0 2px 8px rgba(0,0,0,0.08)",
        md: "0 4px 16px rgba(0,0,0,0.10)",
        lg: "0 8px 32px rgba(0,0,0,0.12)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

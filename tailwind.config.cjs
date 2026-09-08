// tailwind.config.js  (CJS)
const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,mdx}"],
  safelist: [
    "bg-primary-soft",
    "text-primary",
    "text-default",
    "bg-default-soft",
    "hover:text-primary-soft",
    "animate-pulse",
    "font-montserrat",
    "font-display",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Raleway", ...defaultTheme.fontFamily.sans],
        montserrat: ["Montserrat", "sans-serif"],
        display: ["Montserrat", ...defaultTheme.fontFamily.sans],
      },

      /* ✅ añadimos 'line' para habilitar border-line */
      // tailwind.config.js
      // 👇 COLORES CORRECTOS (no dejes objetos vacíos)
      colors: {
        default: {
          DEFAULT: "#2D2D2D",
          soft: "#696969",
          strong: "#000000",
        },
        primary: {
          DEFAULT: "#327ffa",
          soft: "#F3F6FD",         // “suave” minimalista (adiós amarillo)
          accent: "#CDDDCC",
          medium: "#34495E",
          strong: "#0D0D0D",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        line: "#E5E7EB",           // para border-line
      },

      /* ✅ sombra de tarjeta para shadow-card */
      boxShadow: {
        card: "0 4px 16px rgba(17, 24, 39, 0.06)", // ajusta al gusto
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(5px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },

  plugins: [
    plugin(function ({ addUtilities, theme }) {
      const family = theme("fontFamily.montserrat");
      addUtilities(
        {
          ".font-montserrat": {
            fontFamily: Array.isArray(family) ? family.join(",") : family,
          },
        },
        { respectPrefix: true, respectImportant: true }
      );
    }),
  ],
};
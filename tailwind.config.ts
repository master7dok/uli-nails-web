import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nude: {
          50: "#FAF8F5",
          100: "#F5F2EB",
          200: "#EFE9DF",
          300: "#E4D9CA",
          400: "#D3C2AD",
          500: "#BFA88F",
          600: "#A38B71",
          700: "#866F58",
          800: "#6B5846",
          900: "#4D3E32",
        },
        blush: {
          50: "#FDF7F7",
          100: "#F9EBEA",
          200: "#F3D7D5",
          300: "#E7B8B5",
          400: "#D99591",
          500: "#C6716C",
        },
        gold: {
          300: "#E5D2BA",
          400: "#D5B895",
          500: "#C5A880",
          600: "#A8885E",
          700: "#8B6C43",
        },
        charcoal: {
          500: "#55524F",
          600: "#44403C",
          700: "#333333",
          800: "#222222",
          900: "#1A1817",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Montserrat", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(77, 62, 50, 0.08)",
        card: "0 15px 35px -5px rgba(77, 62, 50, 0.06), 0 5px 15px rgba(0, 0, 0, 0.03)",
        glow: "0 0 25px rgba(197, 168, 128, 0.25)",
      }
    },
  },
  plugins: [],
};

export default config;

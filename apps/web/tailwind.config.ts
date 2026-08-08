import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        
        
        brand: {
          50: "#eaf5f6",
          100: "#cfe9ec",
          200: "#9dd2d9",
          500: "#1c93a6",
          600: "#007a8e",
          700: "#005b5c",
          800: "#00403f",
          900: "#00282a",
        },
        
        
        savings: {
          50: "#eef8f1",
          100: "#d7eedd",
          600: "#2f9e63",
          700: "#227a4c",
        },
        
        
        sand: "#f0e5d8",
        ink: "#001f3f",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        heading: ["var(--font-electrolize)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 18, 32, 0.04), 0 8px 24px -12px rgba(11, 18, 32, 0.12)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;

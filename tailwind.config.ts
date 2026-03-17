import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        barber: {
          black: "#0A0A0A",
          dark: "#121212",
          gold: "#D4AF37",
          "gold-dark": "#B8972E",
          accent: "#10B981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Cinzel", "serif"], // Keep heading font if still used somewhere
        body: ["Poppins", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [], // Note: @tailwindcss/typography is not installed, so I am omitting it to avoid build errors.
};

export default config;

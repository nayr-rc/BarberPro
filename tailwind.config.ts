import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      fontFamily: {
        heading: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-poppins)", "sans-serif"],
        display: ["var(--font-old-standard)", "serif"],
      },
      colors: {
        'barber': {
          black: "#0D0D0D",     // Darker, more premium black
          dark: "#1A1A1A",      // Secondary dark
          gray: "#2A2A2A",      // Card backgrounds
          gold: "#D4AF37",      // Classic gold
          accent: "#C5A065",    // Muted gold for text/borders
          light: "#F5F5F5",     // Off-white
          white: "#FFFFFF",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/pattern-dark.png')", // Placeholder for a pattern if needed
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;

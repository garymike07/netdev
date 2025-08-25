import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Cyberpunk custom colors
        'cyber-blue': 'var(--cyber-blue)',
        'neon-green': 'var(--neon-green)',
        'electric-purple': 'var(--electric-purple)',
        'dark-charcoal': 'var(--dark-charcoal)',
        'medium-charcoal': 'var(--medium-charcoal)',
        'light-charcoal': 'var(--light-charcoal)',
        'glass-white': 'var(--glass-white)',
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 2s infinite",
        "holographic-shift": "holographic-shift 3s ease-in-out infinite",
        "data-flow": "data-flow 3s linear infinite",
        "shimmer": "shimmer 2s infinite",
        "loading-dots": "loading-dots 1.5s infinite",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow": {
          "0%": { textShadow: "0 0 20px var(--cyber-blue)" },
          "100%": { textShadow: "0 0 30px var(--cyber-blue), 0 0 40px var(--cyber-blue)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "scan": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
        "holographic-shift": {
          "0%, 100%": { filter: "hue-rotate(0deg)" },
          "50%": { filter: "hue-rotate(90deg)" },
        },
        "data-flow": {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-20" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "loading-dots": {
          "0%, 20%": { content: "'.')" },
          "40%": { content: "'..')" },
          "60%, 100%": { content: "'...'" },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neumorphic': '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(42, 42, 42, 0.1)',
        'neumorphic-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.4), inset -8px -8px 16px rgba(42, 42, 42, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'cyber': '0 20px 40px rgba(0, 212, 255, 0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

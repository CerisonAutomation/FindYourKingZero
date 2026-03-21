const plugin = require("tailwindcss/plugin");

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          0: "hsl(var(--surface-0))",
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
          4: "hsl(var(--surface-4))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          dim: "hsl(var(--primary-dim))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        red: "hsl(var(--red))",
        gold: "hsl(var(--gold))",
        royal: "hsl(var(--royal))",
        obsidian: "hsl(var(--obsidian))",
        crimson: "hsl(var(--crimson))",
        amber: "hsl(var(--amber))",
        emerald: "hsl(var(--emerald))",
        cobalt: "hsl(var(--cobalt))",
        violet: "hsl(var(--violet))",
        rose: "hsl(var(--rose))",
        coral: "hsl(var(--coral))",
        cyan: "hsl(var(--cyan))",
        steel: "hsl(var(--steel))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "shimmer-gold": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-luxury": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "marquee-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      transitionDuration: {
        120: "120ms",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.2, 0, 0, 1)",
      },
      animation: {
        "shimmer-gold": "shimmer-gold 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-luxury": "pulse-luxury 2s ease-in-out infinite",
        "marquee-scroll": "marquee-scroll 25s linear infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          background: "hsl(var(--glass-bg))",
          "backdrop-filter": "blur(12px)",
          border: "1px solid hsl(var(--glass-border))",
        },
        ".glass-heavy": {
          background: "hsl(var(--glass-heavy))",
          "backdrop-filter": "blur(24px)",
        },
        ".glass-card": {
        ".shadow-glow-gold": {
          "box-shadow": "0 0 24px hsl(var(--primary) / 0.38), 0 0 48px hsl(var(--primary) / 0.12)",
        },
        ".shadow-glow-red": {
          "box-shadow": "0 0 24px hsl(var(--destructive) / 0.38), 0 0 48px hsl(var(--destructive) / 0.12)",
        },
        ".shadow-glow-royal": {
          "box-shadow": "0 0 28px hsl(var(--accent) / 0.42), 0 0 56px hsl(var(--accent) / 0.15)",
        },
          background: "hsl(var(--glass-card))",
          "backdrop-filter": "blur(16px)",
        },
      });
    }),
  ],
};

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
        status: {
          online: "hsl(var(--status-online))",
          away: "hsl(var(--status-away))",
          busy: "hsl(var(--status-busy))",
          offline: "hsl(var(--status-offline))",
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
        lg: "var(--radius-lg, 12px)",
        md: "var(--radius-md, 8px)",
        sm: "var(--radius-sm, 4px)",
        DEFAULT: "var(--radius, 0px)",
      },
      keyframes: {
        "shimmer-gold": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-luxury": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.15)" },
        },
        "pulse-online": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.55)", opacity: "0" },
        },
        "marquee-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.88)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "grain": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" },
        },
        "holo-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "typing-dot": {
          "0%, 80%, 100%": { transform: "scale(1)", opacity: "0.4" },
          "40%": { transform: "scale(1.2)", opacity: "1" },
        },
        "ring-ping": {
          "75%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "notification-pop": {
          "0%": { transform: "scale(0) rotate(-10deg)", opacity: "0" },
          "60%": { transform: "scale(1.15) rotate(3deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "skeleton-wave": {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "shimmer-gold": "shimmer-gold 1.8s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-luxury": "pulse-luxury 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "pulse-online": "pulse-online 1.8s ease-out infinite",
        "marquee-scroll": "marquee-scroll 25s linear infinite",
        "grain": "grain 8s steps(10) infinite",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "holo-shift": "holo-shift 4s ease infinite",
        "ring-ping": "ring-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "notification-pop": "notification-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "skeleton-wave": "skeleton-wave 1.6s ease-in-out infinite",
      },
      transitionDuration: {
        80: "80ms",
        120: "120ms",
        180: "180ms",
        250: "250ms",
        350: "350ms",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.2, 0, 0, 1)",
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
        "nav": "var(--nav-h, 56px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities, addComponents, theme }) {
      addUtilities({
        ".glass": {
          background: "hsl(var(--glass-bg))",
          "backdrop-filter": "blur(12px) saturate(160%)",
          "-webkit-backdrop-filter": "blur(12px) saturate(160%)",
          border: "1px solid hsl(var(--glass-border))",
        },
        ".glass-heavy": {
          background: "hsl(var(--glass-heavy))",
          "backdrop-filter": "blur(24px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(24px) saturate(180%)",
        },
        ".glass-card": {
          background: "hsl(var(--glass-card))",
          "backdrop-filter": "blur(16px) saturate(160%)",
          "-webkit-backdrop-filter": "blur(16px) saturate(160%)",
        },
        ".glass-nav": {
          background: "hsl(224 14% 4% / 0.88)",
          "backdrop-filter": "blur(32px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(32px) saturate(180%)",
          "border-bottom": "1px solid hsl(224 8% 100% / 0.055)",
          "box-shadow": "0 1px 0 hsl(224 8% 100% / 0.025)",
        },
        ".glass-input": {
          background: "hsl(220 16% 8% / 0.7)",
          "backdrop-filter": "blur(8px)",
          "-webkit-backdrop-filter": "blur(8px)",
          border: "1px solid hsl(220 12% 100% / 0.07)",
        },
        ".shadow-glow-gold": {
          "box-shadow": "0 0 24px hsl(var(--primary) / 0.38), 0 0 48px hsl(var(--primary) / 0.12)",
        },
        ".shadow-glow-red": {
          "box-shadow": "0 0 24px hsl(var(--destructive) / 0.38), 0 0 48px hsl(var(--destructive) / 0.12)",
        },
        ".shadow-glow-royal": {
          "box-shadow": "0 0 28px hsl(var(--accent) / 0.42), 0 0 56px hsl(var(--accent) / 0.15)",
        },
        ".shadow-glow-green": {
          "box-shadow": "0 0 16px hsl(var(--status-online) / 0.45), 0 0 32px hsl(var(--status-online) / 0.15)",
        },
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": "hsl(220 12% 18%) transparent",
        },
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".text-pretty": {
          "text-wrap": "pretty",
        },
        ".gpu": {
          transform: "translateZ(0)",
          "will-change": "transform",
          "backface-visibility": "hidden",
        },
        ".safe-area-bottom": {
          "padding-bottom": "env(safe-area-inset-bottom, 0px)",
        },
        ".bg-noise": {
          "background-image": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          "background-repeat": "repeat",
          "background-size": "128px 128px",
        },
        ".interactive": {
          cursor: "pointer",
          "user-select": "none",
          "-webkit-tap-highlight-color": "transparent",
          transition: "all 120ms cubic-bezier(0.2, 0, 0, 1)",
          "&:active": { transform: "scale(0.94)" },
        },
        ".bg-gradient-king": {
          background: "var(--gradient-king)",
        },
        ".bg-gradient-gold": {
          background: "var(--gradient-gold)",
        },
        ".bg-gradient-primary": {
          background: "var(--gradient-primary)",
        },
        ".bg-gradient-royal": {
          background: "var(--gradient-royal)",
        },
        ".bg-gradient-luxury": {
          background: "var(--gradient-luxury)",
        },
      });

      addComponents({
        ".skeleton-wave": {
          background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.06) 37%, hsl(var(--muted)) 63%)",
          "background-size": "800px 100%",
          animation: "skeleton-wave 1.6s ease-in-out infinite",
        },
      });
    }),
  ],
};

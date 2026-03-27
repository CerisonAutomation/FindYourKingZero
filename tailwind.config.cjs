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
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.2)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.4), 0 0 60px hsl(var(--primary) / 0.15)" },
        },
        "shimmer-royal": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "stagger-fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "card-lift": {
          "0%": { transform: "translateY(0) scale(1)", boxShadow: "var(--shadow-card)" },
          "100%": { transform: "translateY(-4px) scale(1.01)", boxShadow: "var(--shadow-float), 0 0 30px hsl(var(--primary) / 0.12)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "hsl(var(--border))" },
          "50%": { borderColor: "hsl(var(--primary) / 0.4)" },
        },
        "heart-beat": {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.15)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "56%": { transform: "scale(1)" },
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
        "slide-down": "slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "holo-shift": "holo-shift 4s ease infinite",
        "ring-ping": "ring-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "notification-pop": "notification-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "skeleton-wave": "skeleton-wave 1.6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer-royal": "shimmer-royal 2s ease-in-out infinite",
        "stagger-fade-in": "stagger-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "card-lift": "card-lift 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "border-glow": "border-glow 2.5s ease-in-out infinite",
        "heart-beat": "heart-beat 1.3s ease-in-out infinite",
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
        /* Glass effects */
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
        ".glass-gold": {
          background: "hsl(var(--primary) / 0.06)",
          "backdrop-filter": "blur(16px) saturate(1.2)",
          "-webkit-backdrop-filter": "blur(16px) saturate(1.2)",
          border: "1px solid hsl(var(--primary) / 0.12)",
        },
        ".glass-royal": {
          background: "hsl(var(--accent) / 0.06)",
          "backdrop-filter": "blur(16px) saturate(1.2)",
          "-webkit-backdrop-filter": "blur(16px) saturate(1.2)",
          border: "1px solid hsl(var(--accent) / 0.12)",
        },
        ".glass-premium": {
          background: "hsl(220 16% 100% / 0.03)",
          "backdrop-filter": "blur(40px) saturate(200%) brightness(0.9)",
          "-webkit-backdrop-filter": "blur(40px) saturate(200%) brightness(0.9)",
          border: "1px solid hsl(220 16% 100% / 0.07)",
        },
        /* Glow shadows */
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
        ".shadow-glow-king": {
          "box-shadow": "0 0 36px hsl(var(--accent) / 0.42), 0 0 72px hsl(var(--primary) / 0.16)",
        },
        ".shadow-glow-ambient": {
          "box-shadow": "0 0 60px hsl(var(--primary) / 0.08), 0 0 120px hsl(var(--accent) / 0.04)",
        },
        /* Scrollbar */
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": "hsl(220 12% 18%) transparent",
        },
        ".scrollbar-gold": {
          "scrollbar-width": "thin",
          "scrollbar-color": "hsl(var(--primary) / 0.3) transparent",
        },
        /* Text */
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".text-pretty": {
          "text-wrap": "pretty",
        },
        /* Performance */
        ".gpu": {
          transform: "translateZ(0)",
          "will-change": "transform",
          "backface-visibility": "hidden",
        },
        ".gpu-accelerate": {
          transform: "translate3d(0, 0, 0)",
          "will-change": "transform, opacity",
          "backface-visibility": "hidden",
        },
        /* Safe area */
        ".safe-area-bottom": {
          "padding-bottom": "env(safe-area-inset-bottom, 0px)",
        },
        ".safe-area-top": {
          "padding-top": "env(safe-area-inset-top, 0px)",
        },
        /* Texture */
        ".bg-noise": {
          "background-image": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          "background-repeat": "repeat",
          "background-size": "128px 128px",
        },
        /* Interaction */
        ".interactive": {
          cursor: "pointer",
          "user-select": "none",
          "-webkit-tap-highlight-color": "transparent",
          transition: "all 120ms cubic-bezier(0.2, 0, 0, 1)",
          "&:active": { transform: "scale(0.94)" },
        },
        ".tap-target": {
          "min-height": "44px",
          "min-width": "44px",
          cursor: "pointer",
          "user-select": "none",
          "-webkit-tap-highlight-color": "transparent",
          "touch-action": "manipulation",
        },
        /* Gradients */
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
        ".bg-gradient-nebula": {
          background: "linear-gradient(135deg, hsl(224 76% 38%), hsl(258 82% 62%), hsl(var(--primary)))",
        },
        /* Gradient text */
        ".text-gradient-gold": {
          background: "var(--gradient-gold)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-royal": {
          background: "var(--gradient-royal)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-king": {
          background: "var(--gradient-king)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-luxury": {
          background: "var(--gradient-luxury)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-holo": {
          background: "var(--gradient-holo)",
          "background-size": "200% 200%",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
          animation: "holo-shift 3s ease infinite",
        },
        /* Holographic border */
        ".holo-border": {
          position: "relative",
        },
        ".holo-border::before": {
          content: "''",
          position: "absolute",
          inset: "0",
          padding: "1px",
          background: "var(--gradient-king)",
          "-webkit-mask": "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          "-webkit-mask-composite": "xor",
          "mask-composite": "exclude",
          animation: "holo-shift 4s ease infinite",
          "background-size": "200% 200%",
          "pointer-events": "none",
        },
        /* Shimmer */
        ".shimmer-gold": {
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.3) 40%, hsl(var(--primary-glow) / 0.5) 50%, hsl(var(--primary) / 0.3) 60%, transparent 100%)",
          "background-size": "200% 100%",
          animation: "shimmer-gold 1.8s ease-in-out infinite",
        },
        ".shimmer-royal": {
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--accent) / 0.3) 40%, hsl(var(--accent-glow) / 0.5) 50%, hsl(var(--accent) / 0.3) 60%, transparent 100%)",
          "background-size": "200% 100%",
          animation: "shimmer-royal 2s ease-in-out infinite",
        },
      });

      addComponents({
        /* Skeleton loading */
        ".skeleton-wave": {
          background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.06) 37%, hsl(var(--muted)) 63%)",
          "background-size": "800px 100%",
          animation: "skeleton-wave 1.6s ease-in-out infinite",
        },
        /* Premium card variants */
        ".card-luxury": {
          background: "hsl(var(--surface-1))",
          border: "1px solid hsl(var(--border))",
          "box-shadow": "var(--shadow-card), var(--shadow-inset)",
          position: "relative",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".card-luxury:hover": {
          "border-color": "hsl(var(--primary) / 0.25)",
          "box-shadow": "var(--shadow-card), var(--shadow-inset), 0 0 30px hsl(var(--primary) / 0.1)",
          transform: "translateY(-2px)",
        },
        ".card-king": {
          background: "hsl(var(--surface-1))",
          border: "2px solid hsl(var(--accent) / 0.3)",
          "box-shadow": "var(--shadow-card), var(--shadow-glow-royal)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".card-king:hover": {
          transform: "scale(1.02)",
          "box-shadow": "var(--shadow-lg), 0 0 48px hsl(var(--accent) / 0.35), 0 0 24px hsl(var(--primary) / 0.15)",
          "border-color": "hsl(var(--accent) / 0.5)",
        },
        ".card-minimal": {
          background: "hsl(var(--surface-1))",
          border: "none",
          "box-shadow": "none",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".card-minimal:hover": {
          "box-shadow": "0 8px 32px hsl(0 0% 0% / 0.5)",
        },
        ".card-elevated": {
          background: "hsl(var(--surface-2))",
          border: "1px solid hsl(var(--border) / 0.5)",
          "box-shadow": "var(--shadow-float)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".card-elevated:hover": {
          transform: "translateY(-4px) scale(1.01)",
          "box-shadow": "var(--shadow-lg), 0 0 40px hsl(var(--primary) / 0.1)",
        },
        /* Premium button variants */
        ".btn-gold": {
          "font-weight": "700",
          "letter-spacing": "0.025em",
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(30 98% 54%))",
          color: "hsl(var(--primary-foreground))",
          "box-shadow": "0 4px 16px hsl(var(--primary) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
          transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".btn-gold:hover": {
          "box-shadow": "0 6px 28px hsl(var(--primary) / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.25)",
        },
        ".btn-gold:active": {
          transform: "scale(0.97)",
        },
        ".btn-royal": {
          "font-weight": "700",
          "letter-spacing": "0.025em",
          background: "linear-gradient(135deg, hsl(var(--accent)), hsl(258 82% 62%))",
          color: "#fff",
          "box-shadow": "0 4px 16px hsl(var(--accent) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
          transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".btn-royal:hover": {
          "box-shadow": "0 6px 28px hsl(var(--accent) / 0.45), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
        },
        ".btn-royal:active": {
          transform: "scale(0.97)",
        },
        ".btn-ghost": {
          "font-weight": "700",
          "letter-spacing": "0.025em",
          background: "transparent",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".btn-ghost:hover": {
          "border-color": "hsl(var(--primary) / 0.4)",
          "box-shadow": "0 0 16px hsl(var(--primary) / 0.15)",
          color: "hsl(var(--primary))",
        },
        ".btn-ghost:active": {
          transform: "scale(0.97)",
        },
        /* Premium profile card */
        ".profile-card": {
          "border-radius": "1rem",
          overflow: "hidden",
          background: "hsl(var(--surface-1))",
          border: "1px solid hsl(var(--border))",
          "box-shadow": "var(--shadow-card)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        },
        ".profile-card:hover": {
          transform: "scale(1.02)",
          "box-shadow": "var(--shadow-lg), 0 0 28px hsl(var(--primary) / 0.15)",
          "border-color": "hsl(var(--primary) / 0.2)",
        },
        /* Photo overlays */
        ".photo-overlay-bottom": {
          background: "linear-gradient(to top, hsl(220 18% 2% / 0.95) 0%, hsl(220 18% 2% / 0.75) 22%, hsl(220 18% 2% / 0.35) 45%, transparent 68%)",
        },
        ".photo-overlay-top": {
          background: "linear-gradient(to bottom, hsl(220 18% 2% / 0.55) 0%, hsl(220 18% 2% / 0.2) 25%, transparent 55%)",
        },
        /* Message bubbles */
        ".bubble-own": {
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(30 95% 52%))",
        },
        ".bubble-other": {
          background: "hsl(var(--surface-2))",
          border: "1px solid hsl(var(--border) / 0.5)",
        },
        /* Action pill */
        ".action-pill": {
          display: "inline-flex",
          "align-items": "center",
          gap: "4px",
          padding: "5px 12px",
          "border-radius": "var(--radius-full, 9999px)",
          "font-size": "11px",
          "font-weight": "700",
          transition: "all 120ms cubic-bezier(0.2, 0, 0, 1)",
          border: "1px solid hsl(var(--border) / 0.4)",
          background: "hsl(var(--surface-2))",
          color: "hsl(var(--foreground))",
          cursor: "pointer",
          "user-select": "none",
          "-webkit-tap-highlight-color": "transparent",
        },
        ".action-pill:hover": {
          "border-color": "hsl(var(--border))",
          background: "hsl(var(--surface-3))",
        },
        ".action-pill:active": { transform: "scale(0.94)" },
        /* Avatar gradients */
        ".avatar-grad-red": { background: "linear-gradient(160deg, hsl(0 88% 45% / 0.75), hsl(230 7% 7%))" },
        ".avatar-grad-blue": { background: "linear-gradient(160deg, hsl(218 85% 50% / 0.7), hsl(230 7% 7%))" },
        ".avatar-grad-green": { background: "linear-gradient(160deg, hsl(155 65% 36% / 0.7), hsl(230 7% 7%))" },
        ".avatar-grad-amber": { background: "linear-gradient(160deg, hsl(35 92% 50% / 0.7), hsl(230 7% 7%))" },
        ".avatar-grad-purple": { background: "linear-gradient(160deg, hsl(268 75% 52% / 0.7), hsl(230 7% 7%))" },
        ".avatar-grad-rose": { background: "linear-gradient(160deg, hsl(340 80% 50% / 0.7), hsl(230 7% 7%))" },
      });
    }),
  ],
};

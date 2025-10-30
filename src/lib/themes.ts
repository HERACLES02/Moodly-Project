// Theme definitions - this is your "theme inventory"
export const themes = {
  default: {
    background:
      "linear-gradient(135deg, #000000 0%, #1a1a3a 25%, #2d1b69 50%, #4169e1 75%, #1e3a8a 100%)",
    foreground: "#e5e7eb",
    card: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
    accent: "#fbbf24",
    navbar: "rgba(0, 0, 0, 0.4)",
  },
  "van-gogh": {
    background:
      "linear-gradient(135deg, rgba(13, 13, 35, 0.95) 0%, rgba(25, 25, 60, 0.9) 25%, rgba(45, 27, 105, 0.85) 50%, rgba(25, 25, 112, 0.9) 75%, rgba(13, 13, 35, 0.95) 100%)",
    foreground: "#e6e6fa",
    card: "rgba(25, 25, 112, 0.2)",
    border: "rgba(255, 215, 0, 0.3)",
    accent: "#ffd700",
    navbar: "rgba(25, 25, 112, 0.3)",
  },
  cat: {
    background:
      "linear-gradient(135deg, rgba(221, 160, 221, 0.4) 0%, rgba(216, 191, 216, 0.4) 25%, rgba(230, 230, 250, 0.3) 50%, rgba(221, 160, 221, 0.4) 100%)",
    foreground: "#4a5568",
    card: "rgba(221, 160, 221, 0.15)",
    border: "rgba(159, 122, 234, 0.3)",
    accent: "#9f7aea",
    navbar: "rgba(221, 160, 221, 0.3)",
  },
} as const

// TypeScript types - auto-generated from themes
export type ThemeName = keyof typeof themes
export type Theme = typeof themes.default

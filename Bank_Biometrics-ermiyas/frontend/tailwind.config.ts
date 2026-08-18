import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ink-navy": "#0F1B2B",
        "vault-charcoal": "#16233A",
        "vault-charcoal-2": "#1C2C46",
        "ledger-paper": "#EDE7D9",
        "ledger-paper-dim": "#C9C2AE",
        brass: "#C69A4C",
        "brass-dim": "#8f7038",
        moss: "#4C7A5E",
        clay: "#A8452E",
        line: "rgba(237, 231, 217, 0.10)",
        "line-strong": "rgba(237, 231, 217, 0.18)",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["44px", { lineHeight: "1.15", fontWeight: "500" }],
        display: ["26px", { lineHeight: "1.2", fontWeight: "500" }],
        "display-sm": ["17px", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["13px", { lineHeight: "1.5" }],
        "body-lg": ["14px", { lineHeight: "1.6" }],
        "label-sm": ["11px", { lineHeight: "1.4", letterSpacing: "0.06em" }],
        "label-xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        mono: ["12px", { lineHeight: "1.5" }],
        "mono-sm": ["11px", { lineHeight: "1.4" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
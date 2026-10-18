import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2" } },
    },
  },
  plugins: [],
};
export default config;

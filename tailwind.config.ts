// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        main: {
          DEFAULT: "#00ffff", // main
          light: "#aeffff", // main-light
          dark: "#00bdbd", // main-dark
          test: "#afffffff",
        },
        brand: "#008cff",
        inho: {
          DEFAULT: "#1E293B",
          bright: "#334155",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

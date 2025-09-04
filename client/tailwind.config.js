/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "#374151", // gray-700
        input: "#374151", // gray-700
        ring: "#60A5FA", // blue-400
        background: "#111827", // gray-900
        foreground: "#F9FAFB", // gray-50
        primary: {
          DEFAULT: "#F9FAFB", // gray-50
          foreground: "#111827", // gray-900
        },
        secondary: {
          DEFAULT: "#1F2937", // gray-800
          foreground: "#F9FAFB", // gray-50
        },
        destructive: {
          DEFAULT: "#EF4444", // red-500
          foreground: "#F9FAFB", // gray-50
        },
        muted: {
          DEFAULT: "#1F2937", // gray-800
          foreground: "#9CA3AF", // gray-400
        },
        accent: {
          DEFAULT: "#1F2937", // gray-800
          foreground: "#F9FAFB", // gray-50
        },
        popover: {
          DEFAULT: "#111827", // gray-900
          foreground: "#F9FAFB", // gray-50
        },
        card: {
          DEFAULT: "#111827", // gray-900
          foreground: "#F9FAFB", // gray-50
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}

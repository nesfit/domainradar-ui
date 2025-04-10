/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'holo-bg': 'hsl(var(--background))',
        'holo-fg': 'hsl(var(--foreground))',
        'primary': 'hsl(var(--primary))',
        'accent': 'hsl(var(--accent))',
        'highlight': 'hsl(var(--highlight))',
        'okay': 'hsl(var(--okay))',
        'caution': 'hsl(var(--caution))',
        'destructive': 'hsl(var(--destructive))'
      }
    },
  },
  plugins: [],
}

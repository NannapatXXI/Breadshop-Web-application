/** @type {import('tailwindcss').Config} */
module.exports = {
  // 👇 แก้ไขส่วนนี้ 👇
  content: [
    // ถ้าใช้ App Router (app/ directory)
    './app/**/*.{js,ts,jsx,tsx,mdx}', 
    // ถ้าใช้ Pages Router (pages/ directory)
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    // ถ้าใช้ Components ในโฟลเดอร์ components/
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // 👆 แก้ไขส่วนนี้ 👆
  theme: {
    extend: {},
  },
  plugins: [],
}
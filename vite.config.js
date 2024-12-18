import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/secure': 'http://localhost:5173',
      '/add': 'http://localhost:5173',
      '/recent': 'http://localhost:5173',
    },
  },
})

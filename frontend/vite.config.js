import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://clubreport.parameedev.online',
      '/uploads': 'https://clubreport.parameedev.online',
    },
  },
})

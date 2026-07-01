import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'https://clubreport.parameedev.online',
      '/uploads': 'https://clubreport.parameedev.online',
    },
  },
})

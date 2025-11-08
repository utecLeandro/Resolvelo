import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        // Apunta al backend activo en desarrollo
        // Ajustado a 3000 para alinear con el backend en start:dev (PORT=3000 en .env)
        // Si cambias el modo/puerto del backend, recuerda actualizar este valor
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

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
    host: '127.0.0.1',
    cors: true,
    proxy: {
      '/api': {
        // Apunta al backend activo en desarrollo
        // Ajustado a 3006 para alinear con el backend dev actual
        // Si cambias el modo/puerto del backend, recuerda actualizar este valor
        target: 'http://127.0.0.1:3006',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

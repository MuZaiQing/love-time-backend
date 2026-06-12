import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '10.15.7.8', // 强制绑定到局域网IP
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://10.15.7.8:3000',
        changeOrigin: true
      }
    }
  }
})

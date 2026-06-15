import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1'],
  },
})

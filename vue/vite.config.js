import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3002,
        host: true,
        hmr: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,

            },
        },
    },
})

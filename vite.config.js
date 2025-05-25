import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite"
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      '9e38-188-33-30-117.ngrok-free.app'
    ]
  },
  plugins: [
    vue(),
    vuetify(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/vitest.setup.js',
    css: false, // Вимикаємо обробку CSS у тестах
    deps: {
      optimizer: {
        web: {
          include: ['vuetify']
        }
      }
    },
    alias: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    }
  }
})

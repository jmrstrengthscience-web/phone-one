import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // Multi-page app configuration
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        athlete: resolve(__dirname, 'athlete.html')
      }
    },
    commonjsOptions: {
      include: [/node_modules/, /prop-types/, /hoist-non-react-statics/],
    },
  },
  // Use modern Vite 5.1+ approach with necessary dependencies
  optimizeDeps: {
    include: [
      'prop-types',
      'react-is',
      'hoist-non-react-statics',
      'react-big-calendar',
      'deepmerge',
      'clsx'
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})

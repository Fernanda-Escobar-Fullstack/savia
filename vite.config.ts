import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'firebase-auth',
              test: /node_modules[\\/]@firebase[\\/]auth[\\/]/,
              priority: 40,
            },
            {
              name: 'firebase-firestore',
              test: /node_modules[\\/]@firebase[\\/]firestore[\\/]/,
              priority: 35,
            },
            {
              name: 'firebase-core',
              test: /node_modules[\\/](@firebase|firebase)[\\/]/,
              priority: 30,
            },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|react-redux|@reduxjs)[\\/]/,
              priority: 20,
            },
            {
              name: 'http',
              test: /node_modules[\\/](axios|follow-redirects)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})


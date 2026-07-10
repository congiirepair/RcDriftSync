import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/
            },
            {
              name: 'vendor-ui',
              test: /node_modules[\\/](lucide-react|qrcode\.react|idb)[\\/]/
            },
            {
              name: 'vendor-motion',
              test: /node_modules[\\/](motion|framer-motion)[\\/]/
            },
            {
              name: 'vendor-tanstack',
              test: /node_modules[\\/]@tanstack[\\/]/
            },
            {
              name: 'vendor-sentry',
              test: /node_modules[\\/](@sentry)[\\/]/
            },
            {
              name: 'vendor-firebase-auth',
              test: /node_modules[\\/](@firebase[\\/](auth|component|logger|util)|firebase[\\/]auth)[\\/]/
            },
            {
              name: 'vendor-firebase-firestore',
              test: /node_modules[\\/](@firebase[\\/]firestore|firebase[\\/]firestore)[\\/]/
            },
            {
              name: 'vendor-firebase-storage',
              test: /node_modules[\\/](@firebase[\\/]storage|firebase[\\/]storage)[\\/]/
            },
            {
              name: 'vendor-firebase-core',
              test: /node_modules[\\/](@firebase|firebase)[\\/]/
            },
            {
              name: 'vendor-pdf',
              test: /node_modules[\\/](pdf-lib|pdfjs-dist)[\\/]/
            },
            {
              name: 'catalog-images',
              test: /src[\\/]data[\\/]productImageOverrides\.ts$/
            },
            {
              name: 'catalog-wheels',
              test: /src[\\/]data[\\/]sourcedWheelProducts\.ts$/
            },
            {
              name: 'catalog-sourced',
              test: /src[\\/]data[\\/](sourcedCatalogProducts|sourcedWizardProducts)\.ts$/
            }
          ]
        }
      }
    }
  }
})

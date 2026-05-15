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

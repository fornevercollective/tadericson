import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['lucide-react'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'pwa-64x64.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
      ],
      manifest: {
        name: 'Tad Ericson',
        short_name: 'Tad Ericson',
        description: 'Filmmaker • Camera Technician • Fornever Collective. Cinematic personal site with live lens.',
        theme_color: '#111111',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'any',
        lang: 'en',
        categories: ['portfolio', 'personal', 'design', 'film', 'photography'],
        shortcuts: [
          {
            name: 'Live Lens',
            short_name: 'Camera',
            url: '/',
            description: 'Activate the live pixel camera experience',
          },
          {
            name: 'The Tree',
            short_name: 'Ancestry',
            url: '/#tree',
            description: 'Ancestry research and lineages',
          },
        ],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})

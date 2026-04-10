import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Synapses ESMS',
        short_name: 'Synapses',
        description: 'Solution IA française pour l\'assistance à la rédaction administrative',
        theme_color: '#0D66D4',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: null,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/ollama': {
        target: 'http://51.178.41.170:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/synapses/ollama': {
        target: 'http://51.178.41.170:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/synapses\/ollama/, ''),
      },
    },
  },
});

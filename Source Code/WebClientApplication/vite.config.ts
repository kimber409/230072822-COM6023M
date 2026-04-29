import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the React client and production bundle splitting.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Manual chunks keep the production build easier for the browser to load.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'axios'],
          charts: ['recharts']
        }
      }
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached indefinitely by browsers
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Charting library — large but rarely changes
          'charts': ['lightweight-charts'],
          // UI utilities
          'ui-vendor': ['react-hot-toast', 'lucide-react', '@react-oauth/google'],
        },
      },
    },
  },
});
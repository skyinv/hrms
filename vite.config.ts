import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  define: {
    'process.env': {}
  },
  build: {
    outDir: 'dist' // Explicitly set the output directory
  }
});

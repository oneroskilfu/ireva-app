import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter']
        }
      },
      external: (id) => {
        // Exclude heavy MUI packages that aren't being used in FastHome
        if (id.includes('@mui/') || id.includes('@radix-ui/')) {
          return false; // Don't externalize, but optimize chunk splitting
        }
        return false;
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
});
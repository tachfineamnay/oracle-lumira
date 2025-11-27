import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'framer-motion': '/src/lib/motion-shim.tsx',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer PDF.js worker dans son propre chunk
          'pdf-worker': ['pdfjs-dist/build/pdf.worker.min.mjs'],
        },
      },
    },
  },
  // Assurer que les .mjs sont servis avec le bon MIME type
  // assetsInclude: ['**/*.mjs'],
});

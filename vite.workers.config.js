import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'worker-decoder-wav': 'src/js/worker-decoder-wav.js',
        'worker-decoder-opus': 'src/js/worker-decoder-opus.js',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        format: 'es',
      }
    },
    emptyOutDir: false,
    copyPublicDir: false,
  }
});

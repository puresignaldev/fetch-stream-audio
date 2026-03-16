import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/lib/index.mjs',
      name: 'FetchStreamAudio',
      formats: ['es', 'cjs'],
      fileName: (format) => `fetch-stream-audio.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    copyPublicDir: false,
    minify: false,
  }
});

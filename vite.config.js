import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [{
        src: 'src/lib/index.d.ts',
        dest: '.'
      }]
    })
  ],
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

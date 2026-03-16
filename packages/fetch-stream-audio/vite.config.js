import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [{
        src: 'src/index.d.ts',
        dest: '.'
      }]
    })
  ],
  build: {
    lib: {
      entry: 'src/index.mjs',
      name: 'AudioStreamPlayer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    copyPublicDir: false,
    minify: false,
  }
});

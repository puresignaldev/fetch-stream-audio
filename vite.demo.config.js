import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src',
  plugins: [
    viteStaticCopy({
      targets: [{
        src: '../node_modules/opus-stream-decoder/dist/opus-stream-decoder.wasm',
        dest: '.'
      }]
    })
  ],
  build: {
    outDir: '../dist/demo',
    emptyOutDir: true,
  }
});

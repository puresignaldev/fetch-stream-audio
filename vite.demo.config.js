import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createReadStream } from 'fs';
import { resolve } from 'path';

function opusWasmDevPlugin() {
  return {
    name: 'opus-wasm-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('opus-stream-decoder.wasm')) {
          const wasmPath = resolve('node_modules/opus-stream-decoder/dist/opus-stream-decoder.wasm');
          res.setHeader('Content-Type', 'application/wasm');
          createReadStream(wasmPath).pipe(res);
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  root: 'src',
  plugins: [
    opusWasmDevPlugin(),
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
  },
  optimizeDeps: {
    include: ['opus-stream-decoder'],
  },
});

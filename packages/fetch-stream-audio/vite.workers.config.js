import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function inlineOpusWasm() {
  return {
    name: 'inline-opus-wasm',
    generateBundle(_, bundle) {
      const wasmPath = require.resolve('opus-stream-decoder/dist/opus-stream-decoder.wasm');
      const wasmBase64 = readFileSync(wasmPath).toString('base64');
      const dataUri = `data:application/octet-stream;base64,${wasmBase64}`;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.fileName.includes('opus')) {
          chunk.code = chunk.code.replace(
            /"opus-stream-decoder\.wasm"/g,
            `"${dataUri}"`
          );
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [inlineOpusWasm()],
  build: {
    rollupOptions: {
      input: {
        'worker-decoder-wav': 'src/workers/worker-decoder-wav.js',
        'worker-decoder-opus': 'src/workers/worker-decoder-opus.js',
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

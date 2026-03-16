import { defineConfig } from 'vite';

// The built library contains `new URL("data:...", import.meta.url)` for inlined
// workers. Vite tries to resolve these data URIs as file paths, causing ENAMETOOLONG.
// This plugin injects @vite-ignore so Vite skips them.
function ignoreLibraryWorkerUrls() {
  return {
    name: 'ignore-library-worker-urls',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('fetch-stream-audio') && id.endsWith('.mjs')) {
        return code.replaceAll('new URL("data:', 'new URL(/* @vite-ignore */ "data:');
      }
    }
  };
}

export default defineConfig({
  plugins: [ignoreLibraryWorkerUrls()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a **yarn workspaces monorepo** with two packages:

- **`packages/fetch-stream-audio/`** — Published npm library (`@puresignal/fetch-stream-audio`)
- **`apps/demo/`** — Demo web app (private, not published)

## Commands

```bash
yarn dev        # Build lib then start demo dev server with HMR
yarn build      # Full build: library + workers + demo
yarn build:lib  # Library build only (ESM + CJS + workers + WASM)
yarn build:demo # Demo app build only
yarn clean      # Clean all workspace dist directories
```

The library build runs two Vite configs in sequence: `packages/fetch-stream-audio/vite.config.js` (ESM + CJS library output) then `vite.workers.config.js` (standalone bundled workers). The demo build uses `apps/demo/vite.config.js`.

There is no automated test suite — testing is done manually in the browser at various throttled network speeds.

To lint: `npx eslint packages/fetch-stream-audio/src/` (ESLint is configured in `.eslintrc.js` but not wired into the build pipeline).

## Build Configs

- **`packages/fetch-stream-audio/vite.config.js`** — Library build. Outputs `dist/fetch-stream-audio.mjs` (ESM) and `dist/fetch-stream-audio.cjs` (CJS). Copies type definitions to dist.
- **`packages/fetch-stream-audio/vite.workers.config.js`** — Workers build. Outputs `dist/worker-decoder-opus.js` and `dist/worker-decoder-wav.js` as standalone ES bundles with all dependencies inlined (including WASM). Uses `emptyOutDir: false` to preserve the library output.
- **`apps/demo/vite.config.js`** — Demo app build. Outputs to `apps/demo/dist/`. Imports the library via workspace symlink (`@puresignal/fetch-stream-audio`).

## Architecture

This is a publishable npm package (`fetch-stream-audio`) for low-latency streaming audio playback using the Fetch & Streams APIs, plus a demo app. The core problem solved: traditional `decodeAudioData()` requires the full file before playback, so this project decodes audio chunk-by-chunk as it streams in.

### Library Entry Point

**`packages/fetch-stream-audio/src/lib/index.mjs`** → exports `FetchStreamAudio` (which extends `AudioStreamPlayer`). This is the public API for npm consumers.

### Data Flow

```
BufferedStreamReader (Fetch API + ReadableStream)
    → onBufferFull() → Web Worker (Opus/WAV decoder)
    → onDecode() → DecodedAudioPlaybackBuffer
    → onFlush() → AudioStreamPlayer._schedulePlayback()
    → Web Audio API AudioBufferSourceNode
```

### Key Modules (packages/fetch-stream-audio/src/)

**`js/modules/audio-stream-player.mjs`** — The core. Creates the `AudioContext` with `"interactive"` latency hint, manages the session lifecycle (session IDs prevent race conditions on stop/restart), schedules decoded PCM samples via Web Audio API with a 100ms initial latency (prevents clipping in Firefox), and detects playback skips/gaps. Workers are loaded via `new URL('../worker.js', import.meta.url)` pattern for bundler compatibility, with optional URL overrides via `options.wavWorkerUrl` / `options.opusWorkerUrl`.

**`js/modules/buffered-stream-reader.mjs`** — Fetches the audio URL as a `ReadableStream`, accumulates chunks into a configurable buffer, then fires `onBufferFull()`. Buffer size is critical: too small causes decoder errors (incomplete frames), too large adds latency.

**`js/worker-decoder-opus.js` / `worker-decoder-wav.js`** — Web Workers that keep decoding off the main thread. Opus uses a WebAssembly decoder (`opus-stream-decoder` npm package, imported via its `.mjs` factory export); WAV uses a plain-JS decoder (`MohayonaoWavDecoder.js`). Workers are instantiated with `{ type: 'module' }`.

**`js/modules/decoded-audio-playback-buffer.mjs`** — Accumulates decoded Float32 samples and grows its buffer exponentially (starting at ~20ms, max 128KB) to reduce `AudioBuffer` allocation overhead.

### Demo App (apps/demo/)

**`js/modules/audio-player.mjs`** — Thin orchestrator connecting the `Player` UI component to `AudioStreamPlayer`. Imports the library and worker URLs via package exports (`@puresignal/fetch-stream-audio`).

**`js/lit-components/`** — Lightweight UI using lit-html (no framework). `BaseLitComponent` provides `setState()` with change detection; `Player` renders metrics (latency, download speed, buffer count, skips).

**`js/modules/load-audio-players.mjs`** — Initializes two demo players (Opus + WAV), reads throttle speed and opus bitrate from URL hash params (e.g., `#throttle=1mbps;opusBitrate=96`), and synchronizes players so starting one resets the other.

### Server / Testing Setup

`.conf/nginx/include-server.conf` defines 23 bandwidth-throttled endpoints (16kbps–10mbps) using nginx `limit_rate`. Requires symlinking: `ln -s [repo]/.conf/nginx /etc/nginx/fetch-stream-audio`.

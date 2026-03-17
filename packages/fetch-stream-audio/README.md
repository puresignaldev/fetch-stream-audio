# @puresignal/fetch-stream-audio

Low-latency streaming audio playback using the Fetch, Streams, and Web Audio APIs.

Traditional `decodeAudioData()` requires the complete file before playback. This library decodes audio chunk-by-chunk as it streams in, enabling real-time playback over slow or throttled connections.

Supports **Opus** (WebAssembly decoder, WASM inlined) and **WAV** (JavaScript decoder).

## Install

```bash
npm install @puresignal/fetch-stream-audio
```

## Usage

The player requires an external `AudioContext` and exposes `connect()` / `disconnect()` so it behaves like a standard Web Audio node.

```js
import { AudioStreamPlayer } from '@puresignal/fetch-stream-audio';
import opusWorkerUrl from '@puresignal/fetch-stream-audio/worker-decoder-opus?url';

const audioCtx = new AudioContext({ latencyHint: 'interactive' });

const player = new AudioStreamPlayer(
  audioCtx,
  'https://example.com/audio.opus',
  1024 * 2,  // read buffer size in bytes
  'OPUS',    // or 'PCM' for WAV
  { opusWorkerUrl }
);

player.connect(audioCtx.destination);

player.onUpdateState = (state) => {
  console.log(state);
};

player.start();
// player.close() to stop playback
```

The `?url` import suffix is supported by Vite, webpack 5, and other modern bundlers. It gives you a resolved URL to the worker file without executing it.

The Opus worker has its WebAssembly binary inlined, so **no extra files need to be copied or served** — just the `?url` import and you're done.

### Routing through Web Audio nodes

Because the player exposes `connect()`, you can route audio through gain nodes, analysers, or any other Web Audio processing:

```js
const gain = audioCtx.createGain();
gain.gain.value = 0.5;

player.connect(gain);
gain.connect(audioCtx.destination);

player.start();
```

### WAV streaming

```js
import { AudioStreamPlayer } from '@puresignal/fetch-stream-audio';
import wavWorkerUrl from '@puresignal/fetch-stream-audio/worker-decoder-wav?url';

const audioCtx = new AudioContext({ latencyHint: 'interactive' });

const player = new AudioStreamPlayer(
  audioCtx,
  'https://example.com/audio.wav',
  1024 * 16,  // WAV needs a larger buffer to prevent skipping
  'PCM',
  { wavWorkerUrl }
);

player.connect(audioCtx.destination);
```

### Script-tag / CDN (no bundler)

If you are not using a bundler, host the worker files and pass URLs explicitly:

```js
const audioCtx = new AudioContext({ latencyHint: 'interactive' });

const player = new AudioStreamPlayer(audioCtx, url, 1024 * 2, 'OPUS', {
  opusWorkerUrl: '/assets/worker-decoder-opus.js'
});

player.connect(audioCtx.destination);
```

### AudioContext lifecycle

The player does **not** own the `AudioContext` — you create it, you manage it. This means:

- Call `audioCtx.suspend()` / `audioCtx.resume()` yourself to pause/resume playback
- Call `audioCtx.close()` when you're done with all audio in your app
- The player's `close()` method stops streaming and releases internal resources, but leaves the context intact so you can call `start()` again

### State updates

Each `onUpdateState` callback receives a **partial** state object — only the properties that changed. Accumulate them to get the full picture:

```js
const state = {};

player.onUpdateState = (partial) => {
  Object.assign(state, partial);
  // state.bytesRead, state.abCreated, state.latency, etc.
};
```

| Property | Type | Description |
| -------- | ---- | ----------- |
| `bytesRead` | `number` | Bytes downloaded so far |
| `bytesTotal` | `number` | Total file size in bytes |
| `dlRate` | `number` | Download rate in kbps |
| `latency` | `number` | Initial latency in ms |
| `abCreated` | `number` | AudioBuffers created |
| `abEnded` | `number` | AudioBuffers finished playing |
| `abRemaining` | `number` | AudioBuffers queued for playback |
| `skips` | `number` | Audio skips (caused by slow download) |
| `error` | `string` | Error message if something failed |

## Published files

| File | Description |
| ---- | ----------- |
| `dist/index.mjs` | ESM library entry |
| `dist/index.cjs` | CJS library entry |
| `dist/index.d.ts` | TypeScript declarations |
| `dist/worker-decoder-opus.js` | Bundled Opus decoder worker (WASM inlined) |
| `dist/worker-decoder-wav.js` | Bundled WAV decoder worker |

## Demo

A [live demo](https://fetch-stream-audio.puresignal.dev/) with [throttled bandwidth testing](../../apps/demo) is available in the [main repository](https://github.com/puresignaldev/fetch-stream-audio).

## License

Fork of [AnthumChris/fetch-stream-audio](https://github.com/anthumchris/fetch-stream-audio).

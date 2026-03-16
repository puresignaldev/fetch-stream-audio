<img clear="both" align="left" width="200px" src="https://raw.githubusercontent.com/AnthumChris/fetch-stream-audio/1ef61f06d4a9210492cc475985e7c73904c0b110/src/favicon.ico" /><br>

# Demo

https://fetch-stream-audio.anthum.com/

<br><br>

# Background

This repo provides low-latency web audio playback examples for programatically decoding audio in chunks with the Web Audio API and the new Fetch &amp; Streams APIs.  Traditionally, [`decodeAudioData()`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData) is used for programmatic decoding but requires the complete file to be downloaded, and chunk-based decoding is not supported.  These Streams examples will show how to sidestep that limitation.  Media Source Extensions could also be used to play audio and that example may be integrated here one day.

The examples demonstrate:

1. **Opus Streaming** [`opus-stream-decoder`](https://github.com/AnthumChris/opus-stream-decoder) is used to decode an [Opus](http://opus-codec.org/) file in a Web Worker with WebAssembly.  This simulates a real-world use case of streaming compressed audio over the web with the Web Audio  API.  (MP3 is old and outdated for those of us who grew up with WinPlay3.  Opus is the new gold standard).  This example is ideal because it allows for small, high-quality files with Opus.
1. **WAV Streaming**  A WAV file is streamed and decoded by a Web Worker.  Chunks are scheduled into a read buffer before sending to encoder to ensure decoder receives complete, decodable chunks.  JavaScript (not WebAssembly) is used for decoding. This example requires a much larger file.

# npm Package

This fork is published as `@puresignal/fetch-stream-audio` on npm.

```bash
npm install @puresignal/fetch-stream-audio
```

## Usage

```js
import { FetchStreamAudio } from '@puresignal/fetch-stream-audio';
import opusWorkerUrl from '@puresignal/fetch-stream-audio/worker-decoder-opus?url';

const player = new FetchStreamAudio(
  'https://example.com/audio.opus',
  1024 * 2,  // read buffer size in bytes
  'OPUS',    // or 'PCM' for WAV
  { opusWorkerUrl }
);

player.onUpdateState = (state) => {
  console.log(state);
};

player.start();
// player.pause() / player.resume() / player.close()
```

The `?url` import suffix is supported by Vite, webpack 5, and other modern bundlers. It gives you a resolved URL to the worker file without executing it.

The Opus worker has its WebAssembly binary inlined, so **no extra files need to be copied or served** — just the `?url` import and you're done.

### WAV streaming

```js
import { FetchStreamAudio } from '@puresignal/fetch-stream-audio';
import wavWorkerUrl from '@puresignal/fetch-stream-audio/worker-decoder-wav?url';

const player = new FetchStreamAudio(
  'https://example.com/audio.wav',
  1024 * 16,  // WAV needs a larger buffer to prevent skipping
  'PCM',
  { wavWorkerUrl }
);
```

### Script-tag / CDN (no bundler)

If you are not using a bundler, host the worker files and pass URLs explicitly:

```js
const player = new FetchStreamAudio(url, 1024 * 2, 'OPUS', {
  opusWorkerUrl: '/assets/worker-decoder-opus.js'
});
```

### State updates

Each `onUpdateState` callback receives a **partial** state object — only the properties that changed. Accumulate them to get the full picture:

```js
const state = {};

player.onUpdateState = (partial) => {
  Object.assign(state, partial);
  // state.playState, state.bytesRead, state.abCreated, state.latency, etc.
};
```

| Property | Type | Description |
| -------- | ---- | ----------- |
| `playState` | `'playing' \| 'paused'` | Current playback state |
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
| `dist/fetch-stream-audio.mjs` | ESM library entry |
| `dist/fetch-stream-audio.cjs` | CJS library entry |
| `dist/worker-decoder-opus.js` | Bundled Opus decoder worker (WASM inlined) |
| `dist/worker-decoder-wav.js` | Bundled WAV decoder worker |

# Opus Playback Tests

Opus file playback can be tested at throttled download speeds and various encoding/bitrate qualities:

[opusBitrate = 96; throttle = nolimit](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=nolimit)<br>
[opusBitrate = 96; throttle = 1mbps](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=1mbps)<br>
[opusBitrate = 96; throttle = 104kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=104kbps)<br>
[opusBitrate = 96; throttle = 100kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=100kbps)<br>
[opusBitrate = 64; throttle = 72kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=64;throttle=72kbps)<br>
[opusBitrate = 60; throttle = 64kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=60;throttle=64kbps)<br>
[opusBitrate = 53; throttle = 56kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=53;throttle=56kbps)<br>
[opusBitrate = 32; throttle = 40kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=32;throttle=40kbps)<br>
[opusBitrate = 28; throttle = 32kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=28;throttle=32kbps)<br>
[opusBitrate = 12; throttle = 16kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=12;throttle=16kbps)

# Back-End Nginx Server

To use the config files, create symblink `fetch-stream-audio`, e.g.:

```
$ ln -s [LOCATION_TO_THIS_REPO]/.conf/nginx /etc/nginx/fetch-stream-audio
```

Then, include this repo's nginx config file into your `server {}` block, e.g.:

```nginx
server {
  ...

  disable_symlinks off;
  include fetch-stream-audio/include-server.conf;
}
```

<details>
<summary>Throttled Bandwidth Endpoints</summary>

All `/audio/*` URIs are configured to intentionally limit download speeds and control response packet sizes for testing the decoding behavior (defined in [include-server.conf](.conf/nginx/include-server.conf)).

| Speed      | Example URL |
| ----------- | ----------- |
| 16 kbps | https://fetch-stream-audio.anthum.com/16kbps/opus/decode-test-64kbit.opus |
| 24 kbps | https://fetch-stream-audio.anthum.com/24kbps/opus/decode-test-64kbit.opus |
| 32 kbps | https://fetch-stream-audio.anthum.com/32kbps/opus/decode-test-64kbit.opus |
| 64 kbps | https://fetch-stream-audio.anthum.com/64kbps/opus/decode-test-64kbit.opus |
| 128 kbps | https://fetch-stream-audio.anthum.com/128kbps/opus/decode-test-64kbit.opus |
| 256 kbps | https://fetch-stream-audio.anthum.com/256kbps/opus/decode-test-64kbit.opus |
| 512 kbps | https://fetch-stream-audio.anthum.com/512kbps/opus/decode-test-64kbit.opus |
| 1 mbps | https://fetch-stream-audio.anthum.com/1mbps/opus/decode-test-64kbit.opus |
| 5 mbps | https://fetch-stream-audio.anthum.com/5mbps/opus/decode-test-64kbit.opus |
| 10 mbps | https://fetch-stream-audio.anthum.com/10mbps/opus/decode-test-64kbit.opus |
| nolimit | https://fetch-stream-audio.anthum.com/nolimit/opus/decode-test-64kbit.opus |

</details>

# Development

```bash
git clone https://github.com/puresignaldev/fetch-stream-audio
cd fetch-stream-audio
yarn install
```

```bash
yarn dev          # dev server with HMR
yarn build        # full build: library + workers + demo
yarn build:lib    # library build only
yarn build:demo   # demo app build only
```

# Fork Notice

This is a fork of [AnthumChris/fetch-stream-audio](https://github.com/anthumchris/fetch-stream-audio). The original project is a proof-of-concept demo. This fork packages the core audio streaming logic as a publishable npm module.

# Acknowledgements

Thanks to [@bjornm](https://github.com/bjornm) for pointing me to [@mohayonao](https://github.com/mohayonao)'s WAV decoder: https://github.com/mohayonao/wav-decoder

# fetch-stream-audio

Low-latency streaming audio playback using the Fetch, Streams, and Web Audio APIs. Decodes audio chunk-by-chunk as it streams in, enabling real-time playback over slow or throttled connections.

Fork of [AnthumChris/fetch-stream-audio](https://github.com/anthumchris/fetch-stream-audio). The original project is a proof-of-concept demo. This fork packages the core streaming logic as a publishable npm module.

## Packages

| Package                                                             | Description                                              |
|---------------------------------------------------------------------|----------------------------------------------------------|
| [`packages/fetch-stream-audio`](packages/fetch-stream-audio#readme) | Published npm library (`@puresignal/fetch-stream-audio`) |
| [`apps/demo`](apps/demo#readme)                                     | Browser demo with throttled bandwidth testing            |

## Development

```bash
git clone https://github.com/puresignaldev/fetch-stream-audio
cd fetch-stream-audio
yarn install
```

```bash
yarn dev          # build lib then start demo dev server with HMR
yarn build        # full build: library + workers + demo
yarn build:lib    # library build only
yarn build:demo   # demo app build only
yarn clean        # clean all workspace dist directories
```

## Acknowledgements

From the [original project](https://github.com/anthumchris/fetch-stream-audio): thanks to [@bjornm](https://github.com/bjornm) for pointing to [@mohayonao](https://github.com/mohayonao)'s WAV decoder: https://github.com/mohayonao/wav-decoder

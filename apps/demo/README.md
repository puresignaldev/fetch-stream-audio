# Demo App

Browser demo for [`@puresignal/fetch-stream-audio`](../../packages/fetch-stream-audio/).

Two side-by-side players stream the same audio track — one using Opus (WebAssembly decoder) and one using WAV (JavaScript decoder). Starting one player automatically resets the other.

## Running locally

```bash
# from repo root
yarn dev
```

This builds the library first, then starts the Vite dev server with HMR.

## URL hash parameters

The demo reads configuration from the URL hash:

| Parameter     | Default | Description                                                      |
|---------------|---------|------------------------------------------------------------------|
| `throttle`    | `5mbps` | Bandwidth throttle endpoint (e.g. `1mbps`, `128kbps`, `nolimit`) |
| `opusBitrate` | `96`    | Opus encoding bitrate in kbps                                    |

Example: `https://fetch-stream-audio.anthum.com/#throttle=1mbps;opusBitrate=64`

## Opus playback tests

Opus playback can be tested at throttled download speeds and various bitrates:

| Config             | Link                                                                                                       |
|--------------------|------------------------------------------------------------------------------------------------------------|
| 96 kbps / no limit | [#opusBitrate=96;throttle=nolimit](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=nolimit) |
| 96 kbps / 1 mbps   | [#opusBitrate=96;throttle=1mbps](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=1mbps)     |
| 96 kbps / 104 kbps | [#opusBitrate=96;throttle=104kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=96;throttle=104kbps) |
| 64 kbps / 72 kbps  | [#opusBitrate=64;throttle=72kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=64;throttle=72kbps)   |
| 32 kbps / 40 kbps  | [#opusBitrate=32;throttle=40kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=32;throttle=40kbps)   |
| 12 kbps / 16 kbps  | [#opusBitrate=12;throttle=16kbps](https://fetch-stream-audio.anthum.com/#opusBitrate=12;throttle=16kbps)   |

## Nginx backend

The demo uses throttled nginx endpoints. To set up locally, symlink the config:

```bash
ln -s /path/to/repo/.conf/nginx /etc/nginx/fetch-stream-audio
```

Then include in your `server {}` block:

```nginx
server {
  disable_symlinks off;
  include fetch-stream-audio/include-server.conf;
}
```

<details>
<summary>Throttled bandwidth endpoints</summary>

All `/audio/*` URIs limit download speeds for testing decoder behavior (defined in [include-server.conf](../../.conf/nginx/include-server.conf)).

| Speed    | Example                                 |
|----------|-----------------------------------------|
| 16 kbps  | `/16kbps/opus/decode-test-64kbit.opus`  |
| 32 kbps  | `/32kbps/opus/decode-test-64kbit.opus`  |
| 64 kbps  | `/64kbps/opus/decode-test-64kbit.opus`  |
| 128 kbps | `/128kbps/opus/decode-test-64kbit.opus` |
| 256 kbps | `/256kbps/opus/decode-test-64kbit.opus` |
| 512 kbps | `/512kbps/opus/decode-test-64kbit.opus` |
| 1 mbps   | `/1mbps/opus/decode-test-64kbit.opus`   |
| 5 mbps   | `/5mbps/opus/decode-test-64kbit.opus`   |
| 10 mbps  | `/10mbps/opus/decode-test-64kbit.opus`  |
| no limit | `/nolimit/opus/decode-test-64kbit.opus` |

</details>

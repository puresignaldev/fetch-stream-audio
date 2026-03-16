import { AudioStreamPlayer } from '../js/modules/audio-stream-player.mjs';

/**
 * Low-latency streaming audio playback using Fetch, Streams, and Web Audio APIs.
 *
 * @param {string} url - URL of the audio file to stream
 * @param {number} readBufferSize - Read buffer size in bytes
 * @param {'PCM'|'OPUS'} decoderName - Codec to use
 * @param {object} [options]
 * @param {string} [options.wavWorkerUrl] - Override URL for WAV worker (advanced use)
 * @param {string} [options.opusWorkerUrl] - Override URL for Opus worker (advanced use)
 */
export class FetchStreamAudio extends AudioStreamPlayer {}

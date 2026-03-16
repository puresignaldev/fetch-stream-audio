export interface AudioStreamPlayerOptions {
  /** Override URL for WAV decoder worker */
  wavWorkerUrl?: string;
  /** Override URL for Opus decoder worker */
  opusWorkerUrl?: string;
}

export interface AudioStreamPlayerState {
  playState?: "playing" | "paused";
  error?: string;
  abCreated?: number;
  abEnded?: number;
  abRemaining?: number;
  skips?: number;
  bytesRead?: number;
  bytesTotal?: number;
  /** Download rate in kbps */
  dlRate?: number;
  /** Initial latency in ms */
  latency?: number;
}

export type DecoderName = "PCM" | "OPUS";

export class AudioStreamPlayer {
  /**
   * Callback invoked when internal state changes (playback progress, errors, etc.)
   */
  onUpdateState?: (state: AudioStreamPlayerState) => void;

  /**
   * @param url - URL of the audio file to stream
   * @param readBufferSize - Read buffer size in bytes
   * @param decoderName - Codec to use
   * @param options - Optional configuration
   */
  constructor(
    url: string,
    readBufferSize: number,
    decoderName: DecoderName,
    options?: AudioStreamPlayerOptions
  );

  /** Start streaming and playback */
  start(): void;

  /** Pause playback */
  pause(): void;

  /** Resume playback */
  resume(): void;

  /** Stop playback and release all resources */
  close(): void;
}

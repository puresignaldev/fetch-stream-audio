export interface AudioStreamPlayerOptions {
  /** Override URL for WAV decoder worker */
  wavWorkerUrl?: string;
  /** Override URL for Opus decoder worker */
  opusWorkerUrl?: string;
}

export interface AudioStreamPlayerState {
  playState?: "playing";
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
   * @param audioContext - External AudioContext to use for playback
   * @param url - URL of the audio file to stream
   * @param readBufferSize - Read buffer size in bytes
   * @param decoderName - Codec to use
   * @param options - Optional configuration
   */
  constructor(
    audioContext: AudioContext,
    url: string,
    readBufferSize: number,
    decoderName: DecoderName,
    options?: AudioStreamPlayerOptions
  );

  /** Connect the player's output to an AudioNode */
  connect(destination: AudioNode, outputIndex?: number, inputIndex?: number): AudioNode;
  /** Connect the player's output to an AudioParam */
  connect(destination: AudioParam, outputIndex?: number): void;

  /** Disconnect all outputs */
  disconnect(): void;
  /** Disconnect from a specific AudioNode */
  disconnect(destination: AudioNode, output?: number, input?: number): void;
  /** Disconnect from a specific AudioParam */
  disconnect(destination: AudioParam, output?: number): void;

  /** Start streaming and playback */
  start(): void;

  /** Stop playback and release all resources */
  close(): void;
}

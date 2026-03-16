import { AudioStreamPlayer } from '@puresignal/fetch-stream-audio';
import wavWorkerUrl from '@puresignal/fetch-stream-audio/worker-decoder-wav?url';
import opusWorkerUrl from '@puresignal/fetch-stream-audio/worker-decoder-opus?url';
import { Player } from '../lit-components/player.mjs';

export class AudioPlayer {
  _ui;
  _audio;
  _audioCtx;
  _readSize;
  _mime;
  _codec;
  _decoder

  constructor({ url, wrapper, readBufferSize, mime, codec, onStateChange, decoder }) {
    this._readSize = readBufferSize;
    this._ui = new Player(wrapper);
    this._ui.onAction = this._onAction.bind(this);
    this._audioCtx = new AudioContext({ latencyHint: 'interactive' });
    this._audio = new AudioStreamPlayer(this._audioCtx, url, readBufferSize, codec.toUpperCase(), { wavWorkerUrl, opusWorkerUrl });
    this._audio.connect(this._audioCtx.destination);
    this._audio.onUpdateState = this._onUpdateState.bind(this);

    this._mime = mime;
    this._codec = codec;
    this._onStateChange = onStateChange;
    this._decoder = decoder;

    this.reset();
  }

  _onAction(action) {
    if (this[action]) {
      this[action]();
    }
  }

  _onUpdateState(state) {
    this._ui.setState(state);
  }

  start() {
    void this._audioCtx.resume();
    this._audio.start();
    this._ui.setState({
      playState: 'playing',
      readBuffer: this._readSize,
      decoder: this._decoder
    });
    this._onStateChange('started');
    this._onStateChange('playing');
  }
  pause() {
    void this._audioCtx.suspend();
    this._ui.setState({ playState: 'paused' });
    this._onStateChange('paused');
  }
  resume() {
    void this._audioCtx.resume();
    this._ui.setState({ playState: 'playing' });
    this._onStateChange('playing');
  }

  reset() {
    this._audio.close();
    this._ui.setState({
      playState: 'init',
      mime: this._mime,
      codec: this._codec,
      latency: null,
      bytesRead: null,
      bytesTotal: null,
      dlRate: null,
      abCreated: null,
      abEnded: null,
      abRemaining: null,
      error: null,
      readBuffer: null,
      decoder: null,
      skips: null,
    });
    this._onStateChange('reset');
  }


}

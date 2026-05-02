/**
 * Lean HTML5 audio player + Media Session bindings.
 * Per Directive 1: single-track playback only for v1. No queue, no gapless.
 */

export type Track = {
  id: number | string;
  title: string;
  artist?: string;
  artwork?: string;
  src: string;
};

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type Listener = (s: { state: AudioState; track: Track | null; position: number; duration: number }) => void;

class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private state: AudioState = 'idle';
  private track: Track | null = null;
  private listeners = new Set<Listener>();
  private rafId: number | null = null;

  private ensureAudio(): HTMLAudioElement {
    if (typeof window === 'undefined') {
      throw new Error('Audio is not available during SSR');
    }
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.audio.addEventListener('loadstart', () => this.update('loading'));
      this.audio.addEventListener('playing', () => { this.update('playing'); this.startTicker(); });
      this.audio.addEventListener('pause', () => { this.update('paused'); this.stopTicker(); });
      this.audio.addEventListener('ended', () => { this.update('idle'); this.stopTicker(); });
      this.audio.addEventListener('error', () => { this.update('error'); this.stopTicker(); });
    }
    return this.audio;
  }

  async load(track: Track) {
    const a = this.ensureAudio();
    this.track = track;
    a.src = track.src;
    this.bindMediaSession(track);
    this.emit();
  }

  async play(track?: Track) {
    if (track) await this.load(track);
    const a = this.ensureAudio();
    try { await a.play(); } catch { this.update('error'); }
  }

  pause() { this.audio?.pause(); }

  toggle() {
    const a = this.audio;
    if (!a) return;
    if (a.paused) a.play().catch(() => this.update('error'));
    else a.pause();
  }

  seekRelative(seconds: number) {
    const a = this.audio;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || a.currentTime, a.currentTime + seconds));
  }

  seekTo(seconds: number) {
    const a = this.audio;
    if (a) a.currentTime = seconds;
  }

  stop() {
    const a = this.audio;
    if (a) { a.pause(); a.currentTime = 0; }
    this.track = null;
    this.update('idle');
  }

  on(l: Listener): () => void {
    this.listeners.add(l);
    this.emit();
    return () => this.listeners.delete(l);
  }

  private update(s: AudioState) { this.state = s; this.emit(); }

  private emit() {
    const a = this.audio;
    const snap = {
      state: this.state,
      track: this.track,
      position: a?.currentTime || 0,
      duration: a?.duration || 0,
    };
    this.listeners.forEach((l) => l(snap));
  }

  private startTicker() {
    if (typeof window === 'undefined' || this.rafId != null) return;
    const tick = () => {
      this.emit();
      this.rafId = window.requestAnimationFrame(tick);
    };
    this.rafId = window.requestAnimationFrame(tick);
  }

  private stopTicker() {
    if (this.rafId != null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
  }

  private bindMediaSession(track: Track) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || 'Sports Mockery',
      artwork: track.artwork
        ? [{ src: track.artwork, sizes: '512x512', type: 'image/png' }]
        : [],
    });
    ms.setActionHandler('play', () => this.audio?.play().catch(() => {}));
    ms.setActionHandler('pause', () => this.audio?.pause());
    ms.setActionHandler('seekbackward', () => this.seekRelative(-15));
    ms.setActionHandler('seekforward', () => this.seekRelative(15));
  }
}

export const audioPlayer = new AudioPlayer();

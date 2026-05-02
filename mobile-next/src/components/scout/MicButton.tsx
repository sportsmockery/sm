'use client';

import { Mic, MicOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';

interface SpeechRecognitionLike {
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor() as SpeechRecognitionLike;
}

export interface MicButtonProps {
  onTranscript: (text: string) => void;
  onSubmit?: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function MicButton({ onTranscript, onSubmit, className, disabled }: MicButtonProps) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [amp, setAmp] = useState(1);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const r = getRecognition();
    if (!r) { setSupported(false); return; }
  }, []);

  function stopAmp() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAmp(1);
  }

  async function start() {
    if (recording || disabled) return;
    haptic('light');
    const rec = getRecognition();
    if (!rec) { setSupported(false); return; }
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else onTranscript(r[0].transcript);
      }
      if (final) {
        onTranscript(final);
        onSubmit?.(final);
      }
    };
    rec.onerror = () => stop();
    rec.onend = () => stop();
    recRef.current = rec;
    rec.start();
    setRecording(true);

    // Amplitude pulse
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((s, v) => s + v, 0) / buf.length;
        setAmp(1 + Math.min(0.5, avg / 200));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* mic permission denied */
    }
  }

  function stop() {
    haptic('light');
    recRef.current?.stop();
    setRecording(false);
    stopAmp();
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      disabled={disabled}
      aria-pressed={recording}
      aria-label={recording ? 'Stop voice input' : 'Start voice input'}
      style={{ transform: recording ? `scale(${amp})` : undefined }}
      className={cn(
        'h-11 w-11 rounded-full grid place-items-center transition-[background-color] duration-200',
        recording ? 'bg-brand-red text-white shadow-[0_0_24px_rgba(188,0,0,0.6)]' : 'bg-white/10 text-white/80',
        className,
      )}
    >
      {recording ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}

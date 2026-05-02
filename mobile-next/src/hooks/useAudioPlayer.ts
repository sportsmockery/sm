'use client';

import { useEffect, useState } from 'react';
import { audioPlayer, type AudioState, type Track } from '@/lib/audio/player';

export function useAudioPlayer() {
  const [state, setState] = useState<AudioState>('idle');
  const [track, setTrack] = useState<Track | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return audioPlayer.on(({ state, track, position, duration }) => {
      setState(state);
      setTrack(track);
      setPosition(position);
      setDuration(duration);
    });
  }, []);

  return {
    state,
    track,
    position,
    duration,
    isPlaying: state === 'playing',
    isPaused: state === 'paused',
    isLoading: state === 'loading',
    play: audioPlayer.play.bind(audioPlayer),
    pause: audioPlayer.pause.bind(audioPlayer),
    toggle: audioPlayer.toggle.bind(audioPlayer),
    seekRelative: audioPlayer.seekRelative.bind(audioPlayer),
    seekTo: audioPlayer.seekTo.bind(audioPlayer),
    stop: audioPlayer.stop.bind(audioPlayer),
    load: audioPlayer.load.bind(audioPlayer),
  };
}

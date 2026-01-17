// components/article/ArticleAudioPlayer.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ArticleMeta, NextArticleMode } from "@/lib/audioPlayer";

interface ArticleAudioPlayerProps {
  initialArticle: ArticleMeta;
  initialAudioUrl: string;
  articleContent?: string; // HTML content to read
}

interface PlaylistState {
  currentArticle: ArticleMeta;
  currentAudioUrl: string;
  mode: NextArticleMode;
  content: string;
}

// Voice profile configuration
type VoiceProfileId = 'mike' | 'david' | 'sarah' | 'jennifer';

interface VoiceProfile {
  id: VoiceProfileId;
  name: string;
  description: string;
  gender: 'male' | 'female';
  rate: number;
  pitch: number;
}

const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'mike',
    name: 'Mike',
    description: 'Young male, energetic',
    gender: 'male',
    rate: 1.05,
    pitch: 1.1,
  },
  {
    id: 'david',
    name: 'David',
    description: 'Mature male, authoritative',
    gender: 'male',
    rate: 0.95,
    pitch: 0.9,
  },
  {
    id: 'sarah',
    name: 'Sarah',
    description: 'Young female, expressive',
    gender: 'female',
    rate: 1.0,
    pitch: 1.15,
  },
  {
    id: 'jennifer',
    name: 'Jennifer',
    description: 'Young female, warm',
    gender: 'female',
    rate: 0.98,
    pitch: 1.05,
  },
];

// Strip HTML tags and get plain text
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// Find the best matching voice from available voices
function findBestVoice(
  voices: SpeechSynthesisVoice[],
  gender: 'male' | 'female'
): SpeechSynthesisVoice | null {
  // Prefer US English voices
  const usVoices = voices.filter(v =>
    v.lang === 'en-US' || v.lang.startsWith('en-US')
  );

  // Voice name patterns for gender detection
  const maleNames = ['david', 'mike', 'alex', 'tom', 'james', 'daniel', 'guy', 'aaron', 'fred', 'junior', 'ralph', 'albert'];
  const femaleNames = ['samantha', 'victoria', 'karen', 'sarah', 'susan', 'jennifer', 'kate', 'allison', 'ava', 'zira', 'linda', 'fiona', 'tessa'];

  const targetNames = gender === 'male' ? maleNames : femaleNames;

  // First try: Find US English voice with matching gender by name
  for (const voice of usVoices) {
    const nameLower = voice.name.toLowerCase();
    if (targetNames.some(name => nameLower.includes(name))) {
      return voice;
    }
  }

  // Second try: Any English voice with matching gender by name
  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  for (const voice of enVoices) {
    const nameLower = voice.name.toLowerCase();
    if (targetNames.some(name => nameLower.includes(name))) {
      return voice;
    }
  }

  // Third try: Google US English (high quality, generally available)
  const googleVoice = usVoices.find(v =>
    v.name.includes('Google') && v.name.includes('US')
  );
  if (googleVoice) return googleVoice;

  // Fourth try: Any US English voice (prefer non-local for higher quality)
  const remoteVoice = usVoices.find(v => !v.localService);
  if (remoteVoice) return remoteVoice;

  // Fifth try: Any US English voice
  if (usVoices.length > 0) return usVoices[0];

  // Fallback: Any English voice
  return enVoices[0] || voices[0] || null;
}

export function ArticleAudioPlayer({
  initialArticle,
  initialAudioUrl,
  articleContent = '',
}: ArticleAudioPlayerProps) {
  const [playlist, setPlaylist] = useState<PlaylistState>({
    currentArticle: initialArticle,
    currentAudioUrl: initialAudioUrl,
    mode: "team",
    content: articleContent,
  });
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfileId>('mike');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>('');
  const charIndexRef = useRef<number>(0);

  // Check for Speech Synthesis support
  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsSupported(false);
      setError('Text-to-speech is not supported in your browser.');
    }
  }, []);

  // Load voices when they become available
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    // Load immediately if already available
    loadVoices();

    // Also listen for voices to load (some browsers load async)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleModeChange = (mode: NextArticleMode) => {
    setPlaylist((prev) => ({ ...prev, mode }));
  };

  const handleVoiceChange = (voiceId: VoiceProfileId) => {
    setSelectedVoice(voiceId);
    setShowVoiceSelector(false);

    // If currently playing, restart with new voice
    if (isPlaying || isPaused) {
      stopSpeech();
      setTimeout(() => {
        startSpeech(playlist.content, playlist.currentArticle.title, voiceId);
      }, 100);
    }
  };

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    charIndexRef.current = 0;
  }, []);

  const loadNextArticle = useCallback(async () => {
    stopSpeech();
    setIsLoadingNext(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/audio/next?articleId=${playlist.currentArticle.id}&mode=${playlist.mode}&team=${playlist.currentArticle.team ?? ""}`
      );
      if (!res.ok) {
        throw new Error(`Failed to load next article: ${res.status}`);
      }
      const data = (await res.json()) as {
        article: ArticleMeta;
        audioUrl: string;
        content?: string;
      } | null;

      if (!data) {
        setError("No more articles available in this sequence.");
        setIsLoadingNext(false);
        return;
      }

      // Fetch the article content
      const contentRes = await fetch(`/api/posts/${data.article.id}`);
      let content = '';
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        content = contentData.content || '';
      }

      setPlaylist({
        currentArticle: data.article,
        currentAudioUrl: data.audioUrl,
        mode: playlist.mode,
        content: content,
      });

      // Auto-play after a short delay
      setTimeout(() => {
        startSpeech(content, data.article.title);
      }, 500);
    } catch (e) {
      console.error(e);
      setError("Error loading next article.");
    } finally {
      setIsLoadingNext(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.currentArticle.id, playlist.currentArticle.team, playlist.mode, stopSpeech]);

  const startSpeech = useCallback((content: string, title: string, voiceId?: VoiceProfileId) => {
    if (!isSupported || typeof window === 'undefined') return;

    const voiceProfile = VOICE_PROFILES.find(v => v.id === (voiceId || selectedVoice)) || VOICE_PROFILES[0];

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    // Prepare text: title + content
    const plainText = `${title}. ${stripHtml(content)}`;
    textRef.current = plainText;

    const utterance = new SpeechSynthesisUtterance(plainText);
    utteranceRef.current = utterance;

    // Apply voice profile settings
    utterance.rate = voiceProfile.rate;
    utterance.pitch = voiceProfile.pitch;
    utterance.volume = 1.0;

    // Find the best matching voice for this profile
    if (availableVoices.length > 0) {
      const voice = findBestVoice(availableVoices, voiceProfile.gender);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      // Auto-advance to next article
      loadNextArticle();
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        console.error('Speech error:', event.error);
        setError(`Speech error: ${event.error}`);
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      charIndexRef.current = event.charIndex;
      const progressPercent = (event.charIndex / plainText.length) * 100;
      setProgress(progressPercent);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, availableVoices, loadNextArticle]);

  const handlePlayPause = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;

    if (isPlaying && !isPaused) {
      // Pause
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Start fresh
      startSpeech(playlist.content, playlist.currentArticle.title);
    }
  }, [isSupported, isPlaying, isPaused, playlist.content, playlist.currentArticle.title, startSpeech]);

  const handleStop = useCallback(() => {
    stopSpeech();
  }, [stopSpeech]);

  const currentVoiceProfile = VOICE_PROFILES.find(v => v.id === selectedVoice) || VOICE_PROFILES[0];

  if (!isSupported) {
    return (
      <div className="border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg mt-4 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Text-to-speech is not supported in your browser.
        </div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg mt-4 bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex justify-between items-center gap-3 mb-3 text-sm">
        <span className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Listen to this article
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
          {playlist.currentArticle.title}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mb-3">
        <div
          className="bg-[#bc0000] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handlePlayPause}
            className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white transition-colors text-sm flex items-center gap-1.5"
          >
            {isPlaying && !isPaused ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {isPaused ? 'Resume' : 'Play'}
              </>
            )}
          </button>
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStop}
              className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white transition-colors text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={loadNextArticle}
            disabled={isLoadingNext}
            className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-white transition-colors text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
            {isLoadingNext ? "Loading..." : "Next"}
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {/* Voice selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="px-2.5 py-1 rounded-full text-xs transition-colors border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {currentVoiceProfile.name}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showVoiceSelector && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 py-1 mb-1">
                    Select Voice
                  </div>
                  {VOICE_PROFILES.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleVoiceChange(profile.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                        selectedVoice === profile.id
                          ? 'bg-red-50 dark:bg-red-900/20 text-[#bc0000] dark:text-red-400'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-zinc-500 dark:text-zinc-400">{profile.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="text-zinc-500 dark:text-zinc-400 text-xs">Next by:</span>
          <button
            type="button"
            onClick={() => handleModeChange("team")}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              playlist.mode === "team"
                ? "border border-[#bc0000] bg-red-50 dark:bg-red-900/20 text-[#bc0000] dark:text-red-400"
                : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600"
            }`}
          >
            Team
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("recent")}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              playlist.mode === "recent"
                ? "border border-[#bc0000] bg-red-50 dark:bg-red-900/20 text-[#bc0000] dark:text-red-400"
                : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

export default ArticleAudioPlayer;

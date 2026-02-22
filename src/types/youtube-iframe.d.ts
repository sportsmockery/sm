// Type declarations for YouTube IFrame Player API
// https://developers.google.com/youtube/iframe_api_reference

declare namespace YT {
  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    destroy(): void
    getPlayerState(): number
    getCurrentTime(): number
    getDuration(): number
    getVideoUrl(): string
    getVideoEmbedCode(): string
    mute(): void
    unMute(): void
    isMuted(): boolean
    setVolume(volume: number): void
    getVolume(): number
  }

  interface PlayerOptions {
    videoId?: string
    width?: number | string
    height?: number | string
    playerVars?: PlayerVars
    events?: PlayerEvents
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    cc_load_policy?: 0 | 1
    color?: 'red' | 'white'
    controls?: 0 | 1
    disablekb?: 0 | 1
    enablejsapi?: 0 | 1
    fs?: 0 | 1
    hl?: string
    iv_load_policy?: 1 | 3
    loop?: 0 | 1
    modestbranding?: 0 | 1
    origin?: string
    playsinline?: 0 | 1
    rel?: 0 | 1
    start?: number
    end?: number
  }

  interface PlayerEvents {
    onReady?: (event: PlayerEvent) => void
    onStateChange?: (event: OnStateChangeEvent) => void
    onPlaybackQualityChange?: (event: PlayerEvent) => void
    onPlaybackRateChange?: (event: PlayerEvent) => void
    onError?: (event: OnErrorEvent) => void
    onApiChange?: (event: PlayerEvent) => void
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent {
    target: Player
    data: number
  }

  interface OnErrorEvent {
    target: Player
    data: number
  }

  const PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

interface Window {
  YT?: typeof YT & { Player: typeof YT.Player }
  onYouTubeIframeAPIReady?: () => void
}

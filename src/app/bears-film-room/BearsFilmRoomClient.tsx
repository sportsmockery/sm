// app/bears-film-room/BearsFilmRoomClient.tsx
'use client';

import { useState, useEffect } from 'react';
import type { ShowVideo } from '@/lib/youtubeTypes';
import { formatDate, truncate } from '@/lib/formatters';

type Props = {
  latestVideo: ShowVideo | null;
  previousVideos: ShowVideo[];
};

export function BearsFilmRoomClient({ latestVideo, previousVideos }: Props) {
  if (!latestVideo) {
    return (
      <main className="sm-show-page sm-bears-film-room">
        <section className="sm-show-hero">
          <div className="sm-container sm-hero-inner">
            <div className="sm-hero-text">
              <img
                src="/youtubelogos/bfr.png"
                alt="Bears Film Room"
                className="sm-show-logo"
                style={{ marginBottom: '0.5rem', width: '140px', height: 'auto' }}
              />
              <div className="flex items-center gap-2 mb-2">
                <span className="sm-show-label" style={{ marginBottom: 0 }}>Bears Film Room</span>
                <div className="flex items-center gap-3 ml-2">
                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/@bearsfilmroom?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors"
                    title="Subscribe on YouTube"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  {/* Apple Podcasts */}
                  <a
                    href="https://podcasts.apple.com/us/podcast/bears-film-room-a-chicago-bears-show/id1690627823"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors"
                    title="Listen on Apple Podcasts"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59.12 2.2.007 2.864a8.506 8.506 0 01-3.24 5.296c-.608.46-1.768 1.128-1.768 1.024 0-.04.144-.477.32-1.073.175-.596.395-1.405.488-1.8l.17-.72.447-.224c1.032-.511 1.88-1.32 2.424-2.318.903-1.656.903-3.503 0-5.16-.456-.84-1.248-1.655-2.063-2.127-1.632-.944-3.648-.944-5.28 0-.815.472-1.607 1.287-2.063 2.128-.903 1.656-.903 3.503 0 5.16.544.998 1.392 1.806 2.424 2.317l.447.224.168.72c.096.395.313 1.204.489 1.8.175.596.32 1.033.32 1.073 0 .104-1.16-.564-1.769-1.024a8.506 8.506 0 01-3.24-5.296c-.112-.664-.112-2.275.008-2.864.352-1.773 1.04-3.12 2.264-4.392 1.608-1.685 3.72-2.587 6.056-2.587zm-.04 3.96c.456 0 .904.072 1.344.217 1.016.328 1.848.992 2.424 1.928.36.592.536 1.136.608 1.912.056.6-.048 1.272-.288 1.847-.376.912-1.12 1.736-1.984 2.2l-.24.128-.752 3.216c-.416 1.768-.776 3.224-.8 3.232-.024.008-.128-.048-.232-.128-.248-.192-.584-.312-.936-.336-.168-.008-.48.024-.696.08a2.096 2.096 0 00-.84.448c-.104.08-.208.136-.232.128-.024-.008-.384-1.464-.8-3.232l-.752-3.216-.24-.128c-.848-.456-1.584-1.264-1.976-2.16a3.925 3.925 0 01-.296-1.886c.072-.776.248-1.32.608-1.912.576-.936 1.408-1.6 2.424-1.928.44-.145.888-.217 1.344-.217h.312zm-.056 2.632a1.56 1.56 0 00-1.56 1.56c0 .864.696 1.56 1.56 1.56s1.56-.696 1.56-1.56a1.56 1.56 0 00-1.56-1.56z"/>
                    </svg>
                  </a>
                  {/* Spotify */}
                  <a
                    href="https://open.spotify.com/show/4PrKJqFN7qJJIwM8qH2OWT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors"
                    title="Listen on Spotify"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                  {/* Twitter/X */}
                  <a
                    href="https://x.com/bfr_pod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors"
                    title="Follow on X"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <h1 className="sm-hero-title">Videos temporarily unavailable</h1>
              <p className="sm-hero-description">
                Please check back soon. We&apos;re having trouble loading the latest episodes.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [activeVideoId, setActiveVideoId] = useState(latestVideo.videoId);

  // Scroll to top on mount (prevents iframe from stealing scroll position)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="sm-show-page sm-bears-film-room">
      <section className="sm-show-hero">
        <div className="sm-container sm-hero-inner">
          <div className="sm-hero-text">
            <img
              src="/youtubelogos/bfr.png"
              alt="Bears Film Room"
              className="sm-show-logo"
              style={{ marginBottom: '0.5rem', width: '140px', height: 'auto' }}
            />
            <div className="flex items-center gap-2 mb-2">
              <span className="sm-show-label" style={{ marginBottom: 0 }}>Bears Film Room</span>
              <div className="flex items-center gap-3 ml-2">
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@bearsfilmroom?sub_confirmation=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Subscribe on YouTube"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* Apple Podcasts */}
                <a
                  href="https://podcasts.apple.com/us/podcast/bears-film-room-a-chicago-bears-show/id1690627823"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Listen on Apple Podcasts"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59.12 2.2.007 2.864a8.506 8.506 0 01-3.24 5.296c-.608.46-1.768 1.128-1.768 1.024 0-.04.144-.477.32-1.073.175-.596.395-1.405.488-1.8l.17-.72.447-.224c1.032-.511 1.88-1.32 2.424-2.318.903-1.656.903-3.503 0-5.16-.456-.84-1.248-1.655-2.063-2.127-1.632-.944-3.648-.944-5.28 0-.815.472-1.607 1.287-2.063 2.128-.903 1.656-.903 3.503 0 5.16.544.998 1.392 1.806 2.424 2.317l.447.224.168.72c.096.395.313 1.204.489 1.8.175.596.32 1.033.32 1.073 0 .104-1.16-.564-1.769-1.024a8.506 8.506 0 01-3.24-5.296c-.112-.664-.112-2.275.008-2.864.352-1.773 1.04-3.12 2.264-4.392 1.608-1.685 3.72-2.587 6.056-2.587zm-.04 3.96c.456 0 .904.072 1.344.217 1.016.328 1.848.992 2.424 1.928.36.592.536 1.136.608 1.912.056.6-.048 1.272-.288 1.847-.376.912-1.12 1.736-1.984 2.2l-.24.128-.752 3.216c-.416 1.768-.776 3.224-.8 3.232-.024.008-.128-.048-.232-.128-.248-.192-.584-.312-.936-.336-.168-.008-.48.024-.696.08a2.096 2.096 0 00-.84.448c-.104.08-.208.136-.232.128-.024-.008-.384-1.464-.8-3.232l-.752-3.216-.24-.128c-.848-.456-1.584-1.264-1.976-2.16a3.925 3.925 0 01-.296-1.886c.072-.776.248-1.32.608-1.912.576-.936 1.408-1.6 2.424-1.928.44-.145.888-.217 1.344-.217h.312zm-.056 2.632a1.56 1.56 0 00-1.56 1.56c0 .864.696 1.56 1.56 1.56s1.56-.696 1.56-1.56a1.56 1.56 0 00-1.56-1.56z"/>
                  </svg>
                </a>
                {/* Spotify */}
                <a
                  href="https://open.spotify.com/show/4PrKJqFN7qJJIwM8qH2OWT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Listen on Spotify"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a
                  href="https://x.com/bfr_pod"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Follow on X"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
            <h1 className="sm-hero-title">{latestVideo.title}</h1>
            <p className="sm-hero-meta">
              {formatDate(latestVideo.publishedAt)} · Latest episode
            </p>
            <p className="sm-hero-description">
              {truncate(latestVideo.description, 220)}
            </p>
          </div>

          <div className="sm-hero-video">
            <div className="sm-video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}`}
                title={latestVideo.title}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sm-show-previous">
        <div className="sm-container">
          <h2 className="sm-section-title">Recent episodes</h2>
          <div className="sm-video-grid">
            {previousVideos.map((video) => (
              <article key={video.videoId} className="sm-video-card">
                <button
                  type="button"
                  className="sm-video-thumb-button"
                  onClick={() => setActiveVideoId(video.videoId)}
                >
                  <div className="sm-video-thumb">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                    />
                    <span className="sm-video-play-icon">▶</span>
                  </div>
                </button>
                <div className="sm-video-info">
                  <h3 className="sm-video-title">{video.title}</h3>
                  <p className="sm-video-meta">
                    {formatDate(video.publishedAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-show-cta">
        <div className="sm-container sm-cta-inner">
          <p className="sm-cta-text">
            Want more Bears Film Room breakdowns?
          </p>
          <a
            href="https://www.youtube.com/@bearsfilmroom/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="sm-cta-button"
          >
            View full video archive
          </a>
        </div>
      </section>
    </main>
  );
}

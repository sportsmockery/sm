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
              <div className="flex items-center gap-8 mb-3">
                <img
                  src="/youtubelogos/bfr.png"
                  alt="Bears Film Room"
                  className="sm-show-logo"
                  style={{ marginBottom: 0 }}
                />
                <div className="flex flex-col gap-2">
                  {/* YouTube Subscribe */}
                  <a
                    href="https://www.youtube.com/@bearsfilmroom?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-28 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold rounded transition-colors"
                  >
                    <span>Subscribe</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  {/* Apple Podcasts */}
                  <a
                    href="https://podcasts.apple.com/us/podcast/bears-film-room-a-chicago-bears-show/id1690627823"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-28 px-2 py-1 bg-white hover:bg-gray-100 text-purple-600 text-[10px] font-semibold rounded transition-colors"
                  >
                    <span>Apple</span>
                    <img src="https://logos-world.net/wp-content/uploads/2021/10/Podcast-Emblem.png" alt="Apple Podcasts" className="w-3 h-3 object-contain" />
                  </a>
                  {/* Spotify */}
                  <a
                    href="https://open.spotify.com/show/4PrKJqFN7qJJIwM8qH2OWT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-28 px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-[10px] font-semibold rounded transition-colors"
                  >
                    <span>Spotify</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                  {/* Twitter/X */}
                  <a
                    href="https://x.com/bfr_pod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-28 px-2 py-1 border border-white bg-transparent hover:bg-white/10 text-white text-[10px] font-semibold rounded transition-colors"
                  >
                    <span>Follow</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <span className="sm-show-label">Bears Film Room</span>
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
            <div className="flex items-center gap-8 mb-3">
              <img
                src="/youtubelogos/bfr.png"
                alt="Bears Film Room"
                className="sm-show-logo"
                style={{ marginBottom: 0 }}
              />
              <div className="flex flex-col gap-2">
                {/* YouTube Subscribe */}
                <a
                  href="https://www.youtube.com/@bearsfilmroom?sub_confirmation=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-28 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold rounded transition-colors"
                >
                  <span>Subscribe</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* Apple Podcasts */}
                <a
                  href="https://podcasts.apple.com/us/podcast/bears-film-room-a-chicago-bears-show/id1690627823"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-28 px-2 py-1 bg-white hover:bg-gray-100 text-purple-600 text-[10px] font-semibold rounded transition-colors"
                >
                  <span>Apple</span>
                  <img src="https://logos-world.net/wp-content/uploads/2021/10/Podcast-Emblem.png" alt="Apple Podcasts" className="w-3 h-3 object-contain" />
                </a>
                {/* Spotify */}
                <a
                  href="https://open.spotify.com/show/4PrKJqFN7qJJIwM8qH2OWT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-28 px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-[10px] font-semibold rounded transition-colors"
                >
                  <span>Spotify</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a
                  href="https://x.com/bfr_pod"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-28 px-2 py-1 border border-white bg-transparent hover:bg-white/10 text-white text-[10px] font-semibold rounded transition-colors"
                >
                  <span>Follow</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
            <span className="sm-show-label">Bears Film Room</span>
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

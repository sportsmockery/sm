// app/untold-chicago-stories/UntoldChicagoClient.tsx
'use client';

import { useState, useEffect } from 'react';
import type { ShowVideo } from '@/lib/youtubeTypes';
import { formatDate, truncate } from '@/lib/formatters';

type Props = {
  latestVideo: ShowVideo | null;
  previousVideos: ShowVideo[];
};

export function UntoldChicagoClient({ latestVideo, previousVideos }: Props) {
  if (!latestVideo) {
    return (
      <main className="sm-show-page sm-untold-chicago">
        <section className="sm-show-hero">
          <div className="sm-container sm-hero-inner">
            <div className="sm-hero-text">
              <img
                src="/youtubelogos/untold-white.png"
                alt="Untold Chicago Stories"
                style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
              />
              <span className="sm-show-label">Untold Chicago Stories</span>
              <h1 className="sm-hero-title">Videos temporarily unavailable</h1>
              <p className="sm-hero-description">
                Please check back soon. We&apos;re having trouble loading the latest episodes.
              </p>
              <div className="flex items-center justify-center gap-5 mt-4">
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@untoldchicagostories?sub_confirmation=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Subscribe on YouTube"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
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
    <main className="sm-show-page sm-untold-chicago">
      <section className="sm-show-hero">
        <div className="sm-container sm-hero-inner">
          <div className="sm-hero-text">
            <img
              src="/youtubelogos/untold-white.png"
              alt="Untold Chicago Stories"
              style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            />
            <span className="sm-show-label">Untold Chicago Stories</span>
            <h1 className="sm-hero-title">{latestVideo.title}</h1>
            <p className="sm-hero-meta">
              {formatDate(latestVideo.publishedAt)} · Latest episode
            </p>
            <p className="sm-hero-description">
              {truncate(latestVideo.description, 220)}
            </p>
            <div className="flex items-center justify-center gap-5 mt-4">
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@untoldchicagostories?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/70 transition-colors"
                title="Subscribe on YouTube"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="sm-hero-video self-center">
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
            Want more Untold Chicago Stories?
          </p>
          <a
            href="https://www.youtube.com/@untoldchicagostories/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="sm-cta-button-untold"
          >
            View Full Video Archive
          </a>
        </div>
      </section>
    </main>
  );
}

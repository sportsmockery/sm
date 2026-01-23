// app/southside-behavior/SouthsideBehaviorClient.tsx
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import type { TikTokEmbed } from '@/lib/tiktokTypes';
import { formatDate, truncate } from '@/lib/formatters';

type Props = {
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
};

export function SouthsideBehaviorClient({ latestEmbed, previousEmbeds }: Props) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reload TikTok embeds after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).tiktokEmbed) {
        (window as any).tiktokEmbed.lib.render();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!latestEmbed) {
    return (
      <main className="sm-show-page sm-southside-behavior">
        <section className="sm-show-hero sm-tiktok-hero">
          <div className="sm-container">
            <div className="sm-tiktok-hero-inner">
              <div className="sm-hero-text" style={{ maxWidth: '400px' }}>
                <img
                  src="/youtubelogos/ssb-logo.png"
                  alt="Southside Behavior"
                  style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                />
                <span className="sm-show-label">Southside Behavior</span>
                <h1 className="sm-hero-title">Videos temporarily unavailable</h1>
                <p className="sm-hero-description">
                  Please check back soon. We&apos;re having trouble loading the latest TikToks.
                </p>
                <div className="flex items-center justify-center gap-5 mt-4">
                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@southsidebehavior"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors"
                    title="Follow on TikTok"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </a>
                  {/* Twitter/X */}
                  <a
                    href="https://x.com/SouthsideBhvr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/70 transition-colors"
                    title="Follow on X"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sm-show-page sm-southside-behavior">
      {/* TikTok Embed Script */}
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />

      {/* Hero Section - Featured TikTok */}
      <section className="sm-show-hero sm-tiktok-hero">
        <div className="sm-container">
          <div className="sm-tiktok-hero-inner">
            <div className="sm-hero-text" style={{ maxWidth: '400px' }}>
              <img
                src="/youtubelogos/ssb-logo.png"
                alt="Southside Behavior"
                style={{ marginBottom: '0.5rem', maxWidth: '320px', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
              />
              <span className="sm-show-label">Southside Behavior</span>
              <h1 className="sm-hero-title">
                {truncate(latestEmbed.title, 120)}
              </h1>
              <p className="sm-hero-meta">
                {formatDate(latestEmbed.publishedAt)} · Latest TikTok
              </p>
              <p className="sm-hero-description">
                Quick-hit TikToks from the South Side fan perspective. Catch the latest clips, reactions, and behind-the-scenes moments from White Sox fandom.
              </p>
              <div className="flex items-center justify-center gap-5 mt-4">
                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@southsidebehavior"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Follow on TikTok"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a
                  href="https://x.com/SouthsideBhvr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/70 transition-colors"
                  title="Follow on X"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="sm-tiktok-featured">
              <div
                className="sm-tiktok-embed-wrapper"
                dangerouslySetInnerHTML={{ __html: latestEmbed.html }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Videos Section */}
      {previousEmbeds.length > 0 && (
        <section className="sm-show-previous">
          <div className="sm-container">
            <h2 className="sm-section-title">Recent videos</h2>
            <div className="sm-tiktok-grid">
              {previousEmbeds.map((embed) => (
                <article key={embed.url} className="sm-tiktok-card">
                  <a
                    href={embed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm-tiktok-card-link"
                  >
                    <div className="sm-tiktok-thumb">
                      <img
                        src={embed.thumbnailUrl}
                        alt={embed.title}
                        loading="lazy"
                      />
                      <span className="sm-tiktok-play-icon">▶</span>
                    </div>
                  </a>
                  <div className="sm-video-info">
                    <h3 className="sm-video-title">{truncate(embed.title, 60)}</h3>
                    <p className="sm-video-meta">
                      {formatDate(embed.publishedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="sm-show-cta">
        <div className="sm-container sm-cta-inner">
          <p className="sm-cta-text">
            Want more Southside Behavior content?
          </p>
          <a
            href="https://www.tiktok.com/@southsidebehavior"
            target="_blank"
            rel="noopener noreferrer"
            className="sm-cta-button-ssb"
          >
            Follow on TikTok
          </a>
        </div>
      </section>
    </main>
  );
}

// app/southside-behavior/SouthsideBehaviorClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { TikTokEmbed } from '@/lib/tiktokTypes';
import { truncateCaption } from '@/lib/tiktokFormatters';

type Props = {
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
};

// White Sox team colors
const WHITESOX_PRIMARY = '#27251F';
const WHITESOX_SECONDARY = '#C4CED4';

export function SouthsideBehaviorClient({ latestEmbed, previousEmbeds }: Props) {
  const [activeEmbed, setActiveEmbed] = useState(latestEmbed);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!latestEmbed) {
    return (
      <main className="sm-show-page">
        {/* White Sox Team Bar */}
        <div
          className="w-full py-2 px-4"
          style={{ backgroundColor: WHITESOX_PRIMARY }}
        >
          <div className="sm-container flex items-center justify-between">
            <Link href="/chicago-white-sox" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="/logos/whitesox.svg"
                alt="White Sox"
                className="w-8 h-8 object-contain"
              />
              <span className="text-white font-semibold text-sm">Chicago White Sox</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/chicago-white-sox/schedule" className="text-white/70 hover:text-white transition-colors">Schedule</Link>
              <Link href="/chicago-white-sox/roster" className="text-white/70 hover:text-white transition-colors">Roster</Link>
              <Link href="/chicago-white-sox/stats" className="text-white/70 hover:text-white transition-colors">Stats</Link>
            </nav>
          </div>
        </div>

        <section className="sm-show-hero">
          <div className="sm-container sm-hero-inner">
            <div className="sm-hero-text">
              <span className="sm-show-label">Southside Behavior</span>
              <h1 className="sm-hero-title">Videos temporarily unavailable</h1>
              <p className="sm-hero-description">
                Please check back soon. We&apos;re having trouble loading the latest TikToks.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sm-show-page">
      {/* White Sox Team Bar */}
      <div
        className="w-full py-2 px-4"
        style={{ backgroundColor: WHITESOX_PRIMARY }}
      >
        <div className="sm-container flex items-center justify-between">
          <Link href="/chicago-white-sox" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/logos/whitesox.svg"
              alt="White Sox"
              className="w-8 h-8 object-contain"
            />
            <span className="text-white font-semibold text-sm">Chicago White Sox</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/chicago-white-sox/schedule" className="text-white/70 hover:text-white transition-colors">Schedule</Link>
            <Link href="/chicago-white-sox/roster" className="text-white/70 hover:text-white transition-colors">Roster</Link>
            <Link href="/chicago-white-sox/stats" className="text-white/70 hover:text-white transition-colors">Stats</Link>
          </nav>
        </div>
      </div>

      {/* Hero Section - Bears Film Room Style */}
      <section className="sm-show-hero">
        <div className="sm-container sm-hero-inner">
          <div className="sm-hero-text">
            <span className="sm-show-label" style={{ color: WHITESOX_SECONDARY }}>Southside Behavior</span>
            <h1 className="sm-hero-title">{truncateCaption(activeEmbed?.title || latestEmbed.title, 100)}</h1>
            <p className="sm-hero-meta">
              Latest TikTok from @southsidebehavior
            </p>
            <p className="sm-hero-description">
              Quick-hit TikToks from the South Side fan perspective. Catch the latest clips, reactions, and behind-the-scenes moments.
            </p>
          </div>

          <div className="sm-hero-video">
            <div className="sm-video-wrapper" style={{ aspectRatio: '9/16', maxWidth: '400px', margin: '0 auto' }}>
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: activeEmbed?.html || latestEmbed.html }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Previous Videos Section */}
      <section className="sm-show-previous">
        <div className="sm-container">
          <h2 className="sm-section-title">Recent TikToks</h2>
          <div className="sm-video-grid">
            {previousEmbeds.map((embed) => (
              <article key={embed.url} className="sm-video-card">
                <button
                  type="button"
                  className="sm-video-thumb-button"
                  onClick={() => setActiveEmbed(embed)}
                >
                  <div className="sm-video-thumb" style={{ aspectRatio: '9/16' }}>
                    <img
                      src={embed.thumbnailUrl}
                      alt={embed.title}
                      loading="lazy"
                    />
                    <span className="sm-video-play-icon">▶</span>
                  </div>
                </button>
                <div className="sm-video-info">
                  <h3 className="sm-video-title">{truncateCaption(embed.title, 80)}</h3>
                  <p className="sm-video-meta">@southsidebehavior</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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
            className="sm-cta-button"
            style={{ backgroundColor: WHITESOX_PRIMARY }}
          >
            Follow on TikTok
          </a>
        </div>
      </section>
    </main>
  );
}

// app/southside-behavior/SouthsideBehaviorClient.tsx
'use client';

import { useState } from 'react';
import type { TikTokEmbed } from '@/lib/tiktokTypes';
import { truncateCaption } from '@/lib/tiktokFormatters';

type Props = {
  latestEmbed: TikTokEmbed | null;
  previousEmbeds: TikTokEmbed[];
};

export function SouthsideBehaviorClient({ latestEmbed, previousEmbeds }: Props) {
  if (!latestEmbed) {
    return (
      <main className="sm-show-page sm-bears-film-room">
        <section className="relative overflow-hidden bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8">
                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] lg:aspect-[16/9] bg-zinc-800 flex items-center justify-center">
                  <p className="text-zinc-300 text-sm">
                    TikToks temporarily unavailable. Please check back soon.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="shrink-0 w-24 h-24 rounded-lg bg-zinc-800" />
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="h-3 w-24 bg-zinc-700 rounded" />
                    <div className="h-4 w-3/4 bg-zinc-700 rounded" />
                    <div className="h-4 w-1/2 bg-zinc-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [activeEmbedHtml, setActiveEmbedHtml] = useState(latestEmbed.html);

  return (
    <main className="sm-show-page sm-bears-film-room">
      {/* HERO SECTION – matches bears-film-room hero shell */}
      <section className="relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Hero embed */}
            <div className="lg:col-span-8">
              <div className="relative overflow-hidden rounded-2xl aspect-[9/16] lg:aspect-[9/16] bg-zinc-800 flex items-center justify-center">
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: activeEmbedHtml }}
                />
              </div>
            </div>

            {/* Hero right column – show meta/info similar to BFR */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={latestEmbed.thumbnailUrl}
                    alt={latestEmbed.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-400 font-semibold">
                    Southside Behavior
                  </p>
                  <h1 className="text-lg font-semibold text-white leading-snug">
                    {truncateCaption(latestEmbed.title, 90)}
                  </h1>
                  <p className="text-xs text-zinc-300">
                    Latest TikTok from @southsidebehavior
                  </p>
                </div>
              </div>

              {/* mini list using same card style as bears-film-room sidebar */}
              {previousEmbeds.slice(0, 2).map((embed) => (
                <button
                  key={embed.url}
                  type="button"
                  className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-colors"
                  onClick={() => setActiveEmbedHtml(embed.html)}
                >
                  <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-zinc-800">
                    <img
                      src={embed.thumbnailUrl}
                      alt={embed.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 font-semibold">
                      TikTok
                    </p>
                    <p className="text-sm font-medium text-white leading-snug">
                      {truncateCaption(embed.title, 80)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* tag chips row – mimic BFR chips row */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="h-10 px-4 inline-flex items-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-100">
              Southside Behavior
            </span>
            <span className="h-10 px-4 inline-flex items-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-100">
              TikTok
            </span>
            <span className="h-10 px-4 inline-flex items-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-100">
              Shorts
            </span>
          </div>
        </div>
      </section>

      {/* MAIN GRID – reuse bears-film-room structure */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* left: grid of cards, same style as BFR */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-8 bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 rounded-full" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Recent TikToks
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {previousEmbeds.map((embed) => (
                <article
                  key={embed.url}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    className="relative aspect-[9/16] bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
                    onClick={() => setActiveEmbedHtml(embed.html)}
                  >
                    <img
                      src={embed.thumbnailUrl}
                      alt={embed.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-white/10 text-white border border-white/20">
                        Watch TikTok
                      </span>
                    </div>
                  </button>

                  <div className="p-5 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400 font-semibold">
                      Southside Behavior
                    </p>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                      {truncateCaption(embed.title, 90)}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* right column – reuse BFR sidebar styles but adjust text */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                About Southside Behavior
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Southside Behavior delivers quick-hit TikToks from the South Side fan
                perspective. Catch the latest clips, reactions, and behind-the-scenes
                moments right here.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Follow on TikTok
              </h2>
              <a
                href="https://www.tiktok.com/@southsidebehavior"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold bg-black text-white hover:bg-zinc-800 transition-colors"
              >
                Open @southsidebehavior on TikTok
              </a>
            </div>
          </aside>
        </div>
      </main>
    </main>
  );
}

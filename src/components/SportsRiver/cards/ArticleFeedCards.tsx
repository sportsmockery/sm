'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ContentBlock } from '@/components/admin/BlockEditor/types';
import type { FeedItem } from '@/lib/article-feed-extractor';
import { BRAND } from '@/components/articles/PreviewPrimitives';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';

/* ─── Shared Feed Card Primitives ─── */

/** Card header — label + timestamp, reuses brand accent system */
function FeedCardHeader({ label, accent, timestamp }: { label: string; accent: string; timestamp?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
        {label}
      </span>
      {timestamp && (
        <span className="text-[11px]" style={{ color: 'var(--sm-text-meta, #A0A8B0)' }}>
          {timestamp}
        </span>
      )}
    </div>
  );
}

/** Link-back to full article */
function ReadMoreLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/${slug}`}
      className="text-[13px] font-bold mt-3 inline-flex items-center gap-1 min-h-[44px]"
      style={{ color: BRAND.cyan }}
    >
      Read Full Article &rarr;
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════
   1. ArticleCard — article summary with headline + excerpt
   ═══════════════════════════════════════════════════════ */

export const ArticleCard = React.memo(function ArticleCard({ item }: { item: FeedItem }) {
  const { meta } = item;

  return (
    <BaseGlassCard trackingToken={`article-${meta.slug}`} accentColor={BRAND.red}>
      <FeedCardHeader label={item.label} accent={item.accent} timestamp={meta.publishedAt} />

      {/* Featured image */}
      {meta.image && (
        <Link href={`/${meta.slug}`} className="block mb-3">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <Image src={meta.image} alt={meta.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 420px" />
          </div>
        </Link>
      )}

      {/* Headline */}
      <Link href={`/${meta.slug}`}>
        <h3 className="text-[20px] font-medium tracking-tight mb-2 line-clamp-3" style={{ color: BRAND.white }}>
          {meta.title}
        </h3>
      </Link>

      {/* Meta line */}
      <div className="flex items-center gap-2 text-[13px] mb-2" style={{ color: '#A0A8B0' }}>
        {meta.author && <span>By {meta.author}</span>}
        {meta.team && (
          <>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#A0A8B0' }} />
            <span className="capitalize">{meta.team}</span>
          </>
        )}
      </div>

      <CardActionButtons articleUrl={`/${item.meta.slug}`} />
    </BaseGlassCard>
  );
});

/* ═══════════════════════════════════════════════════════
   2. AnalyticsCard — charts, comparisons, scout insights, draft picks
   ═══════════════════════════════════════════════════════ */

function AnalyticsCardContent({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'scout-insight':
      return (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}
        >
          <p className="text-[15px] italic leading-relaxed" style={{ color: BRAND.white }}>
            &ldquo;{block.data.insight}&rdquo;
          </p>
          <span
            className="text-[10px] font-bold uppercase mt-2 inline-block px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${block.data.confidence === 'high' ? BRAND.cyan : block.data.confidence === 'medium' ? BRAND.gold : BRAND.red}15`,
              color: block.data.confidence === 'high' ? BRAND.cyan : block.data.confidence === 'medium' ? BRAND.gold : BRAND.red,
            }}
          >
            {block.data.confidence} confidence
          </span>
        </div>
      );

    case 'stats-chart':
      return (
        <div>
          <h4 className="text-[16px] font-medium mb-3" style={{ color: BRAND.white }}>{block.data.title}</h4>
          <div className="space-y-2">
            {block.data.dataPoints.slice(0, 4).map((dp) => {
              const max = Math.max(...block.data.dataPoints.map((d) => d.value)) * 1.1;
              return (
                <div key={dp.label}>
                  <div className="flex justify-between text-[12px] mb-0.5">
                    <span style={{ color: '#A0A8B0' }}>{dp.label}</span>
                    <span style={{ color: BRAND.white }}>{dp.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(dp.value / max) * 100}%`, backgroundColor: block.data.color || BRAND.cyan }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'player-comparison':
      return (
        <div className="flex items-center justify-between mb-2">
          <div className="text-center flex-1">
            <div className="text-[15px] font-medium" style={{ color: BRAND.white }}>{block.data.playerA.name}</div>
            <div className="text-[12px]" style={{ color: BRAND.cyan }}>{block.data.playerA.team}</div>
          </div>
          <div className="text-[12px] font-bold uppercase px-3" style={{ color: '#A0A8B0' }}>vs</div>
          <div className="text-center flex-1">
            <div className="text-[15px] font-medium" style={{ color: BRAND.white }}>{block.data.playerB.name}</div>
            <div className="text-[12px]" style={{ color: BRAND.red }}>{block.data.playerB.team}</div>
          </div>
        </div>
      );

    case 'mock-draft':
      return (
        <div className="space-y-2">
          {block.data.picks.slice(0, 3).map((pick, i) => (
            <div
              key={pick.pickNumber}
              className="flex items-center gap-3 rounded-lg p-2.5"
              style={{
                backgroundColor: i === 0 ? 'rgba(214,176,94,0.06)' : 'rgba(255,255,255,0.02)',
                border: i === 0 ? '1px solid rgba(214,176,94,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-[15px] font-bold w-6 text-center" style={{ color: i === 0 ? BRAND.gold : '#A0A8B0' }}>
                {pick.pickNumber}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate" style={{ color: BRAND.white }}>{pick.player}</div>
                <div className="text-[12px] truncate" style={{ color: '#A0A8B0' }}>{pick.team}</div>
              </div>
              <span className="text-[12px] font-bold shrink-0" style={{ color: BRAND.cyan }}>{pick.position}</span>
            </div>
          ))}
          {block.data.picks.length > 3 && (
            <span className="text-[12px]" style={{ color: '#A0A8B0' }}>
              +{block.data.picks.length - 3} more picks
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
}

export const AnalyticsCard = React.memo(function AnalyticsCard({ item }: { item: FeedItem }) {
  if (!item.block) return null;
  return (
    <BaseGlassCard trackingToken={item.id} accentColor={item.accent}>
      <FeedCardHeader label={item.label} accent={item.accent} />
      <AnalyticsCardContent block={item.block} />
      <ReadMoreLink slug={item.meta.slug} />
      <CardActionButtons articleUrl={`/${item.meta.slug}`} />
    </BaseGlassCard>
  );
});

/* ═══════════════════════════════════════════════════════
   3. DebateCard — PRO vs CON or hot takes
   ═══════════════════════════════════════════════════════ */

export const DebateCard = React.memo(function DebateCard({ item }: { item: FeedItem }) {
  if (!item.block) return null;

  if (item.block.type === 'hot-take') {
    return (
      <BaseGlassCard trackingToken={item.id} accentColor={BRAND.gold}>
        <FeedCardHeader label={item.label} accent={BRAND.gold} />
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: 'rgba(214,176,94,0.06)', border: '1px solid rgba(214,176,94,0.15)' }}
        >
          <p className="text-[16px] font-medium leading-relaxed" style={{ color: BRAND.white }}>
            {item.block.data.text}
          </p>
        </div>
        <ReadMoreLink slug={item.meta.slug} />
        <CardActionButtons articleUrl={`/${item.meta.slug}`} />
      </BaseGlassCard>
    );
  }

  if (item.block.type !== 'debate') return null;
  const { proArgument, conArgument } = item.block.data;

  return (
    <BaseGlassCard trackingToken={item.id} accentColor={BRAND.red}>
      <FeedCardHeader label={item.label} accent={BRAND.red} />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: BRAND.cyan }}>PRO</span>
          <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: BRAND.white }}>{proArgument}</p>
        </div>
        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(188,0,0,0.04)', border: '1px solid rgba(188,0,0,0.12)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: BRAND.red }}>CON</span>
          <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: BRAND.white }}>{conArgument}</p>
        </div>
      </div>

      <ReadMoreLink slug={item.meta.slug} />
      <CardActionButtons articleUrl={`/${item.meta.slug}`} />
    </BaseGlassCard>
  );
});

/* ═══════════════════════════════════════════════════════
   4. RumorCard — rumor meters, trade scenarios, breaking, heat
   ═══════════════════════════════════════════════════════ */

function RumorCardContent({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'rumor-meter': {
      const levels = ['Low', 'Medium', 'Strong', 'Heating Up'] as const;
      const activeIdx = levels.indexOf(block.data.strength);
      return (
        <div>
          <div className="flex gap-1 mb-2">
            {levels.map((l, i) => (
              <div key={l} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-2.5 rounded-full"
                  style={{ backgroundColor: i <= activeIdx ? BRAND.red : 'rgba(255,255,255,0.08)' }}
                />
                <span className="text-[9px] font-bold uppercase" style={{ color: i <= activeIdx ? BRAND.red : '#A0A8B0' }}>
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'heat-meter': {
      const levels = ['Warm', 'Hot', 'Nuclear'] as const;
      const activeIdx = levels.indexOf(block.data.level);
      return (
        <div className="flex gap-1 mb-2">
          {levels.map((l, i) => (
            <div key={l} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full h-3 rounded-full"
                style={{ backgroundColor: i <= activeIdx ? BRAND.red : 'rgba(255,255,255,0.08)' }}
              />
              <span className="text-[9px] font-bold uppercase" style={{ color: i <= activeIdx ? BRAND.red : '#A0A8B0' }}>
                {l}
              </span>
            </div>
          ))}
        </div>
      );
    }

    case 'trade-scenario':
      return (
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 text-center">
            <div className="text-[15px] font-medium" style={{ color: BRAND.white }}>{block.data.teamA}</div>
          </div>
          <span className="text-[12px] font-bold uppercase" style={{ color: '#A0A8B0' }}>Trade</span>
          <div className="flex-1 text-center">
            <div className="text-[15px] font-medium" style={{ color: BRAND.white }}>{block.data.teamB}</div>
          </div>
        </div>
      );

    case 'update':
      return (
        <div
          className="rounded-lg border-l-3 p-3"
          style={{ borderLeft: `3px solid ${BRAND.red}`, backgroundColor: 'rgba(188,0,0,0.04)' }}
        >
          {block.data.timestamp && (
            <span className="text-[12px] block mb-1" style={{ color: '#A0A8B0' }}>{block.data.timestamp}</span>
          )}
          <p className="text-[14px] leading-relaxed line-clamp-3" style={{ color: BRAND.white }}>{block.data.text}</p>
        </div>
      );

    default:
      return null;
  }
}

export const RumorCard = React.memo(function RumorCard({ item }: { item: FeedItem }) {
  if (!item.block) return null;
  return (
    <BaseGlassCard trackingToken={item.id} accentColor={BRAND.red}>
      <FeedCardHeader label={item.label} accent={BRAND.red} />
      <RumorCardContent block={item.block} />
      <ReadMoreLink slug={item.meta.slug} />
      <CardActionButtons articleUrl={`/${item.meta.slug}`} />
    </BaseGlassCard>
  );
});

/* ═══════════════════════════════════════════════════════
   5. FeedPollCard — polls and GM interactions
   ═══════════════════════════════════════════════════════ */

export const FeedPollCard = React.memo(function FeedPollCard({ item }: { item: FeedItem }) {
  if (!item.block) return null;

  // Both poll and gm-interaction have { question, options }
  const data = item.block.data as { question: string; options: string[]; reward?: number };

  return (
    <BaseGlassCard trackingToken={item.id} accentColor={BRAND.cyan}>
      <FeedCardHeader label={item.label} accent={BRAND.cyan} />

      <h3 className="text-[18px] font-medium mb-3" style={{ color: BRAND.white }}>
        {data.question}
      </h3>

      <div className="space-y-2">
        {data.options.map((option) => (
          <button
            key={option}
            type="button"
            className="w-full text-left rounded-lg px-4 py-3 transition-all min-h-[44px]"
            style={{
              backgroundColor: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.15)',
              color: BRAND.cyan,
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {data.reward && (
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.gold }} />
          <span className="text-[11px] font-bold" style={{ color: BRAND.gold }}>+{data.reward} GM Score</span>
        </div>
      )}

      <ReadMoreLink slug={item.meta.slug} />
      <CardActionButtons articleUrl={`/${item.meta.slug}`} />
    </BaseGlassCard>
  );
});

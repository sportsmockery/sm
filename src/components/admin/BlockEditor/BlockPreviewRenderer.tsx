'use client';

import React from 'react';
import Image from 'next/image';
import type { ContentBlock } from './types';
import { SENTIMENT_CONFIGS } from './types';

/* ─── Shared article components ─── */
import { ScoutInsight } from '@/components/articles/ScoutInsight';
import { GMInteraction } from '@/components/articles/GMInteraction';
import { TradeScenarioCard } from '@/components/articles/TradeScenarioCard';
import { PlayerComparison } from '@/components/articles/PlayerComparison';
import { StatsChart } from '@/components/articles/StatsChart';
import { DebateBlock as DebateBlockComponent } from '@/components/articles/DebateBlock';
import TwitterEmbed from '@/components/article/TwitterEmbed';

/* ─── Shared preview primitives (reusable in feed renderer) ─── */
import {
  BRAND,
  PreviewSection,
  EmptyState,
  ArticleMeta,
  ArticleBody,
  InsightBlock,
  PollBlock,
  ChartBlock,
  PlayerComparisonBlock,
  DraftPickBlock,
  PreviewDebateBlock,
  RumorConfidenceBlock,
  BreakingUpdateBlock,
  RumorBlock,
  TopTakeBlock,
} from '@/components/articles/PreviewPrimitives';

/* ─── Block Renderer ─── */

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
}

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    /* ─── Content ─── */
    case 'paragraph':
      if (!block.data.html) {
        return (
          <PreviewSection>
            <p className="text-[18px] leading-[1.7]" style={{ color: 'var(--sm-text, #0B0F14)' }}>
              <span className="text-slate-600 italic text-[16px]">Write your paragraph...</span>
            </p>
          </PreviewSection>
        );
      }
      return (
        <PreviewSection>
          <div
            className="text-[18px] leading-[1.7]"
            style={{ color: 'var(--sm-text, #0B0F14)' }}
            dangerouslySetInnerHTML={{ __html: block.data.html }}
            suppressHydrationWarning
          />
        </PreviewSection>
      );

    case 'heading': {
      const Tag = `h${block.data.level}` as 'h2' | 'h3' | 'h4';
      const sizes: Record<number, string> = { 2: 'text-[24px]', 3: 'text-[20px]', 4: 'text-[18px]' };
      if (!block.data.text) {
        return (
          <div className="mb-4 mt-8">
            <Tag className={`${sizes[block.data.level]} font-medium tracking-tight`} style={{ color: 'var(--sm-text, #0B0F14)' }}>
              <span className="text-slate-600 italic font-normal">Section heading...</span>
            </Tag>
          </div>
        );
      }
      return (
        <div className="mb-4 mt-8">
          <Tag
            className={`${sizes[block.data.level]} font-medium tracking-tight`}
            style={{ color: 'var(--sm-text, #0B0F14)' }}
            dangerouslySetInnerHTML={{ __html: block.data.text }}
            suppressHydrationWarning
          />
        </div>
      );
    }

    case 'image':
      if (!block.data.src) return <EmptyState label="Image — add a URL in the editor" />;
      return (
        <PreviewSection>
          <figure>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <Image src={block.data.src} alt={block.data.alt} fill className="object-cover" sizes="720px" />
            </div>
            {block.data.caption && (
              <figcaption className="text-[13px] text-slate-400 mt-2 text-center">{block.data.caption}</figcaption>
            )}
          </figure>
        </PreviewSection>
      );

    case 'video':
      if (!block.data.url) return <EmptyState label="Video — add an embed URL in the editor" />;
      return (
        <PreviewSection>
          <figure>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <iframe src={block.data.url} className="absolute inset-0 w-full h-full" allowFullScreen title="Video" />
            </div>
            {block.data.caption && (
              <figcaption className="text-[13px] text-slate-400 mt-2 text-center">{block.data.caption}</figcaption>
            )}
          </figure>
        </PreviewSection>
      );

    case 'quote':
      if (!block.data.text) return <EmptyState label="Quote — add quote text" />;
      return (
        <PreviewSection>
          <blockquote
            className="rounded-xl border-l-4 p-5 my-4"
            style={{
              borderLeftColor: BRAND.cyan,
              backgroundColor: 'rgba(0,212,255,0.03)',
            }}
          >
            <p className="text-[16px] leading-relaxed italic mb-3" style={{ color: 'var(--sm-text, #0B0F14)' }}>
              &ldquo;{block.data.text}&rdquo;
            </p>
            <footer className="flex items-center gap-2">
              <span className="text-[13px] font-medium" style={{ color: BRAND.cyan }}>
                — {block.data.speaker}
              </span>
              {block.data.team && (
                <span className="text-[12px] text-slate-500">{block.data.team}</span>
              )}
            </footer>
          </blockquote>
        </PreviewSection>
      );

    case 'social-embed':
      if (!block.data.url) return <EmptyState label="Social Embed — add a URL" />;
      if (block.data.platform === 'youtube') {
        const ytMatch = block.data.url.match(/(?:watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]+)/)
        const videoId = ytMatch?.[1]
        if (videoId) {
          return (
            <PreviewSection>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </PreviewSection>
          )
        }
      }
      if (block.data.platform === 'twitter') {
        const tweetIdMatch = block.data.url.match(/status\/(\d+)/)
        if (tweetIdMatch) {
          return (
            <PreviewSection>
              <div className="mx-auto" style={{ maxWidth: 550 }}>
                <TwitterEmbed tweetId={tweetIdMatch[1]} />
              </div>
            </PreviewSection>
          )
        }
      }
      return (
        <PreviewSection>
          <a
            href={block.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl p-4 flex items-center gap-3 bg-[rgba(11,15,20,0.03)] dark:bg-[rgba(255,255,255,0.04)] border border-[rgba(11,15,20,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(0,212,255,0.05)] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}
            >
              <span className="text-[12px] font-bold uppercase" style={{ color: BRAND.cyan }}>
                {block.data.platform === 'twitter' ? 'X' : block.data.platform === 'youtube' ? 'YT' : block.data.platform === 'tiktok' ? 'TT' : 'IG'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: BRAND.cyan }}>
                {block.data.platform} embed
              </span>
              <span className="text-[12px] truncate block" style={{ color: 'var(--sm-text-muted, #6b7280)' }}>{block.data.url}</span>
            </div>
          </a>
        </PreviewSection>
      );

    /* ─── Analysis (cyan) ─── */
    case 'scout-insight':
      if (!block.data.insight) return null;
      return (
        <InsightBlock>
          <ScoutInsight insight={block.data.insight} confidence={block.data.confidence} />
        </InsightBlock>
      );

    case 'stats-chart':
      if (block.data.dataPoints.length === 0) return <EmptyState label="Chart — add data points" accent={BRAND.cyan} />;
      return (
        <ChartBlock>
          <StatsChart title={block.data.title} data={block.data.dataPoints} type={block.data.chartType} color={block.data.color} />
        </ChartBlock>
      );

    case 'player-comparison':
      if (!block.data.playerA.name && !block.data.playerB.name) return <EmptyState label="Player Comparison — add players" accent={BRAND.cyan} />;
      return (
        <PlayerComparisonBlock>
          <PlayerComparison playerA={block.data.playerA} playerB={block.data.playerB} stats={block.data.stats} />
        </PlayerComparisonBlock>
      );

    case 'mock-draft':
      if (block.data.picks.length === 0) return <EmptyState label="Mock Draft — add draft picks" accent={BRAND.gold} />;
      return (
        <DraftPickBlock>
          <div className="space-y-2">
            {block.data.picks.map((pick, i) => (
              <div
                key={pick.pickNumber}
                className="rounded-lg p-3 flex items-center gap-4"
                style={{
                  backgroundColor: i === 0 ? 'rgba(214,176,94,0.06)' : 'rgba(0,0,0,0.03)',
                  border: i === 0 ? '1px solid rgba(214,176,94,0.15)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <span
                  className="text-lg font-bold w-8 text-center"
                  style={{ color: i === 0 ? BRAND.gold : '#A0A8B0' }}
                >
                  {pick.pickNumber}
                </span>
                <div className="flex-1">
                  <div className="text-[13px] text-slate-400 mb-0.5">{pick.team}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--sm-text, #0B0F14)' }}>{pick.player}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold" style={{ color: BRAND.cyan }}>{pick.position}</div>
                  <div className="text-[13px] text-slate-400">{pick.school}</div>
                </div>
              </div>
            ))}
          </div>
        </DraftPickBlock>
      );

    case 'trade-scenario':
      if (!block.data.teamA && !block.data.teamB) return <EmptyState label="Trade Scenario — set up both teams" accent={BRAND.red} />;
      return (
        <RumorBlock>
          <TradeScenarioCard
            teamA={block.data.teamA}
            teamB={block.data.teamB}
            teamALogo={block.data.teamALogo}
            teamBLogo={block.data.teamBLogo}
            teamAReceives={block.data.teamAReceives}
            teamBReceives={block.data.teamBReceives}
          />
        </RumorBlock>
      );

    /* ─── Sentiment Meter (unified rumor/heat/confidence/panic) ─── */
    case 'sentiment-meter': {
      const config = SENTIMENT_CONFIGS[block.data.mode];
      const segments = config.segments;
      const activeLevel = block.data.level;
      return (
        <RumorConfidenceBlock label={config.label}>
          <div className="flex gap-1">
            {segments.map((seg, i) => (
              <div key={seg} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-2.5 rounded-full transition-all"
                  style={{ backgroundColor: i < activeLevel ? BRAND.red : 'rgba(0,0,0,0.08)' }}
                />
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: i < activeLevel ? BRAND.red : '#A0A8B0' }}
                >
                  {seg}
                </span>
              </div>
            ))}
          </div>
        </RumorConfidenceBlock>
      );
    }

    /* ─── Fan Interaction ─── */
    case 'interaction':
      if (!block.data.question) return <EmptyState label={`${block.data.variant === 'gm-pulse' ? 'GM Pulse' : 'Fan Poll'} — add a question`} accent={BRAND.cyan} />;
      return (
        <PollBlock variant={block.data.variant === 'gm-pulse' ? 'gm-decision' : 'binary'}>
          <GMInteraction
            question={block.data.question}
            options={block.data.options}
            reward={block.data.reward}
            showHeader={false}
          />
        </PollBlock>
      );

    case 'debate':
      if (!block.data.proArgument && !block.data.conArgument) return <EmptyState label="Debate — add PRO and CON arguments" accent={BRAND.red} />;
      return (
        <PreviewDebateBlock>
          <DebateBlockComponent proArgument={block.data.proArgument} conArgument={block.data.conArgument} reward={block.data.reward} />
        </PreviewDebateBlock>
      );

    case 'hot-take':
      if (!block.data.text) return <EmptyState label="Hot Take — add your bold claim" accent={BRAND.gold} />;
      return (
        <TopTakeBlock>
          <p className="text-[16px] font-medium leading-relaxed" style={{ color: 'var(--sm-text, #0B0F14)' }}>{block.data.text}</p>
        </TopTakeBlock>
      );

    case 'update':
      if (!block.data.text) return <EmptyState label="Breaking Update — add update text" accent={BRAND.red} />;
      return (
        <BreakingUpdateBlock>
          {block.data.timestamp && (
            <span className="text-[13px] text-slate-400 mb-1 block">{block.data.timestamp}</span>
          )}
          <div className="text-sm leading-relaxed" style={{ color: 'var(--sm-text, #0B0F14)' }} dangerouslySetInnerHTML={{ __html: block.data.text }} suppressHydrationWarning />
        </BreakingUpdateBlock>
      );

    /* ─── Editorial Structure (human-written) ─── */
    case 'tldr':
      if (!block.data.html) {
        return <EmptyState label="TL;DR — add a one-paragraph summary" accent={BRAND.cyan} />;
      }
      return (
        <aside
          className="rounded-md border-l-4 p-4 my-4"
          style={{ borderLeftColor: BRAND.cyan, backgroundColor: 'rgba(0,212,255,0.06)' }}
        >
          <p className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: BRAND.cyan }}>
            TL;DR
          </p>
          <div className="text-[16px] leading-relaxed" style={{ color: 'var(--sm-text, #0B0F14)' }} dangerouslySetInnerHTML={{ __html: block.data.html }} suppressHydrationWarning />
        </aside>
      );

    case 'key-facts':
      if (!block.data.html) {
        return <EmptyState label="Key Facts — add a bullet list" accent={BRAND.cyan} />;
      }
      return (
        <section className="my-6">
          <h3 className="text-[14px] uppercase tracking-wider font-bold mb-3" style={{ color: 'var(--sm-text, #0B0F14)' }}>
            Key Facts
          </h3>
          <div className="text-[16px] leading-relaxed prose-sm" style={{ color: 'var(--sm-text, #0B0F14)' }} dangerouslySetInnerHTML={{ __html: block.data.html }} suppressHydrationWarning />
        </section>
      );

    case 'why-it-matters':
      if (!block.data.html) {
        return <EmptyState label="Why It Matters — explain the significance" accent={BRAND.red} />;
      }
      return (
        <section className="my-6">
          <h3 className="text-[14px] uppercase tracking-wider font-bold mb-3" style={{ color: BRAND.red }}>
            Why It Matters
          </h3>
          <div className="text-[16px] leading-relaxed" style={{ color: 'var(--sm-text, #0B0F14)' }} dangerouslySetInnerHTML={{ __html: block.data.html }} suppressHydrationWarning />
        </section>
      );

    case 'whats-next':
      if (!block.data.html) {
        return <EmptyState label="What's Next — what to watch for" accent={BRAND.cyan} />;
      }
      return (
        <section className="my-6">
          <h3 className="text-[14px] uppercase tracking-wider font-bold mb-3" style={{ color: 'var(--sm-text, #0B0F14)' }}>
            What&apos;s Next
          </h3>
          <div className="text-[16px] leading-relaxed" style={{ color: 'var(--sm-text, #0B0F14)' }} dangerouslySetInnerHTML={{ __html: block.data.html }} suppressHydrationWarning />
        </section>
      );

    case 'analysis':
      if (!block.data.html) {
        return <EmptyState label="Analysis — your original take" accent={BRAND.red} />;
      }
      return (
        <aside
          aria-label="Original analysis"
          data-sm-section="analysis"
          className="rounded-md border-l-4 p-4 my-6 bg-[rgba(11,15,20,0.03)] dark:bg-[rgba(255,255,255,0.04)]"
          style={{ borderLeftColor: BRAND.red }}
        >
          <p className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: BRAND.red }}>
            Analysis
          </p>
          <div
            className="text-[16px] leading-relaxed"
            style={{ color: 'var(--sm-text, #0B0F14)' }}
            dangerouslySetInnerHTML={{ __html: block.data.html }}
            suppressHydrationWarning
          />
        </aside>
      );

    /* ─── Scout AI (visibly labeled — never article body) ─── */
    case 'scout-summary':
      if (!block.data.html) {
        return <EmptyState label="Scout Summary — paste the AI-generated summary" accent={BRAND.cyan} />;
      }
      return (
        <aside
          aria-label="AI-generated summary"
          data-ai-generated="summary"
          className="rounded-md border-l-4 p-4 my-4"
          style={{ borderLeftColor: BRAND.red, backgroundColor: 'rgba(0,0,0,0.03)' }}
        >
          <p className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--sm-text-dim, #6B7280)' }}>
            Summary · AI-generated by Scout
          </p>
          <div className="text-[16px] leading-relaxed" style={{ color: 'var(--sm-text-muted, #374151)' }} dangerouslySetInnerHTML={{ __html: block.data.html }} suppressHydrationWarning />
        </aside>
      );

    case 'scout-recap':
      if (!block.data.html) {
        return <EmptyState label="Scout Recap — paste the AI-generated recap" accent={BRAND.cyan} />;
      }
      return (
        <aside
          aria-label="AI-generated recap"
          data-ai-generated="recap"
          className="rounded-md border p-4 mt-8"
          style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.03)' }}
        >
          <p className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--sm-text-dim, #6B7280)' }}>
            Recap · AI-generated by Scout
          </p>
          <div className="text-[16px] leading-relaxed" style={{ color: 'var(--sm-text-muted, #374151)' }} dangerouslySetInnerHTML={{ __html: block.data.html }} suppressHydrationWarning />
        </aside>
      );

    /* ─── Utility ─── */
    case 'divider':
      return <hr className="my-8 border-0 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />;

    /* ─── Legacy blocks (should be migrated, but render gracefully) ─── */
    case 'gm-interaction':
      if (!block.data.question) return <EmptyState label="GM Pulse — add a question" accent={BRAND.cyan} />;
      return (
        <PollBlock variant="gm-decision">
          <GMInteraction
            question={block.data.question}
            options={block.data.options}
            reward={block.data.reward}
            showHeader={false}
          />
        </PollBlock>
      );

    case 'poll':
      if (!block.data.question) return <EmptyState label="Fan Poll — add a question" accent={BRAND.cyan} />;
      return (
        <PollBlock variant="binary">
          <GMInteraction
            question={block.data.question}
            options={block.data.options}
            reward={block.data.reward}
            showHeader={false}
          />
        </PollBlock>
      );

    case 'rumor-meter': {
      const levels = ['Low', 'Medium', 'Strong', 'Heating Up'] as const;
      const activeIdx = levels.indexOf(block.data.strength);
      return (
        <RumorConfidenceBlock>
          <div className="flex gap-1">
            {levels.map((l, i) => (
              <div key={l} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-2.5 rounded-full transition-all"
                  style={{ backgroundColor: i <= activeIdx ? BRAND.red : 'rgba(0,0,0,0.08)' }}
                />
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: i <= activeIdx ? BRAND.red : '#A0A8B0' }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
        </RumorConfidenceBlock>
      );
    }

    case 'heat-meter': {
      const levels = ['Warm', 'Hot', 'Nuclear'] as const;
      const activeIdx = levels.indexOf(block.data.level);
      return (
        <RumorConfidenceBlock label="Heat Meter">
          <div className="flex gap-1">
            {levels.map((l, i) => (
              <div key={l} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-3 rounded-full transition-all"
                  style={{ backgroundColor: i <= activeIdx ? BRAND.red : 'rgba(0,0,0,0.08)' }}
                />
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: i <= activeIdx ? BRAND.red : '#A0A8B0' }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
        </RumorConfidenceBlock>
      );
    }

    case 'reaction-stream':
      return (
        <PreviewSection>
          <div
            className="rounded-xl px-5 py-4 flex items-center gap-3"
            style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.08)' }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#64748b', opacity: 0.5 }} />
            <span className="text-[13px] text-slate-500">Reaction Stream — platform managed</span>
          </div>
        </PreviewSection>
      );

    default:
      return null;
  }
}

export function BlockPreviewRenderer({ blocks }: BlockPreviewRendererProps) {
  return (
    <article>
      <ArticleBody>
        {blocks.map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </ArticleBody>
    </article>
  );
}

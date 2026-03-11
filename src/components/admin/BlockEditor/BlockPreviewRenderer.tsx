'use client';

import React from 'react';
import Image from 'next/image';
import type { ContentBlock } from './types';
import { ScoutInsight } from '@/components/articles/ScoutInsight';
import { GMInteraction } from '@/components/articles/GMInteraction';
import { TradeScenarioCard } from '@/components/articles/TradeScenarioCard';
import { PlayerComparison } from '@/components/articles/PlayerComparison';
import { StatsChart } from '@/components/articles/StatsChart';
import { DebateBlock as DebateBlockComponent } from '@/components/articles/DebateBlock';
import { UpdateBlock as UpdateBlockComponent } from '@/components/articles/UpdateBlock';
import { ReactionStream } from '@/components/articles/ReactionStream';

/* ─── Brand palette ─── */
const BRAND = {
  black: '#0B0F14',
  white: '#FAFAFB',
  red: '#BC0000',
  cyan: '#00D4FF',
  gold: '#D6B05E',
} as const;

/* ─── Shared Preview Primitives ─── */

/** Consistent empty-state placeholder used by all block types */
function EmptyState({ label, accent = '#A0A8B0' }: { label: string; accent?: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center gap-3"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.10)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: accent, opacity: 0.5 }}
      />
      <span className="text-[13px] text-slate-500">{label}</span>
    </div>
  );
}

/** Wrapper for preview sections — applies consistent vertical rhythm */
function PreviewSection({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

/** InsightBlock — cyan intelligence wrapper for Scout-derived content */
function InsightBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/** PollBlock — interactive engagement wrapper (GM Pulse, Fan Poll) */
function PollBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/** ChartBlock — data/analytics wrapper (stats charts, comparisons) */
function ChartBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/** DebateBlock — tension/conflict wrapper (PRO vs CON) */
function PreviewDebateBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/** RumorBlock — breaking/urgency wrapper (rumor meter, trade scenario, heat) */
function RumorBlock({ children }: { children: React.ReactNode }) {
  return <PreviewSection>{children}</PreviewSection>;
}

/* ─── Article Container Structure ─── */

/** ArticleMeta — displayed above article body in preview */
function ArticleMeta() {
  return (
    <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.cyan }} />
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.cyan }}>SM Edge</span>
      <span className="text-[11px] text-slate-600 ml-auto">Draft Preview</span>
    </div>
  );
}

/** ArticleBody — main body column wrapper */
function ArticleBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[720px] mx-auto">
      {children}
    </div>
  );
}

/* ─── Block Renderer ─── */

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
}

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    /* ─── Text ─── */
    case 'paragraph':
      return (
        <PreviewSection>
          <p className="text-[18px] leading-[1.7]" style={{ color: BRAND.white }}>
            {block.data.html || <span className="text-slate-600 italic text-[16px]">Write your paragraph...</span>}
          </p>
        </PreviewSection>
      );

    case 'heading': {
      const Tag = `h${block.data.level}` as 'h2' | 'h3' | 'h4';
      const sizes: Record<number, string> = { 2: 'text-[24px]', 3: 'text-[20px]', 4: 'text-[18px]' };
      return (
        <div className="mb-4 mt-8">
          <Tag className={`${sizes[block.data.level]} font-medium tracking-tight`} style={{ color: BRAND.white }}>
            {block.data.text || <span className="text-slate-600 italic font-normal">Section heading...</span>}
          </Tag>
        </div>
      );
    }

    case 'image':
      if (!block.data.src) return <PreviewSection><EmptyState label="Image — add a URL in the editor" /></PreviewSection>;
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
      if (!block.data.url) return <PreviewSection><EmptyState label="Video — add an embed URL in the editor" /></PreviewSection>;
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

    /* ─── Intelligence (cyan) ─── */
    case 'scout-insight':
      if (!block.data.insight) return <PreviewSection><EmptyState label="Scout Insight — add analysis text" accent={BRAND.cyan} /></PreviewSection>;
      return <InsightBlock><ScoutInsight insight={block.data.insight} confidence={block.data.confidence} /></InsightBlock>;

    case 'gm-interaction':
      if (!block.data.question) return <PreviewSection><EmptyState label="GM Pulse — add a question" accent={BRAND.cyan} /></PreviewSection>;
      return <PollBlock><GMInteraction question={block.data.question} options={block.data.options} reward={block.data.reward} /></PollBlock>;

    case 'poll':
      if (!block.data.question) return <PreviewSection><EmptyState label="Fan Poll — add a question" accent={BRAND.cyan} /></PreviewSection>;
      return <PollBlock><GMInteraction question={block.data.question} options={block.data.options} reward={block.data.reward} /></PollBlock>;

    /* ─── GM & Roster (cyan for data, red for trades) ─── */
    case 'player-comparison':
      if (!block.data.playerA.name && !block.data.playerB.name) return <PreviewSection><EmptyState label="Player Comparison — add players" accent={BRAND.cyan} /></PreviewSection>;
      return (
        <ChartBlock>
          <PlayerComparison playerA={block.data.playerA} playerB={block.data.playerB} stats={block.data.stats} />
        </ChartBlock>
      );

    case 'stats-chart':
      if (block.data.dataPoints.length === 0) return <PreviewSection><EmptyState label="Chart — add data points" accent={BRAND.cyan} /></PreviewSection>;
      return (
        <ChartBlock>
          <StatsChart title={block.data.title} data={block.data.dataPoints} type={block.data.chartType} color={block.data.color} />
        </ChartBlock>
      );

    case 'trade-scenario':
      if (!block.data.teamA && !block.data.teamB) return <PreviewSection><EmptyState label="Trade Scenario — set up both teams" accent={BRAND.red} /></PreviewSection>;
      return (
        <RumorBlock>
          <TradeScenarioCard
            teamA={block.data.teamA}
            teamB={block.data.teamB}
            teamAReceives={block.data.teamAReceives}
            teamBReceives={block.data.teamBReceives}
          />
        </RumorBlock>
      );

    case 'mock-draft':
      if (block.data.picks.length === 0) return <PreviewSection><EmptyState label="Mock Draft — add draft picks" accent={BRAND.cyan} /></PreviewSection>;
      return (
        <ChartBlock>
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Mock Draft</h3>
            {block.data.picks.map((pick, i) => (
              <div
                key={pick.pickNumber}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span
                  className="text-lg font-bold w-8 text-center"
                  style={{ color: i === 0 ? BRAND.gold : '#A0A8B0' }}
                >
                  {pick.pickNumber}
                </span>
                <div className="flex-1">
                  <div className="text-[13px] text-slate-400 mb-0.5">{pick.team}</div>
                  <div className="text-sm font-medium" style={{ color: BRAND.white }}>{pick.player}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold" style={{ color: BRAND.cyan }}>{pick.position}</div>
                  <div className="text-[13px] text-slate-400">{pick.school}</div>
                </div>
              </div>
            ))}
          </div>
        </ChartBlock>
      );

    /* ─── Engagement (red for urgency, gold for premium takes) ─── */
    case 'debate':
      if (!block.data.proArgument && !block.data.conArgument) return <PreviewSection><EmptyState label="Debate — add PRO and CON arguments" accent={BRAND.red} /></PreviewSection>;
      return <PreviewDebateBlock><DebateBlockComponent proArgument={block.data.proArgument} conArgument={block.data.conArgument} reward={block.data.reward} /></PreviewDebateBlock>;

    case 'update':
      if (!block.data.text) return <PreviewSection><EmptyState label="Breaking Update — add update text" accent={BRAND.red} /></PreviewSection>;
      return <RumorBlock><UpdateBlockComponent timestamp={block.data.timestamp} text={block.data.text} /></RumorBlock>;

    case 'reaction-stream':
      if (block.data.reactions.length === 0) return <PreviewSection><EmptyState label="Reaction Stream — add fan reactions" accent={BRAND.cyan} /></PreviewSection>;
      return <PreviewSection><ReactionStream reactions={block.data.reactions} /></PreviewSection>;

    case 'hot-take':
      if (!block.data.text) return <PreviewSection><EmptyState label="Hot Take — add your bold claim" accent={BRAND.gold} /></PreviewSection>;
      return (
        <PreviewSection>
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'rgba(214,176,94,0.06)', border: '1px solid rgba(214,176,94,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.gold }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.gold }}>Top Take</span>
            </div>
            <p className="text-[16px] font-medium leading-relaxed" style={{ color: BRAND.white }}>{block.data.text}</p>
          </div>
        </PreviewSection>
      );

    case 'rumor-meter': {
      const levels = ['Low', 'Medium', 'Strong', 'Heating Up'] as const;
      const activeIdx = levels.indexOf(block.data.strength);
      return (
        <RumorBlock>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Rumor Confidence</span>
            <div className="flex gap-1">
              {levels.map((l, i) => (
                <div key={l} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: i <= activeIdx ? BRAND.red : 'rgba(255,255,255,0.1)' }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: i <= activeIdx ? BRAND.red : '#A0A8B0' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </RumorBlock>
      );
    }

    case 'heat-meter': {
      const levels = ['Warm', 'Hot', 'Nuclear'] as const;
      const activeIdx = levels.indexOf(block.data.level);
      return (
        <RumorBlock>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Heat Meter</span>
            <div className="flex gap-1">
              {levels.map((l, i) => (
                <div key={l} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-3 rounded-full" style={{ backgroundColor: i <= activeIdx ? BRAND.red : 'rgba(255,255,255,0.1)' }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: i <= activeIdx ? BRAND.red : '#A0A8B0' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </RumorBlock>
      );
    }

    case 'divider':
      return <hr className="my-8 border-0 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />;

    default:
      return null;
  }
}

export function BlockPreviewRenderer({ blocks }: BlockPreviewRendererProps) {
  return (
    <article>
      <ArticleMeta />
      <ArticleBody>
        {blocks.map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </ArticleBody>
    </article>
  );
}

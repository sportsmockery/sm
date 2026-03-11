'use client';

import React from 'react';
import Image from 'next/image';
import type { ContentBlock } from './types';

/* ─── Shared article components ─── */
import { ScoutInsight } from '@/components/articles/ScoutInsight';
import { GMInteraction } from '@/components/articles/GMInteraction';
import { TradeScenarioCard } from '@/components/articles/TradeScenarioCard';
import { PlayerComparison } from '@/components/articles/PlayerComparison';
import { StatsChart } from '@/components/articles/StatsChart';
import { DebateBlock as DebateBlockComponent } from '@/components/articles/DebateBlock';
import { UpdateBlock as UpdateBlockComponent } from '@/components/articles/UpdateBlock';
import { ReactionStream } from '@/components/articles/ReactionStream';

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

    /* ─── Intelligence (cyan) ─── */
    case 'scout-insight':
      if (block.data.autoGenerate !== false && !block.data.insight) {
        return (
          <InsightBlock>
            <div className="flex items-center gap-3 py-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,212,255,0.15)' }}>
                <span style={{ color: '#00D4FF', fontSize: 14 }}>&#10024;</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest block" style={{ color: '#00D4FF' }}>Scout AI Insight</span>
                <span className="text-[11px] text-slate-500">Will be auto-generated when published</span>
              </div>
            </div>
          </InsightBlock>
        );
      }
      if (!block.data.insight) return <EmptyState label="Scout Insight — add analysis text" accent={BRAND.cyan} />;
      return (
        <InsightBlock>
          <ScoutInsight insight={block.data.insight} confidence={block.data.confidence} />
        </InsightBlock>
      );

    /* ─── Polls & Engagement (cyan / gold for predictions) ─── */
    case 'gm-interaction':
      if (!block.data.question) return <EmptyState label="GM Pulse — add a question" accent={BRAND.cyan} />;
      return (
        <PollBlock variant="gm-decision">
          <GMInteraction question={block.data.question} options={block.data.options} reward={block.data.reward} />
        </PollBlock>
      );

    case 'poll':
      if (!block.data.question) return <EmptyState label="Fan Poll — add a question" accent={BRAND.cyan} />;
      return (
        <PollBlock variant={block.data.options.length > 2 ? 'multi' : 'binary'}>
          <GMInteraction question={block.data.question} options={block.data.options} reward={block.data.reward} />
        </PollBlock>
      );

    /* ─── Charts & Analytics (cyan) ─── */
    case 'stats-chart':
      if (block.data.dataPoints.length === 0) return <EmptyState label="Chart — add data points" accent={BRAND.cyan} />;
      return (
        <ChartBlock>
          <StatsChart title={block.data.title} data={block.data.dataPoints} type={block.data.chartType} color={block.data.color} />
        </ChartBlock>
      );

    /* ─── Player Comparison (cyan) ─── */
    case 'player-comparison':
      if (!block.data.playerA.name && !block.data.playerB.name) return <EmptyState label="Player Comparison — add players" accent={BRAND.cyan} />;
      return (
        <PlayerComparisonBlock>
          <PlayerComparison playerA={block.data.playerA} playerB={block.data.playerB} stats={block.data.stats} />
        </PlayerComparisonBlock>
      );

    /* ─── Draft Picks (gold / cyan) ─── */
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
                  <div className="text-sm font-medium" style={{ color: BRAND.white }}>{pick.player}</div>
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

    /* ─── Trades & Rumors (red) ─── */
    case 'trade-scenario':
      if (!block.data.teamA && !block.data.teamB) return <EmptyState label="Trade Scenario — set up both teams" accent={BRAND.red} />;
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

    /* ─── Breaking Updates (red — editorial callout) ─── */
    case 'update':
      if (!block.data.text) return <EmptyState label="Breaking Update — add update text" accent={BRAND.red} />;
      return (
        <BreakingUpdateBlock>
          {block.data.timestamp && (
            <span className="text-[13px] text-slate-400 mb-1 block">{block.data.timestamp}</span>
          )}
          <p className="text-sm leading-relaxed" style={{ color: BRAND.white }}>{block.data.text}</p>
        </BreakingUpdateBlock>
      );

    /* ─── Heat Meter (red) ─── */
    case 'heat-meter': {
      const levels = ['Warm', 'Hot', 'Nuclear'] as const;
      const activeIdx = levels.indexOf(block.data.level);
      return (
        <RumorConfidenceBlock>
          <div className="flex items-center gap-2 mb-3 -mt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.red }}>
              Heat Meter
            </span>
          </div>
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

    /* ─── Debate (red) ─── */
    case 'debate':
      if (!block.data.proArgument && !block.data.conArgument) return <EmptyState label="Debate — add PRO and CON arguments" accent={BRAND.red} />;
      return (
        <PreviewDebateBlock>
          <DebateBlockComponent proArgument={block.data.proArgument} conArgument={block.data.conArgument} reward={block.data.reward} />
        </PreviewDebateBlock>
      );

    /* ─── Engagement ─── */
    case 'reaction-stream': {
      const rsEnabled = block.data.enabled;
      const rsPreview = block.data.previewItems ?? [];
      const rsAvailable = (block.data.availableCount ?? 0) > 0;
      const rsMaxItems = block.data.maxItems ?? 5;

      // Disabled state
      if (!rsEnabled) {
        return (
          <PreviewSection>
            <div
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.08)' }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#64748b', opacity: 0.5 }} />
              <span className="text-[13px] text-slate-500">Reaction Stream — disabled</span>
            </div>
          </PreviewSection>
        );
      }

      // Enabled with preview data available
      if (rsPreview.length > 0) {
        return (
          <PreviewSection>
            <ReactionStream reactions={rsPreview.slice(0, rsMaxItems)} />
          </PreviewSection>
        );
      }

      // Enabled with known available reactions but no preview items loaded
      if (rsAvailable) {
        return (
          <PreviewSection>
            <div
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BRAND.cyan }} />
              <div>
                <span className="text-[13px] font-medium" style={{ color: BRAND.cyan }}>Reaction Stream</span>
                <span className="text-[12px] text-slate-500 block">
                  {block.data.availableCount} reactions available — will render on publish.
                </span>
              </div>
            </div>
          </PreviewSection>
        );
      }

      // Enabled but no reactions available yet
      return (
        <PreviewSection>
          <div
            className="rounded-xl px-5 py-4 flex items-center gap-3"
            style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.08)' }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#64748b', opacity: 0.5 }} />
            <div>
              <span className="text-[13px] text-slate-400">Reaction Stream</span>
              <span className="text-[12px] text-slate-500 block">
                Will appear when fan reactions are available.
              </span>
            </div>
          </div>
        </PreviewSection>
      );
    }

    /* ─── Premium / Gold ─── */
    case 'hot-take':
      if (!block.data.text) return <EmptyState label="Hot Take — add your bold claim" accent={BRAND.gold} />;
      return (
        <TopTakeBlock>
          <p className="text-[16px] font-medium leading-relaxed" style={{ color: BRAND.white }}>{block.data.text}</p>
        </TopTakeBlock>
      );

    /* ─── Utility ─── */
    case 'divider':
      return <hr className="my-8 border-0 h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />;

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

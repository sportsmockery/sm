'use client';

import React from 'react';
import Image from 'next/image';
import type { ContentBlock } from './types';
import { ScoutInsight } from '@/components/articles/ScoutInsight';
import { GMInteraction } from '@/components/articles/GMInteraction';
import { TradeScenarioCard } from '@/components/articles/TradeScenarioCard';
import { PlayerComparison } from '@/components/articles/PlayerComparison';
import { StatsChart } from '@/components/articles/StatsChart';
import { DebateBlock } from '@/components/articles/DebateBlock';
import { UpdateBlock } from '@/components/articles/UpdateBlock';
import { ReactionStream } from '@/components/articles/ReactionStream';

interface BlockPreviewRendererProps {
  blocks: ContentBlock[];
}

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[18px] leading-7 text-white mb-5">
          {block.data.html || <span className="text-slate-600 italic">Empty paragraph...</span>}
        </p>
      );

    case 'heading': {
      const Tag = `h${block.data.level}` as 'h2' | 'h3' | 'h4';
      const sizes = { 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' };
      return (
        <Tag className={`${sizes[block.data.level]} font-extrabold tracking-tight text-white mb-4`}>
          {block.data.text || <span className="text-slate-600 italic">Empty heading...</span>}
        </Tag>
      );
    }

    case 'image':
      if (!block.data.src) {
        return (
          <div className="w-full aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
            <span className="text-slate-600 text-sm">No image set</span>
          </div>
        );
      }
      return (
        <figure className="mb-5">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image src={block.data.src} alt={block.data.alt} fill className="object-cover" sizes="720px" />
          </div>
          {block.data.caption && (
            <figcaption className="text-xs text-slate-400 mt-2 text-center">{block.data.caption}</figcaption>
          )}
        </figure>
      );

    case 'video':
      if (!block.data.url) {
        return (
          <div className="w-full aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
            <span className="text-slate-600 text-sm">No video URL</span>
          </div>
        );
      }
      return (
        <figure className="mb-5">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <iframe src={block.data.url} className="absolute inset-0 w-full h-full" allowFullScreen title="Video" />
          </div>
          {block.data.caption && (
            <figcaption className="text-xs text-slate-400 mt-2 text-center">{block.data.caption}</figcaption>
          )}
        </figure>
      );

    case 'scout-insight':
      if (!block.data.insight) return <div className="text-slate-600 text-sm italic mb-5">Scout Insight — no content</div>;
      return <ScoutInsight insight={block.data.insight} confidence={block.data.confidence} />;

    case 'gm-interaction':
      if (!block.data.question) return <div className="text-slate-600 text-sm italic mb-5">GM Pulse — no question</div>;
      return <GMInteraction question={block.data.question} options={block.data.options} reward={block.data.reward} />;

    case 'trade-scenario':
      if (!block.data.teamA && !block.data.teamB) return <div className="text-slate-600 text-sm italic mb-5">Trade Scenario — no teams</div>;
      return (
        <TradeScenarioCard
          teamA={block.data.teamA}
          teamB={block.data.teamB}
          teamAReceives={block.data.teamAReceives}
          teamBReceives={block.data.teamBReceives}
        />
      );

    case 'player-comparison':
      if (!block.data.playerA.name && !block.data.playerB.name) return <div className="text-slate-600 text-sm italic mb-5">Player Comparison — no players</div>;
      return (
        <PlayerComparison
          playerA={block.data.playerA}
          playerB={block.data.playerB}
          stats={block.data.stats}
        />
      );

    case 'stats-chart':
      if (block.data.dataPoints.length === 0) return <div className="text-slate-600 text-sm italic mb-5">Stats Chart — no data</div>;
      return (
        <StatsChart
          title={block.data.title}
          data={block.data.dataPoints}
          type={block.data.chartType}
          color={block.data.color}
        />
      );

    case 'debate':
      if (!block.data.proArgument && !block.data.conArgument) return <div className="text-slate-600 text-sm italic mb-5">Debate — no arguments</div>;
      return <DebateBlock proArgument={block.data.proArgument} conArgument={block.data.conArgument} reward={block.data.reward} />;

    case 'update':
      if (!block.data.text) return <div className="text-slate-600 text-sm italic mb-5">Update — no text</div>;
      return <UpdateBlock timestamp={block.data.timestamp} text={block.data.text} />;

    case 'reaction-stream':
      if (block.data.reactions.length === 0) return <div className="text-slate-600 text-sm italic mb-5">Reactions — none added</div>;
      return <ReactionStream reactions={block.data.reactions} />;

    case 'poll':
      if (!block.data.question) return <div className="text-slate-600 text-sm italic mb-5">Poll — no question</div>;
      return <GMInteraction question={block.data.question} options={block.data.options} reward={block.data.reward} />;

    case 'hot-take':
      if (!block.data.text) return <div className="text-slate-600 text-sm italic mb-5">Hot Take — no text</div>;
      return (
        <div
          className="rounded-xl p-5 my-8"
          style={{ backgroundColor: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.2)' }}
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: '#FF6A00' }}>Hot Take</span>
          <p className="text-[16px] text-white font-medium leading-relaxed">{block.data.text}</p>
        </div>
      );

    case 'rumor-meter': {
      const levels = ['Low', 'Medium', 'Strong', 'Heating Up'] as const;
      const activeIdx = levels.indexOf(block.data.strength);
      return (
        <div className="my-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Rumor Strength</span>
          <div className="flex gap-1">
            {levels.map((l, i) => (
              <div key={l} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: i <= activeIdx ? '#FF6A00' : 'rgba(255,255,255,0.1)' }} />
                <span className="text-[10px] font-bold uppercase" style={{ color: i <= activeIdx ? '#FF6A00' : '#A0A8B0' }}>{l}</span>
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
        <div className="my-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Heat Meter</span>
          <div className="flex gap-1">
            {levels.map((l, i) => (
              <div key={l} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: i <= activeIdx ? '#FF6A00' : 'rgba(255,255,255,0.1)' }} />
                <span className="text-[10px] font-bold uppercase" style={{ color: i <= activeIdx ? '#FF6A00' : '#A0A8B0' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'mock-draft':
      if (block.data.picks.length === 0) return <div className="text-slate-600 text-sm italic mb-5">Mock Draft — no picks</div>;
      return (
        <div className="my-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Mock Draft</h3>
          {block.data.picks.map((pick) => (
            <div
              key={pick.pickNumber}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-lg font-extrabold text-slate-500 w-8 text-center">{pick.pickNumber}</span>
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-0.5">{pick.team}</div>
                <div className="text-sm font-bold text-white">{pick.player}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: '#00D4FF' }}>{pick.position}</div>
                <div className="text-xs text-slate-400">{pick.school}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'divider':
      return <hr className="my-8 border-0 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />;

    default:
      return null;
  }
}

export function BlockPreviewRenderer({ blocks }: BlockPreviewRendererProps) {
  return (
    <div className="max-w-[720px] mx-auto">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

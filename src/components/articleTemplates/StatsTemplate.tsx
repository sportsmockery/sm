'use client';

import React from 'react';
import { ArticleHeader } from '../articles/ArticleHeader';
import { PlayerComparison } from '../articles/PlayerComparison';
import { StatsChart } from '../articles/StatsChart';
import { GMInteraction } from '../articles/GMInteraction';
import { ReadingProgressBar } from '../articles/ReadingProgressBar';

interface PlayerInfo {
  name: string;
  team: string;
  headshot: string;
}

interface StatComparison {
  label: string;
  playerA: number;
  playerB: number;
}

interface ChartData {
  label: string;
  value: number;
}

interface StatsTemplateProps {
  tags: string[];
  headline: string;
  subheadline?: string;
  author: string;
  updatedAt: string;
  readTime: string;
  playerA: PlayerInfo;
  playerB: PlayerInfo;
  comparisonStats: StatComparison[];
  paragraphs: string[];
  chartData: ChartData[];
  chartTitle: string;
  trendData?: ChartData[];
  trendTitle?: string;
  comparisonTable?: { label: string; playerA: string; playerB: string }[];
}

export function StatsTemplate({
  tags,
  headline,
  subheadline,
  author,
  updatedAt,
  readTime,
  playerA,
  playerB,
  comparisonStats,
  paragraphs,
  chartData,
  chartTitle,
  trendData,
  trendTitle,
  comparisonTable,
}: StatsTemplateProps) {
  return (
    <>
      <ReadingProgressBar />
      <article className="max-w-[720px] mx-auto px-4 py-8" style={{ backgroundColor: '#0B0F14' }}>
        <ArticleHeader
          tags={tags}
          headline={headline}
          subheadline={subheadline}
          author={author}
          updatedAt={updatedAt}
          readTime={readTime}
        />

        {/* Player Comparison */}
        <PlayerComparison
          playerA={playerA}
          playerB={playerB}
          stats={comparisonStats}
        />

        {/* Paragraph 1 */}
        {paragraphs[0] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[0]}</p>
        )}

        {/* Stats Chart */}
        <StatsChart title={chartTitle} data={chartData} />

        {/* Paragraph 2 */}
        {paragraphs[1] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[1]}</p>
        )}

        {/* Comparison Table */}
        {comparisonTable && (
          <div
            className="rounded-xl overflow-hidden my-8"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Table header */}
            <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-widest text-slate-400 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span>Stat</span>
              <span className="text-center" style={{ color: '#00D4FF' }}>{playerA.name}</span>
              <span className="text-center" style={{ color: '#FF6A00' }}>{playerB.name}</span>
            </div>
            {/* Table rows — collapse to stacked on mobile */}
            {comparisonTable.map((row, i) => (
              <div
                key={row.label}
                className="grid grid-cols-1 md:grid-cols-3 p-4 border-b last:border-b-0"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                <span className="text-sm text-slate-400 md:text-left font-medium mb-1 md:mb-0">{row.label}</span>
                <span className="text-sm text-white text-center">{row.playerA}</span>
                <span className="text-sm text-white text-center">{row.playerB}</span>
              </div>
            ))}
          </div>
        )}

        {/* Paragraph 3 */}
        {paragraphs[2] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[2]}</p>
        )}

        {/* Trend Line Chart */}
        {trendData && trendTitle && (
          <StatsChart title={trendTitle} data={trendData} type="line" />
        )}

        {/* Paragraph 4 */}
        {paragraphs[3] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[3]}</p>
        )}

        {/* GM Interaction */}
        <GMInteraction
          question={`Who would you build around?`}
          options={[playerA.name.split(' ').pop() || playerA.name, playerB.name.split(' ').pop() || playerB.name]}
          reward={5}
        />

        {/* Remaining paragraphs */}
        {paragraphs.slice(4).map((p, i) => (
          <p key={i} className="text-[18px] leading-7 text-white mb-5">{p}</p>
        ))}
      </article>
    </>
  );
}

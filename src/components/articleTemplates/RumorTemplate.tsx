'use client';

import React from 'react';
import { ArticleHeader } from '../articles/ArticleHeader';
import { TradeScenarioCard } from '../articles/TradeScenarioCard';
import { GMInteraction } from '../articles/GMInteraction';
import { ReadingProgressBar } from '../articles/ReadingProgressBar';

type RumorStrength = 'Low' | 'Medium' | 'Strong' | 'Heating Up';

interface MockDraftPick {
  pickNumber: number;
  team: string;
  player: string;
  position: string;
  school: string;
}

interface TradeItem {
  type: 'player' | 'pick';
  label: string;
}

interface FanTrade {
  username: string;
  teamA: string;
  teamB: string;
  summary: string;
}

interface RumorTemplateProps {
  tags: string[];
  headline: string;
  subheadline?: string;
  author: string;
  updatedAt: string;
  readTime: string;
  rumorStrength: RumorStrength;
  source: string;
  paragraphs: string[];
  tradeScenario?: {
    teamA: string;
    teamB: string;
    teamAReceives: TradeItem[];
    teamBReceives: TradeItem[];
  };
  mockDraftPicks?: MockDraftPick[];
  fanTrades?: FanTrade[];
}

const STRENGTH_LEVELS: RumorStrength[] = ['Low', 'Medium', 'Strong', 'Heating Up'];

function RumorMeter({ strength }: { strength: RumorStrength }) {
  const activeIdx = STRENGTH_LEVELS.indexOf(strength);

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Rumor Strength</span>
      </div>
      <div className="flex gap-1">
        {STRENGTH_LEVELS.map((level, i) => (
          <div key={level} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i <= activeIdx ? '#FF6A00' : 'rgba(255,255,255,0.1)',
              }}
            />
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: i <= activeIdx ? '#FF6A00' : '#A0A8B0' }}
            >
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RumorTemplate({
  tags,
  headline,
  subheadline,
  author,
  updatedAt,
  readTime,
  rumorStrength,
  source,
  paragraphs,
  tradeScenario,
  mockDraftPicks = [],
  fanTrades = [],
}: RumorTemplateProps) {
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

        {/* Rumor Strength Meter */}
        <RumorMeter strength={rumorStrength} />

        {/* Source Block */}
        <div
          className="rounded-xl px-4 py-3 mb-8 flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Source:</span>
          <span className="text-sm font-medium text-white">{source}</span>
        </div>

        {/* Paragraphs */}
        {paragraphs[0] && <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[0]}</p>}
        {paragraphs[1] && <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[1]}</p>}

        {/* Trade Scenario */}
        {tradeScenario && (
          <TradeScenarioCard
            teamA={tradeScenario.teamA}
            teamB={tradeScenario.teamB}
            teamAReceives={tradeScenario.teamAReceives}
            teamBReceives={tradeScenario.teamBReceives}
          />
        )}

        {/* Trade Simulator Button */}
        <div className="my-8 flex justify-center">
          <button
            type="button"
            className="px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wide min-h-[44px] transition-opacity hover:opacity-90 md:sticky-none sticky bottom-4 z-10"
            style={{ backgroundColor: '#00D4FF', color: '#0B0F14' }}
          >
            Try The Trade
          </button>
        </div>

        {paragraphs[2] && <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[2]}</p>}

        {/* Mock Draft Picks */}
        {mockDraftPicks.length > 0 && (
          <div className="my-8 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Mock Draft
            </h3>
            {mockDraftPicks.map((pick) => (
              <div
                key={pick.pickNumber}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-lg font-extrabold text-slate-500 w-8 text-center">
                  {pick.pickNumber}
                </span>
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
        )}

        {paragraphs[3] && <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[3]}</p>}

        {/* GM Action Panel */}
        <div
          className="rounded-xl p-5 my-8"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4">Take Action</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide min-h-[44px] transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#00D4FF', color: '#0B0F14' }}
            >
              Submit Your Trade (+10 GM Score)
            </button>
            <button
              type="button"
              className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide min-h-[44px] transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF6A00', color: '#0B0F14' }}
            >
              Submit Mock Draft (+15 GM Score)
            </button>
          </div>
        </div>

        {/* Community Trades */}
        {fanTrades.length > 0 && (
          <div className="my-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Community Trades
            </h3>
            <div className="space-y-3">
              {fanTrades.slice(0, 3).map((trade, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-white">{trade.username}</span>
                    <span className="text-xs text-slate-400">{trade.teamA} ↔ {trade.teamB}</span>
                  </div>
                  <p className="text-sm text-slate-300">{trade.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining paragraphs */}
        {paragraphs.slice(4).map((p, i) => (
          <p key={i} className="text-[18px] leading-7 text-white mb-5">{p}</p>
        ))}
      </article>
    </>
  );
}

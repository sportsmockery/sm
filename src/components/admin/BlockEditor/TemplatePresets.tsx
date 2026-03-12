'use client';

import React, { useState } from 'react';
import {
  Newspaper, BarChart, Radio, Flame, MessageCircle, Info, X,
  Trophy, Play,
} from 'lucide-react';
import type { ContentBlock } from './types';
import { createBlock } from './types';

interface TemplatePreset {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  blocks: () => ContentBlock[];
  infoContent: {
    howToUse: string;
    blockList: string[];
  };
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'standard-news',
    label: 'Standard News',
    description: 'Editorial article with Scout analysis and GM Pulse engagement',
    icon: Newspaper,
    blocks: () => [
      createBlock('paragraph'),
      createBlock('paragraph'),
      createBlock('interaction'),
      createBlock('paragraph'),
      createBlock('scout-insight'),
      createBlock('paragraph'),
      createBlock('update'),
      createBlock('paragraph'),
    ],
    infoContent: {
      howToUse: 'Write a standard news article. Start with your lede, add body paragraphs, then use the GM Pulse block for fan engagement. Scout Insight auto-generates an AI take on publish. Use the Update block for breaking news additions.',
      blockList: ['Paragraph x4', 'GM Pulse', 'Scout Insight (auto-generated)', 'Update Block'],
    },
  },
  {
    id: 'stats-comparison',
    label: 'Stats / Player Comparison',
    description: 'Data-driven article with player matchups and chart analysis',
    icon: BarChart,
    blocks: () => [
      createBlock('paragraph'),
      createBlock('player-comparison'),
      createBlock('paragraph'),
      createBlock('stats-chart'),
      createBlock('paragraph'),
      createBlock('stats-chart'),
      createBlock('interaction'),
    ],
    infoContent: {
      howToUse: 'Build a data-driven comparison article. Open with analysis context, then use Player Comparison blocks for side-by-side matchups. Add Stats Chart blocks with data points to visualize trends. End with a GM Pulse poll to engage readers.',
      blockList: ['Paragraph x3', 'Player Comparison', 'Stats Chart x2', 'GM Pulse'],
    },
  },
  {
    id: 'rumor-trade',
    label: 'Rumor / Trade Simulator',
    description: 'Rumor confidence, trade scenarios, and mock draft picks',
    icon: Radio,
    blocks: () => [
      createBlock('sentiment-meter'),
      createBlock('paragraph'),
      createBlock('trade-scenario'),
      createBlock('paragraph'),
      createBlock('mock-draft'),
      createBlock('paragraph'),
      createBlock('interaction'),
    ],
    infoContent: {
      howToUse: 'Lead with a Sentiment Meter (rumor mode) to set confidence level. Write analysis around the rumor, add a Trade Scenario block showing the potential deal, and optionally include Mock Draft picks. The GM Pulse at the end lets fans vote on the trade.',
      blockList: ['Sentiment Meter', 'Paragraph x3', 'Trade Scenario', 'Mock Draft', 'GM Pulse'],
    },
  },
  {
    id: 'trending',
    label: 'Trending',
    description: 'Trending topic with heat gauge, hot takes, and fan polling',
    icon: Flame,
    blocks: () => {
      const meter = createBlock('sentiment-meter');
      if (meter.type === 'sentiment-meter') meter.data.mode = 'heat';
      const poll = createBlock('interaction');
      if (poll.type === 'interaction') poll.data.variant = 'poll';
      return [
        meter,
        createBlock('paragraph'),
        createBlock('hot-take'),
        poll,
        createBlock('scout-insight'),
      ];
    },
    infoContent: {
      howToUse: 'Use for trending topics generating buzz. Start with the Heat Meter to show momentum, write your take, drop a bold Hot Take, add a Fan Poll for participation, and Scout AI wraps up with analysis.',
      blockList: ['Sentiment Meter (heat)', 'Paragraph', 'Hot Take', 'Fan Poll', 'Scout Insight'],
    },
  },
  {
    id: 'fan-debate',
    label: 'Fan Debate',
    description: 'PRO vs CON debate with Scout AI verdict',
    icon: MessageCircle,
    blocks: () => [
      createBlock('paragraph'),
      createBlock('debate'),
      createBlock('paragraph'),
      createBlock('scout-insight'),
    ],
    infoContent: {
      howToUse: 'Frame a debate topic with an intro paragraph, then use the Debate block to present PRO (cyan) and CON (red) arguments. Add a closing paragraph for your editorial take, and Scout AI delivers the final verdict.',
      blockList: ['Paragraph x2', 'Debate (PRO vs CON)', 'Scout Insight (AI verdict)'],
    },
  },
  {
    id: 'game-recap',
    label: 'Game Recap',
    description: 'Post-game summary with stats, quotes, and fan engagement',
    icon: Trophy,
    blocks: () => {
      const poll = createBlock('interaction');
      if (poll.type === 'interaction') poll.data.variant = 'poll';
      return [
        createBlock('paragraph'),
        createBlock('stats-chart'),
        createBlock('paragraph'),
        createBlock('quote'),
        createBlock('paragraph'),
        createBlock('scout-insight'),
        poll,
      ];
    },
    infoContent: {
      howToUse: 'Open with the game summary and score context. Add a stats chart for key game metrics, write your analysis, include a player or coach quote, continue with takeaways, let Scout AI add perspective, and close with a fan poll.',
      blockList: ['Paragraph x3', 'Stats Chart', 'Quote', 'Scout Insight', 'Fan Poll'],
    },
  },
  {
    id: 'film-room',
    label: 'Film Room',
    description: 'Video analysis with stats and player comparison',
    icon: Play,
    blocks: () => {
      const poll = createBlock('interaction');
      if (poll.type === 'interaction') poll.data.variant = 'poll';
      return [
        createBlock('video'),
        createBlock('paragraph'),
        createBlock('stats-chart'),
        createBlock('player-comparison'),
        createBlock('scout-insight'),
        poll,
      ];
    },
    infoContent: {
      howToUse: 'Lead with the film clip or highlight video, break down what you see in the paragraph, support with a stats chart, compare players if relevant, let Scout AI add analytics context, and close with a fan poll.',
      blockList: ['Video', 'Paragraph', 'Stats Chart', 'Player Comparison', 'Scout Insight', 'Fan Poll'],
    },
  },
];

/* ─── Light Mode Preview Colors ─── */
const LM = {
  bg: '#f8f9fa',
  cardBg: '#ffffff',
  text: '#0B0F14',
  textSec: '#4b5563',
  textMuted: '#6b7280',
  glassBg: 'rgba(0,0,0,0.03)',
  glassBorder: 'rgba(0,0,0,0.08)',
  border: 'rgba(0,0,0,0.06)',
  red: '#BC0000',
  cyan: '#00D4FF',
  gold: '#D6B05E',
  slate400: '#94a3b8',
  slate500: '#64748b',
};

/* ─── Shared Block Sub-components ─── */

function BlockTag({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
      padding: '2px 8px', borderRadius: 4,
      background: 'rgba(0,0,0,0.05)', color: LM.slate500, marginBottom: 6,
    }}>
      {label}
    </span>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, color: LM.text, marginBottom: 20 }}>
      {children}
    </div>
  );
}

function LabelDot({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

function LabelText({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>
      {children}
    </span>
  );
}

/* ─── Block Renderers ─── */

function PollBlock({ question, options, reward, label = 'GM Pulse' }: {
  question: string; options: string[]; reward?: string; label?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label={label === 'Community Vote' ? 'Fan Poll' : 'GM Pulse'} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <LabelDot color={LM.cyan} />
        <LabelText color={LM.cyan}>{label}</LabelText>
      </div>
      <div style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: LM.text, marginBottom: 12 }}>{question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {options.map((o, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.06)', color: LM.cyan,
            }}>{o}</div>
          ))}
        </div>
        {reward && <div style={{ fontSize: 11, color: LM.gold, marginTop: 10, fontWeight: 600 }}>{reward}</div>}
      </div>
    </div>
  );
}

function InsightBlock({ text, confidence = 'HIGH' }: { text: string; confidence?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Scout Insight" />
      <div style={{
        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 12, padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: LM.cyan,
          }}>AI</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: LM.cyan }}>Scout AI Insight</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, marginLeft: 'auto',
            background: confidence === 'HIGH' ? 'rgba(0,212,255,0.1)' : 'rgba(214,176,94,0.1)',
            color: confidence === 'HIGH' ? LM.cyan : LM.gold,
          }}>{confidence}</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: LM.textSec }}>{text}</div>
      </div>
    </div>
  );
}

function UpdateBlock({ time, text }: { time: string; text: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Breaking Update" />
      <div style={{
        borderRadius: 12, borderLeft: `4px solid ${LM.red}`,
        background: 'rgba(188,0,0,0.03)',
        borderTop: `1px solid ${LM.border}`, borderRight: `1px solid ${LM.border}`, borderBottom: `1px solid ${LM.border}`,
        padding: 14,
      }}>
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 4,
          background: 'rgba(188,0,0,0.12)', color: LM.red, marginBottom: 6,
        }}>Breaking</span>
        <div style={{ fontSize: 12, color: LM.slate400, marginBottom: 4 }}>{time}</div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: LM.text }}>{text}</div>
      </div>
    </div>
  );
}

function ChartBlock({ title, rows }: { title: string; rows: { label: string; value: string; pct: number; color?: string }[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Stats Chart" />
      <div style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <LabelDot color={LM.cyan} />
          <span style={{ fontSize: 13, fontWeight: 600, color: LM.text }}>{title}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 70, fontSize: 12, color: LM.slate400, textAlign: 'right', flexShrink: 0 }}>{r.label}</span>
              <div style={{ flex: 1, height: 16, background: 'rgba(0,0,0,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: 6, background: r.color || LM.cyan }} />
              </div>
              <span style={{ width: 42, fontSize: 12, fontWeight: 600, textAlign: 'right', flexShrink: 0, color: r.color || LM.cyan }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonBlock({ p1, p2, stats }: {
  p1: { name: string; pos: string }; p2: { name: string; pos: string };
  stats: { name: string; v1: string; v2: string; pct1: number; pct2: number }[];
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Player Comparison" />
      <div style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${LM.border}` }}>
          <LabelDot color={LM.cyan} />
          <LabelText color={LM.cyan}>Player Comparison</LabelText>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 6px',
                border: '2px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: LM.cyan,
              }}>{p1.name.split(' ').map(w => w[0]).join('')}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: LM.text }}>{p1.name}</div>
              <div style={{ fontSize: 11, color: LM.slate500 }}>{p1.pos}</div>
            </div>
            <div style={{ alignSelf: 'center', fontSize: 12, fontWeight: 700, color: LM.red, padding: '0 8px' }}>VS</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 6px',
                border: '2px solid rgba(188,0,0,0.3)', background: 'rgba(188,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: LM.red,
              }}>{p2.name.split(' ').map(w => w[0]).join('')}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: LM.text }}>{p2.name}</div>
              <div style={{ fontSize: 11, color: LM.slate500 }}>{p2.pos}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 40, fontSize: 13, fontWeight: 600, color: LM.cyan, textAlign: 'right' }}>{s.v1}</span>
                <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ height: 6, width: `${s.pct1}%`, borderRadius: 3, background: LM.cyan }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: LM.slate500, width: 40, textAlign: 'center', flexShrink: 0 }}>{s.name}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 6, width: `${s.pct2}%`, borderRadius: 3, background: LM.red }} />
                  </div>
                </div>
                <span style={{ width: 40, fontSize: 13, fontWeight: 600, color: LM.red, textAlign: 'left' }}>{s.v2}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RumorMeterBlock({ segments }: { segments: { label: string; active: boolean }[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Rumor Meter" />
      <div style={{ background: 'rgba(188,0,0,0.04)', border: '1px solid rgba(188,0,0,0.15)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <LabelDot color={LM.red} />
          <LabelText color={LM.red}>Rumor Confidence</LabelText>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {segments.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: 8, borderRadius: 999, background: s.active ? LM.red : 'rgba(0,0,0,0.08)' }} />
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: s.active ? LM.red : '#A0A8B0' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatMeterBlock() {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Heat Meter" />
      <div style={{ background: 'rgba(188,0,0,0.04)', border: '1px solid rgba(188,0,0,0.15)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <LabelDot color={LM.red} />
          <LabelText color={LM.red}>Heat Meter</LabelText>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Warm', 'Hot', 'Nuclear'].map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: 10, borderRadius: 999, background: LM.red }} />
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: LM.red }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TradeBlock({ team1, team2, team1Items, team2Items }: {
  team1: string; team2: string;
  team1Items: { label: string; type: 'player' | 'pick' }[];
  team2Items: { label: string; type: 'player' | 'pick' }[];
}) {
  const itemStyle = (type: 'player' | 'pick') => ({
    display: 'flex' as const, alignItems: 'center' as const, gap: 6,
    padding: '5px 8px', borderRadius: 6, marginBottom: 3, fontSize: 12, fontWeight: 500 as const, color: LM.text,
    background: type === 'player' ? 'rgba(0,212,255,0.06)' : 'rgba(214,176,94,0.06)',
    border: `1px solid ${type === 'player' ? 'rgba(0,212,255,0.12)' : 'rgba(214,176,94,0.12)'}`,
  });
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Trade Scenario" />
      <div style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${LM.border}` }}>
          <LabelDot color={LM.red} />
          <LabelText color={LM.red}>Trade Scenario</LabelText>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: LM.cyan, marginBottom: 8 }}>{team1}</div>
            <div style={{ fontSize: 9, color: LM.slate500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Receives</div>
            {team1Items.map((item, i) => (
              <div key={i} style={itemStyle(item.type)}>
                <span style={{ fontSize: 10 }}>{item.type === 'player' ? '\u25A0' : '\u25C6'}</span> {item.label}
              </div>
            ))}
          </div>
          <div style={{ width: 1, background: LM.border, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              background: LM.cardBg, border: `1px solid ${LM.glassBorder}`, borderRadius: '50%',
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: LM.slate400,
            }}>{'\u2194'}</div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: LM.red, marginBottom: 8 }}>{team2}</div>
            <div style={{ fontSize: 9, color: LM.slate500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Receives</div>
            {team2Items.map((item, i) => (
              <div key={i} style={itemStyle(item.type)}>
                <span style={{ fontSize: 10 }}>{item.type === 'player' ? '\u25A0' : '\u25C6'}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftBlock({ picks }: { picks: { num: number; team: string; player: string; pos: string; school: string; highlight?: boolean }[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Mock Draft" />
      <div style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${LM.border}` }}>
          <LabelDot color={LM.gold} />
          <LabelText color={LM.gold}>Mock Draft</LabelText>
        </div>
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {picks.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8,
              background: p.num === 1 ? 'rgba(214,176,94,0.06)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${p.num === 1 ? 'rgba(214,176,94,0.15)' : LM.border}`,
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, width: 26, textAlign: 'center', color: p.num === 1 ? LM.gold : '#A0A8B0' }}>{p.num}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: p.highlight ? LM.cyan : LM.slate400, marginBottom: 1 }}>{p.team}</div>
                <div style={{ fontSize: 13, fontWeight: p.highlight ? 600 : 500, color: LM.text }}>{p.player}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: LM.cyan }}>{p.pos}</div>
                <div style={{ fontSize: 12, color: LM.slate400 }}>{p.school}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DebateBlock({ pro, con, proPct, conPct }: {
  pro: { label: string; text: string }; con: { label: string; text: string };
  proPct: number; conPct: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Debate" />
      <div style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${LM.border}` }}>
          <LabelDot color={LM.red} />
          <LabelText color={LM.red}>Debate</LabelText>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: LM.cyan, marginBottom: 6 }}>{pro.label}</div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: LM.text }}>{pro.text}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(188,0,0,0.04)', border: '1px solid rgba(188,0,0,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: LM.red, marginBottom: 6 }}>{con.label}</div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: LM.text }}>{con.text}</div>
          </div>
        </div>
        <div style={{ margin: '0 16px 12px', display: 'flex', borderRadius: 6, overflow: 'hidden', height: 6 }}>
          <div style={{ width: `${proPct}%`, background: LM.cyan }} />
          <div style={{ width: `${conPct}%`, background: LM.red }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 16px 16px', fontSize: 11, fontWeight: 600 }}>
          <span style={{ color: LM.cyan }}>Trade — {proPct}%</span>
          <span style={{ color: LM.red }}>Keep — {conPct}%</span>
        </div>
      </div>
    </div>
  );
}

function HotTakeBlock({ text }: { text: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Hot Take" />
      <div style={{ background: 'rgba(214,176,94,0.06)', border: '1px solid rgba(214,176,94,0.2)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <LabelDot color={LM.gold} />
          <LabelText color={LM.gold}>Top Take</LabelText>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: LM.text }}>{text}</div>
      </div>
    </div>
  );
}

function ReactionStreamBlock({ reactions }: { reactions: { initials: string; user: string; comment: string; time: string; color: string }[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Reaction Stream" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <LabelDot color={LM.cyan} />
        <LabelText color={LM.cyan}>Fan Reactions</LabelText>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {reactions.map((r, i) => (
          <div key={i} style={{ background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, background: `${r.color}18`, color: r.color,
            }}>{r.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: LM.text, marginBottom: 1 }}>{r.user}</div>
              <div style={{ fontSize: 12, color: LM.slate400, lineHeight: 1.5 }}>{r.comment}</div>
              <div style={{ fontSize: 10, color: LM.slate500, marginTop: 3 }}>{r.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Template Preview Content ─── */

function StandardNewsPreview() {
  return (
    <>
      <BlockTag label="Paragraph" />
      <Paragraph>The Chicago Bears have officially restructured Montez Sweat&apos;s contract, freeing up $14.2 million in cap space ahead of free agency. The move signals that the front office is prepared to make aggressive moves this offseason to build around Caleb Williams entering his second year.</Paragraph>

      <BlockTag label="Paragraph" />
      <Paragraph>General manager Ryan Poles confirmed the restructure during a press conference at Halas Hall on Monday, noting that the team remains committed to Sweat as a cornerstone of the defensive line for the foreseeable future.</Paragraph>

      <PollBlock
        question="How should the Bears use the $14.2M in freed cap space?"
        options={['Sign a top free agent wide receiver', 'Upgrade the offensive line', 'Add secondary depth', 'Roll it over for mid-season flexibility']}
        reward="+15 GM Score"
      />

      <BlockTag label="Paragraph" />
      <Paragraph>The Bears currently sit at approximately $38 million in effective cap space after the restructure — the most room they&apos;ve had entering a free agency period since 2021.</Paragraph>

      <InsightBlock text="This restructure follows the exact pattern Poles used with Jaylon Johnson last offseason. The Bears are clearly in &quot;win now&quot; mode — expect at least one marquee free agent signing within the first 48 hours of the legal tampering window. The cap math points to a WR1 or elite safety as the primary target." />

      <BlockTag label="Paragraph" />
      <Paragraph>The restructure does not change the length of Sweat&apos;s deal or his guaranteed money. His performance incentives remain intact.</Paragraph>

      <UpdateBlock
        time="Updated 2:47 PM CT"
        text="NFL Network's Ian Rapoport confirms the Bears are also in discussions to restructure the deals of two additional defensive starters. More cap space could be on the way."
      />

      <BlockTag label="Paragraph" />
      <Paragraph>Free agency officially opens on March 12. The Bears hold the No. 9 overall pick in the 2026 NFL Draft, giving them additional trade leverage if they choose to package picks to move up for a premium prospect.</Paragraph>
    </>
  );
}

function StatsComparisonPreview() {
  return (
    <>
      <BlockTag label="Paragraph" />
      <Paragraph>With the Bulls sitting at 23-22 and fighting for playoff positioning, the backcourt rotation has become the most debated topic among fans. Coby White&apos;s scoring surge over the last ten games has coincided with the team&apos;s best stretch of play.</Paragraph>

      <ComparisonBlock
        p1={{ name: 'Coby White', pos: 'SG — Chicago Bulls' }}
        p2={{ name: 'Tyrese Haliburton', pos: 'PG — Indiana Pacers' }}
        stats={[
          { name: 'PPG', v1: '19.4', v2: '20.8', pct1: 82, pct2: 88 },
          { name: 'APG', v1: '4.2', v2: '9.8', pct1: 42, pct2: 98 },
          { name: 'FG%', v1: '45.3%', v2: '47.1%', pct1: 72, pct2: 76 },
          { name: '3PT%', v1: '38.6%', v2: '35.2%', pct1: 85, pct2: 72 },
        ]}
      />

      <BlockTag label="Paragraph" />
      <Paragraph>White&apos;s three-point shooting has been a revelation since the All-Star break. He&apos;s shooting 42.1% from deep in his last 12 games, the best stretch of his career.</Paragraph>

      <ChartBlock
        title="Coby White — Points Per Game (Last 8)"
        rows={[
          { label: 'vs. MIL', value: '28', pct: 78 },
          { label: 'vs. CLE', value: '21', pct: 58 },
          { label: '@ BOS', value: '16', pct: 44 },
          { label: 'vs. NYK', value: '32', pct: 89 },
          { label: '@ IND', value: '24', pct: 67 },
          { label: 'vs. DET', value: '19', pct: 53 },
        ]}
      />

      <BlockTag label="Paragraph" />
      <Paragraph>The numbers tell the story. White is averaging 23.5 points per game over this stretch while maintaining elite efficiency from beyond the arc.</Paragraph>

      <ChartBlock
        title="Bulls Team 3PT% — Monthly Trend"
        rows={[
          { label: 'October', value: '33.1%', pct: 52, color: 'rgba(0,212,255,0.5)' },
          { label: 'November', value: '34.8%', pct: 55, color: 'rgba(0,212,255,0.6)' },
          { label: 'January', value: '36.2%', pct: 60, color: 'rgba(0,212,255,0.7)' },
          { label: 'February', value: '38.7%', pct: 66, color: 'rgba(0,212,255,0.85)' },
          { label: 'March', value: '39.4%', pct: 70 },
        ]}
      />

      <PollBlock
        question="Should the Bulls extend Coby White this summer?"
        options={['Yes — lock him up long term', 'No — let the market set his price']}
        reward="+10 GM Score"
      />
    </>
  );
}

function RumorTradePreview() {
  return (
    <>
      <RumorMeterBlock segments={[
        { label: 'Low', active: true },
        { label: 'Medium', active: true },
        { label: 'Strong', active: true },
        { label: 'Heating Up', active: false },
      ]} />

      <BlockTag label="Paragraph" />
      <Paragraph>Multiple league sources indicate that the Chicago Bears are exploring a trade package to move up from pick No. 9 in the 2026 NFL Draft. The target? Penn State edge rusher Abdul Carter, who is widely expected to be available somewhere in the 3-5 range.</Paragraph>

      <TradeBlock
        team1="Chicago Bears"
        team2="New York Giants"
        team1Items={[
          { label: 'Abdul Carter, EDGE', type: 'player' },
          { label: '2026 5th Round Pick', type: 'pick' },
        ]}
        team2Items={[
          { label: '2026 1st Round (#9)', type: 'pick' },
          { label: '2026 3rd Round (#72)', type: 'pick' },
          { label: '2027 2nd Round', type: 'pick' },
        ]}
      />

      <BlockTag label="Paragraph" />
      <Paragraph>The cost to move up would be significant but not unprecedented. The Bears front office views Carter as a generational talent who could anchor the defensive line alongside Montez Sweat for the next decade.</Paragraph>

      <DraftBlock picks={[
        { num: 1, team: 'Tennessee Titans', player: 'Cam Ward', pos: 'QB', school: 'Miami (FL)' },
        { num: 2, team: 'Cleveland Browns', player: 'Shedeur Sanders', pos: 'QB', school: 'Colorado' },
        { num: 3, team: 'New York Giants', player: 'Travis Hunter', pos: 'CB/WR', school: 'Colorado' },
        { num: 4, team: 'Chicago Bears (via trade)', player: 'Abdul Carter', pos: 'EDGE', school: 'Penn State', highlight: true },
      ]} />

      <BlockTag label="Paragraph" />
      <Paragraph>If the Bears pull the trigger on this trade, they would enter the 2026 season with one of the most fearsome edge rushing duos in the NFL.</Paragraph>

      <PollBlock
        question="Would you make this trade to move up for Abdul Carter?"
        options={['Yes — Carter is worth the price', 'No — keep the picks and build depth', 'Only if the cost is lower than projected']}
        reward="+15 GM Score"
      />
    </>
  );
}

function TrendingPreview() {
  return (
    <>
      <HeatMeterBlock />

      <BlockTag label="Paragraph" />
      <Paragraph>Connor Bedard&apos;s between-the-legs goal against the Nashville Predators last night has officially broken the internet. The highlight has surpassed 8 million views across social platforms in under 12 hours, making it the most-viewed Blackhawks clip since Patrick Kane&apos;s 2015 Stanley Cup winner.</Paragraph>

      <HotTakeBlock text="Connor Bedard will win the Hart Trophy within the next two seasons. His skill ceiling is the highest we've seen since McDavid entered the league, and last night was proof that he's approaching it faster than anyone expected." />

      <PollBlock
        label="Community Vote"
        question="Where does Bedard's goal rank among the best Blackhawks goals you've ever seen?"
        options={['No. 1 — best I\'ve ever seen live', 'Top 5 — up there with Kane\'s Cup winners', 'Top 10 — incredible but we\'ve seen greatness before', 'Great goal, but let\'s not overreact']}
      />

      <InsightBlock text="Bedard's goal was not just aesthetically remarkable — it was analytically elite. The expected goals value on that shot attempt was 0.03. He converted a sub-3% chance into a highlight that will define this franchise's rebuild. The Blackhawks are a +6.4 xGF% better with Bedard on the ice this month." />
    </>
  );
}

function FanDebatePreview() {
  return (
    <>
      <BlockTag label="Paragraph" />
      <Paragraph>The Cubs enter spring training with an outfield logjam and a farm system loaded with near-ready talent. With Ian Happ entering the final year of his contract, Pete Crow-Armstrong establishing himself as the everyday center fielder, and top prospect James Triantos knocking on the door, the question is unavoidable: do the Cubs trade Ian Happ now?</Paragraph>

      <DebateBlock
        pro={{ label: 'PRO — Trade Happ Now', text: "Happ is 31 and will walk in free agency after 2026. His trade value will never be higher than it is right now. The Cubs have a surplus of outfield talent and could land a top-30 prospect or a controllable arm." }}
        con={{ label: 'CON — Keep Happ for the Push', text: "The Cubs won 92 games last year. This roster is good enough to compete, and Happ is a core reason why. His leadership, switch-hitting ability, and defensive versatility are irreplaceable in October." }}
        proPct={57}
        conPct={43}
      />

      <BlockTag label="Paragraph" />
      <Paragraph>The debate cuts to the heart of what the Cubs are trying to be. Hoyer has consistently said this team is built to compete now, but the farm system tells a different story — one of a franchise preparing for the next wave.</Paragraph>

      <InsightBlock
        text="Historical comps suggest the Cubs would get the best return by trading Happ before the July deadline rather than now. Spring training trades for rental-year players historically yield 15-20% less prospect capital than deadline deals. However, an early trade gives the Cubs more time to integrate Triantos."
        confidence="MEDIUM"
      />
    </>
  );
}

function QuoteBlock({ text, speaker, team }: { text: string; speaker: string; team?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <BlockTag label="Quote" />
      <blockquote style={{
        borderRadius: 12, borderLeft: `4px solid ${LM.cyan}`,
        background: 'rgba(0,212,255,0.03)', padding: 16,
        borderTop: `1px solid ${LM.border}`, borderRight: `1px solid ${LM.border}`, borderBottom: `1px solid ${LM.border}`,
      }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', color: LM.text, marginBottom: 8 }}>
          &ldquo;{text}&rdquo;
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: LM.cyan }}>— {speaker}</span>
          {team && <span style={{ fontSize: 12, color: LM.slate500 }}>{team}</span>}
        </div>
      </blockquote>
    </div>
  );
}

function GameRecapPreview() {
  return (
    <>
      <BlockTag label="Paragraph" />
      <Paragraph>The Bears took care of business at Soldier Field on Sunday, defeating the Detroit Lions 27-17 in a game that was never really in doubt after the first quarter. Caleb Williams threw for 312 yards and 3 touchdowns, looking every bit the franchise quarterback Chicago has been waiting for.</Paragraph>

      <ChartBlock
        title="Caleb Williams — Key Game Stats"
        rows={[
          { label: 'Pass Yds', value: '312', pct: 85 },
          { label: 'Comp %', value: '71.4%', pct: 71 },
          { label: 'TD', value: '3', pct: 75 },
          { label: 'QBR', value: '94.2', pct: 94 },
          { label: 'Rush Yds', value: '28', pct: 28 },
        ]}
      />

      <BlockTag label="Paragraph" />
      <Paragraph>The defense held the Lions to just 247 total yards, with Montez Sweat recording 2.5 sacks and a forced fumble that shifted momentum in the second quarter.</Paragraph>

      <QuoteBlock
        text="We&apos;re building something special here. The guys came out with the right mentality and executed at a high level on both sides of the ball."
        speaker="Caleb Williams"
        team="Chicago Bears"
      />

      <BlockTag label="Paragraph" />
      <Paragraph>With the win, Chicago improves to 11-6 on the season and clinches a playoff berth for the first time since 2020. The Bears control their own destiny for the NFC North crown heading into the final week of the regular season.</Paragraph>

      <InsightBlock text="Williams' performance was methodical — he went 8-for-10 on third downs, converting in situations where the Bears averaged just 34% conversion earlier in the season. The offensive line allowed zero sacks for the second consecutive game. This is a team peaking at exactly the right time." />

      <PollBlock
        label="Community Vote"
        question="How far can this Bears team go in the playoffs?"
        options={['Super Bowl or bust', 'NFC Championship Game', 'One-and-done in the Wild Card', 'Depends on the matchup']}
      />
    </>
  );
}

function FilmRoomPreview() {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <BlockTag label="Video" />
        <div style={{
          background: LM.glassBg, border: `1px solid ${LM.glassBorder}`, borderRadius: 12,
          aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, color: LM.slate400, marginBottom: 6 }}>&#9654;</div>
            <span style={{ fontSize: 12, color: LM.slate500 }}>Film clip — Bears vs Lions, Q2 7:42</span>
          </div>
        </div>
      </div>

      <BlockTag label="Paragraph" />
      <Paragraph>On this play, watch how Caleb Williams reads the Cover-2 shell and immediately identifies the soft spot in the zone. The pre-snap motion from the slot receiver tells him the safety is cheating inside, leaving the deep out route wide open. This is NFL-level processing from a second-year quarterback.</Paragraph>

      <ChartBlock
        title="Williams vs Cover-2 (2025 Season)"
        rows={[
          { label: 'Comp %', value: '74.2%', pct: 74 },
          { label: 'YPA', value: '9.1', pct: 82 },
          { label: 'TD:INT', value: '12:2', pct: 86 },
          { label: 'Passer Rating', value: '118.4', pct: 90 },
        ]}
      />

      <ComparisonBlock
        p1={{ name: 'Caleb Williams', pos: 'QB — Chicago Bears' }}
        p2={{ name: 'Jalen Hurts', pos: 'QB — Philadelphia Eagles' }}
        stats={[
          { name: 'YPA', v1: '8.4', v2: '7.1', pct1: 88, pct2: 72 },
          { name: 'TD%', v1: '6.2%', v2: '5.8%', pct1: 82, pct2: 75 },
          { name: 'QBR', v1: '72.4', v2: '65.1', pct1: 85, pct2: 76 },
          { name: 'EPA/Play', v1: '0.21', v2: '0.14', pct1: 90, pct2: 65 },
        ]}
      />

      <InsightBlock text="Williams' ability to manipulate the safety with his eyes before delivery is the most advanced pre-snap skill we've tracked from any QB in this draft class. His time-to-throw against two-high shells (2.41 seconds) ranks in the 95th percentile among all NFL quarterbacks this season." />

      <PollBlock
        label="Community Vote"
        question="Is Caleb Williams already a top-10 NFL quarterback?"
        options={['Yes — the film doesn\'t lie', 'Not yet — but he\'s on pace', 'Too early to say']}
      />
    </>
  );
}

const PREVIEW_MAP: Record<string, React.FC> = {
  'standard-news': StandardNewsPreview,
  'stats-comparison': StatsComparisonPreview,
  'rumor-trade': RumorTradePreview,
  'trending': TrendingPreview,
  'fan-debate': FanDebatePreview,
  'game-recap': GameRecapPreview,
  'film-room': FilmRoomPreview,
};

/* ─── Modal ─── */

interface TemplateInfoModalProps {
  preset: TemplatePreset;
  onClose: () => void;
}

function TemplateInfoModal({ preset, onClose }: TemplateInfoModalProps) {
  const Icon = preset.icon;
  const PreviewComponent = PREVIEW_MAP[preset.id];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl flex flex-col"
        style={{ backgroundColor: '#ffffff', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}
            >
              {React.createElement(Icon, { size: 20, color: '#00D4FF' })}
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: '#0B0F14' }}>{preset.label}</h3>
              <p className="text-xs" style={{ color: '#6b7280' }}>{preset.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* How to Use */}
        <div className="px-6 pt-4 pb-2 shrink-0" style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
          <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
            {preset.infoContent.howToUse}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
            {preset.infoContent.blockList.map((block, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: 'rgba(0,212,255,0.08)', color: '#00D4FF' }}
              >
                {block}
              </span>
            ))}
          </div>
        </div>

        {/* Visual Preview - scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4" style={{ background: '#f8f9fa' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 14,
            padding: '24px 20px',
          }}>
            {/* Meta bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: LM.red }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: LM.text }}>SM Edge</span>
              <span style={{ fontSize: 11, color: LM.slate400, marginLeft: 'auto' }}>Draft Preview</span>
            </div>
            {PreviewComponent && <PreviewComponent />}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 text-right shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#f8f9fa' }}>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: '#00D4FF', color: '#ffffff' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Template Selector ─── */

interface TemplateSelectorProps {
  onSelect: (blocks: ContentBlock[], templateId: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [infoPreset, setInfoPreset] = useState<TemplatePreset | null>(null);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <h3 className="text-sm font-bold mb-1" style={{ color: '#0B0F14' }}>Choose an article template</h3>
      <p className="text-xs mb-4" style={{ color: '#6b7280' }}>Select a composition or start blank</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATE_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <div
              key={preset.id}
              className="relative rounded-xl transition-all"
              style={{
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f4f8' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
            >
              {/* Info icon - top right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoPreset(preset);
                }}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full transition-colors z-10"
                style={{ color: '#9ca3af' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00D4FF';
                  e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Learn about ${preset.label}`}
              >
                <Info size={14} />
              </button>

              <button
                type="button"
                onClick={() => onSelect(preset.blocks(), preset.id)}
                className="flex items-start gap-3 p-4 rounded-xl text-left w-full"
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}
                >
                  {React.createElement(Icon, { size: 18, color: '#00D4FF' })}
                </div>
                <div className="pr-6">
                  <div className="text-sm font-bold" style={{ color: '#0B0F14' }}>{preset.label}</div>
                  <div className="text-[11px]" style={{ color: '#6b7280' }}>{preset.description}</div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Blank option */}
        <button
          type="button"
          onClick={() => onSelect([createBlock('paragraph')], 'blank')}
          className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
          style={{
            border: '1px dashed rgba(0,0,0,0.2)',
            backgroundColor: '#ffffff',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f4f8' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <span style={{ color: '#6b7280', fontSize: 18 }}>+</span>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#0B0F14' }}>Blank</div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>Start from scratch</div>
          </div>
        </button>
      </div>

      {/* Info Modal */}
      {infoPreset && (
        <TemplateInfoModal
          preset={infoPreset}
          onClose={() => setInfoPreset(null)}
        />
      )}
    </div>
  );
}

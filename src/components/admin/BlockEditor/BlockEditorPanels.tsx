'use client';

import React from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import type { ContentBlock, SentimentMode, InteractionVariant, SocialPlatform } from './types';
import { SENTIMENT_CONFIGS } from './types';

// Shared wrapper for each block's edit panel
function BlockShell({
  label,
  accent,
  children,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  label: string;
  accent?: string;
  children: React.ReactNode;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <div
      className="group rounded-xl relative"
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl border-b"
        style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#f3f4f6' }}
      >
        <GripVertical size={14} className="text-slate-600 cursor-grab" />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: accent || '#00D4FF' }}
        >
          {label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="p-1 text-slate-500 hover:text-[#0B0F14] transition-colors" aria-label="Move up">
              <ChevronUp size={14} />
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="p-1 text-slate-500 hover:text-[#0B0F14] transition-colors" aria-label="Move down">
              <ChevronDown size={14} />
            </button>
          )}
          <button type="button" onClick={onDelete} className="p-1 text-slate-500 hover:text-[#BC0000] transition-colors" aria-label="Delete block">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Input helpers
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0B0F14] placeholder-slate-600 outline-none focus:border-[#00D4FF]/50"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0B0F14] placeholder-slate-600 outline-none focus:border-[#00D4FF]/50 resize-y"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0B0F14] outline-none focus:border-[#00D4FF]/50"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0B0F14] outline-none focus:border-[#00D4FF]/50"
    />
  );
}

function ToggleChips({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
          style={{
            backgroundColor: value === o.value ? '#00D4FF' : 'rgba(0,0,0,0.05)',
            color: value === o.value ? '#ffffff' : '#6b7280',
            border: `1px solid ${value === o.value ? '#00D4FF' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Block-specific edit panels

interface BlockPanelProps<T extends ContentBlock = ContentBlock> {
  block: T;
  onChange: (block: T) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

// ─── Content Blocks ───

export function ParagraphPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'paragraph') return null;
  return (
    <BlockShell label="Paragraph" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <TextArea
        value={block.data.html}
        onChange={(html) => onChange({ ...block, data: { html } })}
        placeholder="Write your paragraph..."
        rows={4}
      />
    </BlockShell>
  );
}

export function HeadingPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'heading') return null;
  return (
    <BlockShell label="Heading" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Text">
            <TextInput value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="Heading text" />
          </Field>
        </div>
        <div className="w-24">
          <Field label="Level">
            <Select value={String(block.data.level)} onChange={(v) => onChange({ ...block, data: { ...block.data, level: Number(v) as 2 | 3 | 4 } })} options={[{ value: '2', label: 'H2' }, { value: '3', label: 'H3' }, { value: '4', label: 'H4' }]} />
          </Field>
        </div>
      </div>
    </BlockShell>
  );
}

export function ImagePanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'image') return null;
  return (
    <BlockShell label="Image" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Image URL">
        <TextInput value={block.data.src} onChange={(src) => onChange({ ...block, data: { ...block.data, src } })} placeholder="https://..." />
      </Field>
      <Field label="Alt Text">
        <TextInput value={block.data.alt} onChange={(alt) => onChange({ ...block, data: { ...block.data, alt } })} placeholder="Describe the image" />
      </Field>
      <Field label="Caption (optional)">
        <TextInput value={block.data.caption || ''} onChange={(caption) => onChange({ ...block, data: { ...block.data, caption } })} placeholder="Image caption" />
      </Field>
      {block.data.src && (
        <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.data.src} alt={block.data.alt} className="w-full h-32 object-cover" />
        </div>
      )}
    </BlockShell>
  );
}

export function VideoPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'video') return null;
  return (
    <BlockShell label="Video" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Video URL">
        <TextInput value={block.data.url} onChange={(url) => onChange({ ...block, data: { ...block.data, url } })} placeholder="YouTube or embed URL" />
      </Field>
      <Field label="Caption (optional)">
        <TextInput value={block.data.caption || ''} onChange={(caption) => onChange({ ...block, data: { ...block.data, caption } })} placeholder="Video caption" />
      </Field>
    </BlockShell>
  );
}

export function QuotePanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'quote') return null;
  return (
    <BlockShell label="Quote" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Quote Text">
        <TextArea value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="&quot;We&apos;re going to compete every night...&quot;" rows={3} />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Speaker">
            <TextInput value={block.data.speaker} onChange={(speaker) => onChange({ ...block, data: { ...block.data, speaker } })} placeholder="Matt Eberflus" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Team (optional)">
            <TextInput value={block.data.team || ''} onChange={(team) => onChange({ ...block, data: { ...block.data, team } })} placeholder="Chicago Bears" />
          </Field>
        </div>
      </div>
    </BlockShell>
  );
}

export function SocialEmbedPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'social-embed') return null;
  return (
    <BlockShell label="Social Embed" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="URL">
        <TextInput value={block.data.url} onChange={(url) => onChange({ ...block, data: { ...block.data, url } })} placeholder="https://twitter.com/..." />
      </Field>
      <Field label="Platform">
        <ToggleChips
          value={block.data.platform}
          onChange={(platform) => onChange({ ...block, data: { ...block.data, platform: platform as SocialPlatform } })}
          options={[
            { value: 'twitter', label: 'Twitter / X' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'instagram', label: 'Instagram' },
          ]}
        />
      </Field>
    </BlockShell>
  );
}

// ─── Analysis Blocks ───

export function ScoutInsightPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'scout-insight') return null;
  const isAutoGenerate = block.data.autoGenerate !== false;
  return (
    <BlockShell label="Scout Insight" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <label className="flex items-start gap-2 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={isAutoGenerate}
          onChange={(e) => onChange({ ...block, data: { ...block.data, autoGenerate: e.target.checked, insight: e.target.checked ? '' : block.data.insight } })}
          className="h-4 w-4 mt-0.5 rounded"
          style={{ accentColor: '#00D4FF' }}
        />
        <div>
          <span className="text-sm font-medium text-[#0B0F14]">Auto-generate on publish</span>
          <p className="text-[11px] text-slate-500">
            Scout AI will read your article and add its own analysis when published
          </p>
        </div>
      </label>
      {!isAutoGenerate && (
        <Field label="Manual Insight Text">
          <TextArea value={block.data.insight} onChange={(insight) => onChange({ ...block, data: { ...block.data, insight } })} placeholder="Scout AI analysis..." rows={3} />
        </Field>
      )}
      {isAutoGenerate && block.data.insight && (
        <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#00D4FF' }}>Generated Insight</span>
          <p className="text-[13px] text-slate-400 italic">&ldquo;{block.data.insight}&rdquo;</p>
        </div>
      )}
      <Field label="Confidence">
        <Select value={block.data.confidence} onChange={(confidence) => onChange({ ...block, data: { ...block.data, confidence: confidence as 'low' | 'medium' | 'high' } })} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
      </Field>
    </BlockShell>
  );
}

export function StatsChartPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'stats-chart') return null;
  const d = block.data;

  const addPoint = () => {
    onChange({ ...block, data: { ...d, dataPoints: [...d.dataPoints, { label: '', value: 0 }] } });
  };
  const removePoint = (idx: number) => {
    onChange({ ...block, data: { ...d, dataPoints: d.dataPoints.filter((_, i) => i !== idx) } });
  };
  const updatePoint = (idx: number, updates: Partial<{ label: string; value: number }>) => {
    const dataPoints = [...d.dataPoints];
    dataPoints[idx] = { ...dataPoints[idx], ...updates };
    onChange({ ...block, data: { ...d, dataPoints } });
  };

  return (
    <BlockShell label="Chart" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="flex gap-3 mb-3">
        <div className="flex-1"><Field label="Title"><TextInput value={d.title} onChange={(title) => onChange({ ...block, data: { ...d, title } })} /></Field></div>
        <div className="w-28"><Field label="Type"><Select value={d.chartType} onChange={(chartType) => onChange({ ...block, data: { ...d, chartType: chartType as 'bar' | 'line' } })} options={[{ value: 'bar', label: 'Bar' }, { value: 'line', label: 'Line' }]} /></Field></div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Data Points</span>
      {d.dataPoints.map((pt, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <TextInput value={pt.label} onChange={(v) => updatePoint(idx, { label: v })} placeholder="Label" />
          <NumberInput value={pt.value} onChange={(v) => updatePoint(idx, { value: v })} />
          <button type="button" onClick={() => removePoint(idx)} className="text-slate-500 hover:text-[#BC0000] shrink-0"><Trash2 size={14} /></button>
        </div>
      ))}
      <button type="button" onClick={addPoint} className="text-xs text-[#00D4FF] hover:underline">+ Add data point</button>
    </BlockShell>
  );
}

export function PlayerComparisonPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'player-comparison') return null;
  const d = block.data;

  const updatePlayer = (side: 'playerA' | 'playerB', updates: Partial<{ name: string; team: string; headshot: string }>) => {
    onChange({ ...block, data: { ...d, [side]: { ...d[side], ...updates } } });
  };
  const addStat = () => {
    onChange({ ...block, data: { ...d, stats: [...d.stats, { label: '', playerA: 0, playerB: 0, higherWins: true }] } });
  };
  const removeStat = (idx: number) => {
    onChange({ ...block, data: { ...d, stats: d.stats.filter((_, i) => i !== idx) } });
  };
  const updateStat = (idx: number, updates: Partial<{ label: string; playerA: number; playerB: number; higherWins: boolean }>) => {
    const stats = [...d.stats];
    stats[idx] = { ...stats[idx], ...updates };
    onChange({ ...block, data: { ...d, stats } });
  };

  return (
    <BlockShell label="Player Comparison" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {(['playerA', 'playerB'] as const).map((side, i) => (
          <div key={side}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Player {i === 0 ? 'A' : 'B'}</span>
            {/* Player photo preview */}
            <div className="flex justify-center mb-3">
              {d[side].headshot ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden" style={{ border: `2px solid ${i === 0 ? '#00D4FF' : '#BC0000'}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d[side].headshot}
                    alt={d[side].name || `Player ${i === 0 ? 'A' : 'B'}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.style.backgroundColor = '#e2e8f0'; }}
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#e2e8f0', border: `2px dashed ${i === 0 ? '#00D4FF' : '#BC0000'}40` }}
                >
                  <span className="text-[10px] text-slate-400 text-center leading-tight">Add<br/>photo</span>
                </div>
              )}
            </div>
            <Field label="Name"><TextInput value={d[side].name} onChange={(v) => updatePlayer(side, { name: v })} /></Field>
            <Field label="Team"><TextInput value={d[side].team} onChange={(v) => updatePlayer(side, { team: v })} /></Field>
            <Field label="Headshot URL"><TextInput value={d[side].headshot} onChange={(v) => updatePlayer(side, { headshot: v })} placeholder="https://a.espncdn.com/..." /></Field>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Stats</span>
      {d.stats.map((stat, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <TextInput value={stat.label} onChange={(v) => updateStat(idx, { label: v })} placeholder="Stat label" />
          <NumberInput value={stat.playerA} onChange={(v) => updateStat(idx, { playerA: v })} />
          <NumberInput value={stat.playerB} onChange={(v) => updateStat(idx, { playerB: v })} />
          <label className="flex items-center gap-1 shrink-0 cursor-pointer" title={stat.higherWins !== false ? 'Higher = better' : 'Lower = better'}>
            <input
              type="checkbox"
              checked={stat.higherWins !== false}
              onChange={(e) => updateStat(idx, { higherWins: e.target.checked })}
              className="h-3.5 w-3.5 rounded"
              style={{ accentColor: '#00D4FF' }}
            />
            <span className="text-[10px] text-slate-500">{stat.higherWins !== false ? 'Hi' : 'Lo'}</span>
          </label>
          <button type="button" onClick={() => removeStat(idx)} className="text-slate-500 hover:text-[#BC0000] shrink-0"><Trash2 size={14} /></button>
        </div>
      ))}
      <p className="text-[10px] text-slate-400 mb-2">Toggle Hi/Lo: Hi = higher is better (yards, points). Lo = lower is better (INTs, sacks allowed).</p>
      <button type="button" onClick={addStat} className="text-xs text-[#00D4FF] hover:underline">+ Add stat</button>
    </BlockShell>
  );
}

export function TradeScenarioPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'trade-scenario') return null;
  const d = block.data;

  const addItem = (side: 'teamAReceives' | 'teamBReceives') => {
    onChange({ ...block, data: { ...d, [side]: [...d[side], { type: 'player' as const, label: '' }] } });
  };
  const removeItem = (side: 'teamAReceives' | 'teamBReceives', idx: number) => {
    onChange({ ...block, data: { ...d, [side]: d[side].filter((_, i) => i !== idx) } });
  };
  const updateItem = (side: 'teamAReceives' | 'teamBReceives', idx: number, updates: Partial<{ type: 'player' | 'pick'; label: string }>) => {
    const items = [...d[side]];
    items[idx] = { ...items[idx], ...updates };
    onChange({ ...block, data: { ...d, [side]: items } });
  };

  return (
    <BlockShell label="Trade Scenario" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['teamAReceives', 'teamBReceives'] as const).map((side, sideIdx) => {
          const teamKey = sideIdx === 0 ? 'teamA' : 'teamB';
          return (
            <div key={side}>
              <Field label={`Team ${sideIdx === 0 ? 'A' : 'B'} Name`}>
                <TextInput value={d[teamKey]} onChange={(v) => onChange({ ...block, data: { ...d, [teamKey]: v } })} placeholder="Chicago Bears" />
              </Field>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Receives</span>
              {d[side].map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Select value={item.type} onChange={(v) => updateItem(side, idx, { type: v as 'player' | 'pick' })} options={[{ value: 'player', label: 'Player' }, { value: 'pick', label: 'Pick' }]} />
                  <TextInput value={item.label} onChange={(v) => updateItem(side, idx, { label: v })} placeholder="Name / pick" />
                  <button type="button" onClick={() => removeItem(side, idx)} className="text-slate-500 hover:text-[#BC0000] shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(side)} className="text-xs text-[#00D4FF] hover:underline">+ Add item</button>
            </div>
          );
        })}
      </div>
    </BlockShell>
  );
}

export function MockDraftPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'mock-draft') return null;
  const d = block.data;

  const addPick = () => {
    const nextNum = d.picks.length > 0 ? d.picks[d.picks.length - 1].pickNumber + 1 : 1;
    onChange({ ...block, data: { picks: [...d.picks, { pickNumber: nextNum, team: '', player: '', position: '', school: '' }] } });
  };
  const removePick = (idx: number) => {
    onChange({ ...block, data: { picks: d.picks.filter((_, i) => i !== idx) } });
  };
  const updatePick = (idx: number, updates: Partial<{ pickNumber: number; team: string; player: string; position: string; school: string }>) => {
    const picks = [...d.picks];
    picks[idx] = { ...picks[idx], ...updates };
    onChange({ ...block, data: { picks } });
  };

  return (
    <BlockShell label="Mock Draft" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      {d.picks.map((pick, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <div className="w-12"><NumberInput value={pick.pickNumber} onChange={(v) => updatePick(idx, { pickNumber: v })} /></div>
          <TextInput value={pick.team} onChange={(v) => updatePick(idx, { team: v })} placeholder="Team" />
          <TextInput value={pick.player} onChange={(v) => updatePick(idx, { player: v })} placeholder="Player" />
          <TextInput value={pick.position} onChange={(v) => updatePick(idx, { position: v })} placeholder="POS" />
          <TextInput value={pick.school} onChange={(v) => updatePick(idx, { school: v })} placeholder="School" />
          <button type="button" onClick={() => removePick(idx)} className="text-slate-500 hover:text-[#BC0000] shrink-0"><Trash2 size={14} /></button>
        </div>
      ))}
      <button type="button" onClick={addPick} className="text-xs text-[#00D4FF] hover:underline">+ Add pick</button>
    </BlockShell>
  );
}

export function SentimentMeterPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'sentiment-meter') return null;
  const d = block.data;
  const config = SENTIMENT_CONFIGS[d.mode];
  const maxLevel = config.segments.length;

  return (
    <BlockShell label={config.label} accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Mode">
        <ToggleChips
          value={d.mode}
          onChange={(mode) => onChange({ ...block, data: { ...d, mode: mode as SentimentMode, level: Math.min(d.level, SENTIMENT_CONFIGS[mode as SentimentMode].segments.length) } })}
          options={[
            { value: 'rumor', label: 'Rumor' },
            { value: 'heat', label: 'Heat' },
            { value: 'confidence', label: 'Confidence' },
            { value: 'panic', label: 'Panic' },
          ]}
        />
      </Field>
      <Field label={`Level (1-${maxLevel})`}>
        <div className="flex gap-1 mt-1">
          {config.segments.map((seg, i) => (
            <button
              key={seg}
              type="button"
              onClick={() => onChange({ ...block, data: { ...d, level: i + 1 } })}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full h-3 rounded-full transition-all"
                style={{ backgroundColor: i < d.level ? '#BC0000' : 'rgba(0,0,0,0.08)' }}
              />
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: i < d.level ? '#BC0000' : '#A0A8B0' }}
              >
                {seg}
              </span>
            </button>
          ))}
        </div>
      </Field>
    </BlockShell>
  );
}

// ─── Fan Interaction Blocks ───

export function InteractionPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'interaction') return null;
  const d = block.data;
  const label = d.variant === 'gm-pulse' ? 'GM Pulse' : 'Fan Poll';

  return (
    <BlockShell label={label} accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Variant">
        <ToggleChips
          value={d.variant}
          onChange={(variant) => onChange({ ...block, data: { ...d, variant: variant as InteractionVariant } })}
          options={[
            { value: 'gm-pulse', label: 'GM Pulse' },
            { value: 'poll', label: 'Fan Poll' },
          ]}
        />
      </Field>
      <Field label="Question">
        <TextInput value={d.question} onChange={(question) => onChange({ ...block, data: { ...d, question } })} placeholder={d.variant === 'gm-pulse' ? 'Should the Bears...' : 'Is this an overreaction?'} />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Option 1">
            <TextInput value={d.options[0] || ''} onChange={(v) => { const options = [...d.options]; options[0] = v; onChange({ ...block, data: { ...d, options } }); }} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Option 2">
            <TextInput value={d.options[1] || ''} onChange={(v) => { const options = [...d.options]; options[1] = v; onChange({ ...block, data: { ...d, options } }); }} />
          </Field>
        </div>
        <div className="w-20">
          <Field label="Reward">
            <NumberInput value={d.reward} onChange={(reward) => onChange({ ...block, data: { ...d, reward } })} min={1} max={20} />
          </Field>
        </div>
      </div>
    </BlockShell>
  );
}

export function DebatePanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'debate') return null;
  return (
    <BlockShell label="Debate" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="PRO Argument (The Case For)">
        <TextArea value={block.data.proArgument} onChange={(proArgument) => onChange({ ...block, data: { ...block.data, proArgument } })} placeholder="The case for..." rows={3} />
      </Field>
      <Field label="CON Argument (The Case Against)">
        <TextArea value={block.data.conArgument} onChange={(conArgument) => onChange({ ...block, data: { ...block.data, conArgument } })} placeholder="The case against..." rows={3} />
      </Field>
      <Field label="GM Score Reward">
        <NumberInput value={block.data.reward} onChange={(reward) => onChange({ ...block, data: { ...block.data, reward } })} min={1} max={20} />
      </Field>
    </BlockShell>
  );
}

export function HotTakePanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'hot-take') return null;
  return (
    <BlockShell label="Hot Take" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Hot Take Text">
        <TextArea value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="Bold claim here..." rows={3} />
      </Field>
    </BlockShell>
  );
}

export function UpdatePanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'update') return null;
  return (
    <BlockShell label="Breaking Update" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Timestamp">
        <TextInput value={block.data.timestamp} onChange={(timestamp) => onChange({ ...block, data: { ...block.data, timestamp } })} placeholder="e.g. 9:30 PM CT" />
      </Field>
      <Field label="Update Text">
        <TextArea value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="Breaking update..." rows={2} />
      </Field>
    </BlockShell>
  );
}

export function DividerPanel({ block, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'divider') return null;
  return (
    <BlockShell label="Divider" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="h-px w-full" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
    </BlockShell>
  );
}

// Panel router — maps block type to edit panel
export function BlockPanel(props: BlockPanelProps) {
  const panels: Record<string, React.FC<BlockPanelProps>> = {
    // Content
    'paragraph': ParagraphPanel,
    'heading': HeadingPanel,
    'image': ImagePanel,
    'video': VideoPanel,
    'quote': QuotePanel,
    'social-embed': SocialEmbedPanel,
    'divider': DividerPanel,
    // Analysis
    'scout-insight': ScoutInsightPanel,
    'stats-chart': StatsChartPanel,
    'player-comparison': PlayerComparisonPanel,
    'trade-scenario': TradeScenarioPanel,
    'mock-draft': MockDraftPanel,
    'sentiment-meter': SentimentMeterPanel,
    // Fan Interaction
    'interaction': InteractionPanel,
    'debate': DebatePanel,
    'hot-take': HotTakePanel,
    'update': UpdatePanel,
  };

  const Panel = panels[props.block.type];
  if (!Panel) return null;
  return <Panel {...props} />;
}

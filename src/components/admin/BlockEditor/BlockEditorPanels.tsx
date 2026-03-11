'use client';

import React from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import type { ContentBlock } from './types';

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
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}
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
            <button type="button" onClick={onMoveUp} className="p-1 text-slate-500 hover:text-white transition-colors" aria-label="Move up">
              <ChevronUp size={14} />
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="p-1 text-slate-500 hover:text-white transition-colors" aria-label="Move down">
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

// Input helper
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
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00D4FF]/50"
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
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-[#00D4FF]/50 resize-y"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00D4FF]/50"
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
      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00D4FF]/50"
    />
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
          <span className="text-sm font-medium text-white">Auto-generate on publish</span>
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

export function GMInteractionPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'gm-interaction') return null;
  return (
    <BlockShell label="GM Pulse" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Question">
        <TextInput value={block.data.question} onChange={(question) => onChange({ ...block, data: { ...block.data, question } })} placeholder="Should the Bears..." />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Option 1">
            <TextInput value={block.data.options[0] || ''} onChange={(v) => { const options = [...block.data.options]; options[0] = v; onChange({ ...block, data: { ...block.data, options } }); }} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Option 2">
            <TextInput value={block.data.options[1] || ''} onChange={(v) => { const options = [...block.data.options]; options[1] = v; onChange({ ...block, data: { ...block.data, options } }); }} />
          </Field>
        </div>
        <div className="w-20">
          <Field label="Reward">
            <NumberInput value={block.data.reward} onChange={(reward) => onChange({ ...block, data: { ...block.data, reward } })} min={1} max={20} />
          </Field>
        </div>
      </div>
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

export function PlayerComparisonPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'player-comparison') return null;
  const d = block.data;

  const updatePlayer = (side: 'playerA' | 'playerB', updates: Partial<{ name: string; team: string; headshot: string }>) => {
    onChange({ ...block, data: { ...d, [side]: { ...d[side], ...updates } } });
  };
  const addStat = () => {
    onChange({ ...block, data: { ...d, stats: [...d.stats, { label: '', playerA: 0, playerB: 0 }] } });
  };
  const removeStat = (idx: number) => {
    onChange({ ...block, data: { ...d, stats: d.stats.filter((_, i) => i !== idx) } });
  };
  const updateStat = (idx: number, updates: Partial<{ label: string; playerA: number; playerB: number }>) => {
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
            <Field label="Name"><TextInput value={d[side].name} onChange={(v) => updatePlayer(side, { name: v })} /></Field>
            <Field label="Team"><TextInput value={d[side].team} onChange={(v) => updatePlayer(side, { team: v })} /></Field>
            <Field label="Headshot URL"><TextInput value={d[side].headshot} onChange={(v) => updatePlayer(side, { headshot: v })} /></Field>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Stats</span>
      {d.stats.map((stat, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <TextInput value={stat.label} onChange={(v) => updateStat(idx, { label: v })} placeholder="Stat label" />
          <NumberInput value={stat.playerA} onChange={(v) => updateStat(idx, { playerA: v })} />
          <NumberInput value={stat.playerB} onChange={(v) => updateStat(idx, { playerB: v })} />
          <button type="button" onClick={() => removeStat(idx)} className="text-slate-500 hover:text-[#BC0000] shrink-0"><Trash2 size={14} /></button>
        </div>
      ))}
      <button type="button" onClick={addStat} className="text-xs text-[#00D4FF] hover:underline">+ Add stat</button>
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

export function UpdatePanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'update') return null;
  return (
    <BlockShell label="Breaking Update" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Timestamp">
        <TextInput value={block.data.timestamp} onChange={(timestamp) => onChange({ ...block, data: { ...block.data, timestamp } })} placeholder="2:14 PM CT" />
      </Field>
      <Field label="Update Text">
        <TextArea value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="Breaking update..." rows={2} />
      </Field>
    </BlockShell>
  );
}

export function PollPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'poll') return null;
  return (
    <BlockShell label="Fan Poll" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Question">
        <TextInput value={block.data.question} onChange={(question) => onChange({ ...block, data: { ...block.data, question } })} placeholder="Is this an overreaction?" />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1"><Field label="Option 1"><TextInput value={block.data.options[0] || ''} onChange={(v) => { const options = [...block.data.options]; options[0] = v; onChange({ ...block, data: { ...block.data, options } }); }} /></Field></div>
        <div className="flex-1"><Field label="Option 2"><TextInput value={block.data.options[1] || ''} onChange={(v) => { const options = [...block.data.options]; options[1] = v; onChange({ ...block, data: { ...block.data, options } }); }} /></Field></div>
        <div className="w-20"><Field label="Reward"><NumberInput value={block.data.reward} onChange={(reward) => onChange({ ...block, data: { ...block.data, reward } })} min={1} max={20} /></Field></div>
      </div>
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

export function RumorMeterPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'rumor-meter') return null;
  return (
    <BlockShell label="Rumor Confidence" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Confidence Level">
        <Select value={block.data.strength} onChange={(strength) => onChange({ ...block, data: { strength: strength as 'Low' | 'Medium' | 'Strong' | 'Heating Up' } })} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'Strong', label: 'Strong' }, { value: 'Heating Up', label: 'Heating Up' }]} />
      </Field>
    </BlockShell>
  );
}

export function HeatMeterPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'heat-meter') return null;
  return (
    <BlockShell label="Heat Meter" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <Field label="Level">
        <Select value={block.data.level} onChange={(level) => onChange({ ...block, data: { level: level as 'Warm' | 'Hot' | 'Nuclear' } })} options={[{ value: 'Warm', label: 'Warm' }, { value: 'Hot', label: 'Hot' }, { value: 'Nuclear', label: 'Nuclear' }]} />
      </Field>
    </BlockShell>
  );
}

export function ReactionStreamPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'reaction-stream') return null;
  const d = block.data;
  const hasReactions = (d.availableCount ?? 0) > 0;
  const hasPreview = (d.previewItems ?? []).length > 0;

  return (
    <BlockShell label="Reaction Stream" accent="#00D4FF" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
        Displays recent fan reactions related to this post. Reactions are sourced automatically from platform activity.
      </p>

      {/* Status indicator */}
      <div
        className="rounded-lg p-3 mb-4 flex items-center gap-3"
        style={{
          backgroundColor: hasReactions ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: hasReactions ? '1px solid rgba(0,212,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: hasReactions ? '#00D4FF' : '#64748b' }}
        />
        <div>
          <span className="text-[12px] font-bold block" style={{ color: hasReactions ? '#00D4FF' : '#94a3b8' }}>
            {hasReactions ? `Reactions available (${d.availableCount})` : 'No reactions available yet'}
          </span>
          <span className="text-[11px] text-slate-500">
            {hasReactions
              ? 'This block will show recent fan sentiment on publish.'
              : 'This block will stay hidden unless reactions appear.'}
          </span>
        </div>
      </div>

      {/* Enable / Disable toggle */}
      <label className="flex items-start gap-2 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={d.enabled}
          onChange={(e) => onChange({ ...block, data: { ...d, enabled: e.target.checked } })}
          className="h-4 w-4 mt-0.5 rounded"
          style={{ accentColor: '#00D4FF' }}
        />
        <div>
          <span className="text-sm font-medium text-white">Enable Reaction Stream</span>
          <p className="text-[11px] text-slate-500">
            {d.enabled
              ? 'Reactions will display when available on the published article.'
              : 'Block is disabled and will not appear on the published article.'}
          </p>
        </div>
      </label>

      {/* Source selector */}
      <Field label="Source">
        <Select
          value={d.source}
          onChange={(source) => onChange({ ...block, data: { ...d, source: source as 'auto' | 'debate' | 'poll' | 'fan-chat' | 'team' } })}
          options={[
            { value: 'auto', label: 'Auto — best available source' },
            { value: 'debate', label: 'Debate votes & comments' },
            { value: 'poll', label: 'Poll activity' },
            { value: 'fan-chat', label: 'Fan Chat' },
            { value: 'team', label: 'Team channel' },
          ]}
        />
      </Field>

      {/* Max items */}
      <Field label="Max Reactions to Show">
        <NumberInput
          value={d.maxItems}
          onChange={(maxItems) => onChange({ ...block, data: { ...d, maxItems } })}
          min={1}
          max={10}
        />
      </Field>

      {/* Auto-hide toggle */}
      <label className="flex items-start gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={d.autoHideWhenEmpty}
          onChange={(e) => onChange({ ...block, data: { ...d, autoHideWhenEmpty: e.target.checked } })}
          className="h-4 w-4 mt-0.5 rounded"
          style={{ accentColor: '#00D4FF' }}
        />
        <div>
          <span className="text-[13px] font-medium text-white">Auto-hide when empty</span>
          <p className="text-[11px] text-slate-500">
            Automatically hides this block on the published article if no reactions are available.
          </p>
        </div>
      </label>

      {/* Preview items */}
      {hasPreview && d.enabled && (
        <div className="mt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Preview</span>
          <div className="space-y-2">
            {(d.previewItems ?? []).slice(0, d.maxItems).map((r, i) => (
              <div
                key={i}
                className="rounded-lg p-3 flex gap-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                  style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}
                >
                  {r.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-white truncate">{r.username}</span>
                    <span className="text-[10px] text-slate-600 ml-auto shrink-0">{r.timestamp}</span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-snug mt-0.5">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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

export function DividerPanel({ block, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'divider') return null;
  return (
    <BlockShell label="Divider" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
    </BlockShell>
  );
}

// Panel router — maps block type to edit panel
export function BlockPanel(props: BlockPanelProps) {
  const panels: Record<string, React.FC<BlockPanelProps>> = {
    'paragraph': ParagraphPanel,
    'heading': HeadingPanel,
    'image': ImagePanel,
    'video': VideoPanel,
    'scout-insight': ScoutInsightPanel,
    'gm-interaction': GMInteractionPanel,
    'trade-scenario': TradeScenarioPanel,
    'player-comparison': PlayerComparisonPanel,
    'stats-chart': StatsChartPanel,
    'debate': DebatePanel,
    'update': UpdatePanel,
    'reaction-stream': ReactionStreamPanel,
    'poll': PollPanel,
    'hot-take': HotTakePanel,
    'rumor-meter': RumorMeterPanel,
    'heat-meter': HeatMeterPanel,
    'mock-draft': MockDraftPanel,
    'divider': DividerPanel,
  };

  const Panel = panels[props.block.type];
  if (!Panel) return null;
  return <Panel {...props} />;
}

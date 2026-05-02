'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Trash2, GripVertical, ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import type { ContentBlock, SentimentMode, InteractionVariant, SocialPlatform, TradeItem } from './types';
import { SENTIMENT_CONFIGS } from './types';
import { RichTextArea } from './RichTextArea';

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
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.12)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl border-b"
        style={{ borderColor: 'rgba(0,0,0,0.06)', backgroundColor: '#f8fafc' }}
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
      <RichTextArea
        value={block.data.html}
        onChange={(html) => onChange({ ...block, data: { html } })}
        placeholder="Write your paragraph..."
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
        <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative h-32">
          <Image src={block.data.src} alt={block.data.alt} fill className="object-cover" />
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
                  <Image
                    src={d[side].headshot}
                    alt={d[side].name || `Player ${i === 0 ? 'A' : 'B'}`}
                    fill
                    className="object-cover"
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

// ─── Team / Player Picker for Trade Scenario ───

interface GMTeam {
  team_key: string;
  team_name: string;
  abbreviation: string;
  city: string;
  logo_url: string;
  sport: string;
  conference: string;
  division: string;
}

interface GMPlayer {
  player_id: string;
  full_name: string;
  position: string;
  headshot_url: string | null;
  stat_line: string;
  jersey_number: number | null;
}

function TeamPicker({ value, sport, onChange, label }: {
  value: string;
  sport?: string;
  onChange: (team: GMTeam) => void;
  label: string;
}) {
  const [teams, setTeams] = useState<GMTeam[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/gm/teams${sport ? `?sport=${sport}` : ''}`)
      .then(r => r.json())
      .then(d => setTeams(d.teams || []))
      .catch(() => {});
  }, [sport]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = teams.filter(t =>
    t.team_name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase()) ||
    t.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  const selected = teams.find(t => t.team_name === value);

  return (
    <div ref={ref} className="relative">
      <Field label={label}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-left"
        >
          {selected?.logo_url && (
            <div className="relative w-5 h-5 shrink-0">
              <Image src={selected.logo_url} alt="" fill className="object-contain" />
            </div>
          )}
          <span className={value ? 'text-[#0B0F14]' : 'text-slate-400'}>
            {value || 'Select team...'}
          </span>
        </button>
      </Field>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 max-h-[300px] overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
              <Search size={12} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search teams..."
                className="flex-1 bg-transparent text-sm outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[250px] overflow-y-auto">
            {filtered.map(t => (
              <button
                key={t.team_key}
                type="button"
                onClick={() => { onChange(t); setOpen(false); setSearch(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
              >
                {t.logo_url && (
                  <div className="relative w-5 h-5 shrink-0">
                    <Image src={t.logo_url} alt="" fill className="object-contain" />
                  </div>
                )}
                <span className="text-[#0B0F14]">{t.team_name}</span>
                <span className="text-[10px] text-gray-400 ml-auto uppercase">{t.sport}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">No teams found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerPicker({ teamKey, sport, onSelect }: {
  teamKey: string;
  sport: string;
  onSelect: (player: GMPlayer) => void;
}) {
  const [players, setPlayers] = useState<GMPlayer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamKey || !sport) return;
    setLoading(true);
    fetch(`/api/gm/roster?team_key=${teamKey}&sport=${sport}`)
      .then(r => r.json())
      .then(d => setPlayers(d.players || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamKey, sport]);

  const filtered = players.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
          <Search size={12} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            className="flex-1 bg-transparent text-sm outline-none"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-400">Loading roster...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">No players found</div>
        ) : filtered.map(p => (
          <button
            key={p.player_id}
            type="button"
            onClick={() => onSelect(p)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
          >
            {p.headshot_url ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
                <Image src={p.headshot_url} alt={p.full_name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-[9px] text-gray-400 font-bold">{p.position}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-[#0B0F14] block truncate">{p.full_name}</span>
              {p.stat_line && <span className="text-[11px] text-gray-400 block truncate">{p.stat_line}</span>}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">{p.position}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TradeScenarioPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'trade-scenario') return null;
  const d = block.data;
  const [addingPlayer, setAddingPlayer] = useState<{ side: 'teamAReceives' | 'teamBReceives' } | null>(null);

  const handleTeamChange = (sideKey: 'teamA' | 'teamB', team: GMTeam) => {
    const logoKey = sideKey === 'teamA' ? 'teamALogo' : 'teamBLogo';
    const sportKey = sideKey === 'teamA' ? 'teamASport' : 'teamBSport';
    const keyKey = sideKey === 'teamA' ? 'teamAKey' : 'teamBKey';
    onChange({ ...block, data: { ...d, [sideKey]: team.team_name, [logoKey]: team.logo_url, [sportKey]: team.sport, [keyKey]: team.team_key } });
  };

  const addPlayer = (side: 'teamAReceives' | 'teamBReceives', player: GMPlayer) => {
    const item: TradeItem = {
      type: 'player',
      label: player.full_name,
      headshot_url: player.headshot_url || undefined,
      stat_line: player.stat_line || undefined,
      position: player.position,
      player_id: player.player_id,
    };
    onChange({ ...block, data: { ...d, [side]: [...d[side], item] } });
    setAddingPlayer(null);
  };

  const addPick = (side: 'teamAReceives' | 'teamBReceives') => {
    onChange({ ...block, data: { ...d, [side]: [...d[side], { type: 'pick' as const, label: '' }] } });
  };

  const removeItem = (side: 'teamAReceives' | 'teamBReceives', idx: number) => {
    onChange({ ...block, data: { ...d, [side]: d[side].filter((_: TradeItem, i: number) => i !== idx) } });
  };

  const updatePickLabel = (side: 'teamAReceives' | 'teamBReceives', idx: number, label: string) => {
    const items = [...d[side]];
    items[idx] = { ...items[idx], label };
    onChange({ ...block, data: { ...d, [side]: items } });
  };

  return (
    <BlockShell label="Trade Scenario" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['teamAReceives', 'teamBReceives'] as const).map((side, sideIdx) => {
          const teamKey = sideIdx === 0 ? 'teamA' : 'teamB';
          const otherTeamKey = sideIdx === 0 ? 'teamBKey' : 'teamAKey';
          const otherTeamSport = sideIdx === 0 ? 'teamBSport' : 'teamASport';

          return (
            <div key={side}>
              <TeamPicker
                value={d[teamKey]}
                onChange={(team) => handleTeamChange(teamKey as 'teamA' | 'teamB', team)}
                label={`Team ${sideIdx === 0 ? 'A' : 'B'}`}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block mt-3">Receives</span>

              {/* Existing items */}
              {d[side].map((item: TradeItem, idx: number) => (
                <div key={idx} className="flex items-center gap-2 mb-2 rounded-lg px-2 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  {item.type === 'player' && item.headshot_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
                      <Image src={item.headshot_url} alt={item.label} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: item.type === 'player' ? 'rgba(0,212,255,0.1)' : 'rgba(214,176,94,0.1)' }}>
                      <span className="text-[8px] font-bold uppercase" style={{ color: item.type === 'player' ? '#00D4FF' : '#D6B05E' }}>{item.type === 'pick' ? 'PICK' : item.position || 'PLR'}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {item.type === 'pick' ? (
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updatePickLabel(side, idx, e.target.value)}
                        placeholder="e.g. 2026 1st Round Pick"
                        className="w-full bg-transparent text-sm outline-none text-[#0B0F14]"
                      />
                    ) : (
                      <>
                        <span className="text-sm font-medium text-[#0B0F14] block truncate">{item.label}</span>
                        {item.stat_line && <span className="text-[10px] text-gray-400 block truncate">{item.stat_line}</span>}
                      </>
                    )}
                  </div>
                  <button type="button" onClick={() => removeItem(side, idx)} className="text-slate-400 hover:text-[#BC0000] shrink-0 p-1">
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Player picker dropdown */}
              {addingPlayer?.side === side && d[otherTeamKey as keyof typeof d] && (
                <div className="mb-2">
                  <PlayerPicker
                    teamKey={d[otherTeamKey as keyof typeof d] as string}
                    sport={d[otherTeamSport as keyof typeof d] as string}
                    onSelect={(player) => addPlayer(side, player)}
                  />
                  <button type="button" onClick={() => setAddingPlayer(null)} className="mt-1 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
              )}

              {/* Add buttons */}
              {addingPlayer?.side !== side && (
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!d[otherTeamKey as keyof typeof d]) {
                        alert('Select the other team first to pick from their roster.');
                        return;
                      }
                      setAddingPlayer({ side });
                    }}
                    className="text-xs text-[#00D4FF] hover:underline"
                  >
                    + Add Player
                  </button>
                  <button type="button" onClick={() => addPick(side)} className="text-xs text-[#D6B05E] hover:underline">
                    + Add Pick
                  </button>
                </div>
              )}
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
        <RichTextArea value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="Bold claim here..." minHeight={80} />
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
        <RichTextArea value={block.data.text} onChange={(text) => onChange({ ...block, data: { ...block.data, text } })} placeholder="Breaking update..." minHeight={60} />
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

// ─── FAQ Block Panel ───

export function FAQPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  if (block.type !== 'faq') return null;
  const items = (block.data as { items: { question: string; answer: string }[] }).items;

  const updateItem = (idx: number, updates: Partial<{ question: string; answer: string }>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...updates };
    onChange({ ...block, data: { items: next } } as typeof block);
  };
  const addItem = () => {
    onChange({ ...block, data: { items: [...items, { question: '', answer: '' }] } } as typeof block);
  };
  const removeItem = (idx: number) => {
    onChange({ ...block, data: { items: items.filter((_, i) => i !== idx) } } as typeof block);
  };

  return (
    <BlockShell label="FAQ" accent="#BC0000" onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="mb-3 rounded-lg p-3"
          style={{ border: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)' }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Q{idx + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-[#BC0000]">
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <Field label="Question">
            <TextInput value={item.question} onChange={(q) => updateItem(idx, { question: q })} placeholder="What is...?" />
          </Field>
          <Field label="Answer">
            <TextArea value={item.answer} onChange={(a) => updateItem(idx, { answer: a })} placeholder="The answer..." rows={2} />
          </Field>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-[#00D4FF] hover:underline">+ Add question</button>
      {items.filter(i => i.question && i.answer).length < 3 && (
        <p className="text-[10px] text-slate-400 mt-2">Add at least 3 Q&A pairs to enable FAQPage schema.</p>
      )}
    </BlockShell>
  );
}

// ─── Editorial Structure Panels (shared shape: { html: string }) ───
// Reused for tldr, key-facts, why-it-matters, whats-next, and analysis.
const EDITORIAL_LABELS: Record<string, { label: string; accent?: string; placeholder: string }> = {
  'tldr': {
    label: 'TL;DR',
    accent: '#00D4FF',
    placeholder: 'One-paragraph summary…',
  },
  'key-facts': {
    label: 'Key Facts',
    accent: '#00D4FF',
    placeholder: 'A bullet list of the load-bearing facts…',
  },
  'why-it-matters': {
    label: 'Why It Matters',
    accent: '#BC0000',
    placeholder: 'Why this matters to readers / the team…',
  },
  'whats-next': {
    label: "What's Next",
    accent: '#00D4FF',
    placeholder: 'What to watch for next — game, deadline, decision point…',
  },
  'analysis': {
    label: 'Analysis',
    accent: '#BC0000',
    placeholder: 'Your original take — what does this mean? Why does it matter?',
  },
}

export function EditorialPanel({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockPanelProps) {
  const meta = EDITORIAL_LABELS[block.type as string]
  if (!meta) return null
  const data = block.data as { html?: string }
  return (
    <BlockShell
      label={meta.label}
      accent={meta.accent}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      <RichTextArea
        value={data.html || ''}
        onChange={(html) => onChange({ ...block, data: { ...data, html } } as typeof block)}
        placeholder={meta.placeholder}
      />
    </BlockShell>
  )
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
    // Editorial structure (all share { html: string } shape)
    'tldr': EditorialPanel,
    'key-facts': EditorialPanel,
    'why-it-matters': EditorialPanel,
    'whats-next': EditorialPanel,
    'analysis': EditorialPanel,
    'faq': FAQPanel,
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

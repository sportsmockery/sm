'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRightLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

interface TradeItem {
  type: 'player' | 'pick';
  label: string;
  headshot_url?: string;
  stat_line?: string;
  position?: string;
}

interface TradeScenarioCardProps {
  teamA: string;
  teamB: string;
  teamALogo?: string;
  teamBLogo?: string;
  teamAReceives: TradeItem[];
  teamBReceives: TradeItem[];
}

function TradeColumn({ team, teamLogo, receives }: { team: string; teamLogo?: string; receives: TradeItem[] }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        {teamLogo && (
          <div className="relative w-6 h-6 shrink-0">
            <Image src={teamLogo} alt={team} fill className="object-contain" />
          </div>
        )}
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {team} receives
        </h4>
      </div>
      <div className="space-y-2">
        {receives.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Player headshot or pick badge */}
            {item.type === 'player' && item.headshot_url ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid rgba(0,212,255,0.3)' }}>
                <Image
                  src={item.headshot_url}
                  alt={item.label}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: item.type === 'player' ? 'rgba(0,212,255,0.1)' : 'rgba(214,176,94,0.1)',
                  border: `2px solid ${item.type === 'player' ? 'rgba(0,212,255,0.3)' : 'rgba(214,176,94,0.3)'}`,
                }}
              >
                <span
                  className="text-[9px] font-bold uppercase"
                  style={{ color: item.type === 'player' ? '#00D4FF' : '#D6B05E' }}
                >
                  {item.type === 'pick' ? 'PICK' : item.position || 'PLR'}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium truncate">{item.label}</span>
                {item.position && item.type === 'player' && (
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                    style={{ backgroundColor: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}
                  >
                    {item.position}
                  </span>
                )}
              </div>
              {item.stat_line && (
                <span className="text-[11px] text-slate-400 truncate block">{item.stat_line}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradeScenarioCard({ teamA, teamB, teamALogo, teamBLogo, teamAReceives, teamBReceives }: TradeScenarioCardProps) {
  const [vote, setVote] = useState<'agree' | 'disagree' | null>(null);
  const [counts, setCounts] = useState({ agree: 0, disagree: 0 });

  const handleVote = (choice: 'agree' | 'disagree') => {
    if (vote) return; // Already voted
    setVote(choice);
    setCounts(prev => ({ ...prev, [choice]: prev[choice] + 1 }));
  };

  const totalVotes = counts.agree + counts.disagree;
  const agreePct = totalVotes > 0 ? Math.round((counts.agree / totalVotes) * 100) : 0;
  const disagreePct = totalVotes > 0 ? 100 - agreePct : 0;

  return (
    <div
      className="rounded-xl p-5 my-8"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft size={16} style={{ color: '#BC0000' }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          Trade Scenario
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <TradeColumn team={teamA} teamLogo={teamALogo} receives={teamAReceives} />
        <div className="hidden md:flex items-center justify-center">
          <ArrowRightLeft size={20} className="text-slate-600" />
        </div>
        <div className="md:hidden flex justify-center">
          <ArrowRightLeft size={20} className="text-slate-600 rotate-90" />
        </div>
        <TradeColumn team={teamB} teamLogo={teamBLogo} receives={teamBReceives} />
      </div>

      {/* Vote bar */}
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Would you make this trade?</p>
        {!vote ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleVote('agree')}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}
            >
              <ThumbsUp size={16} /> I&apos;d do it
            </button>
            <button
              type="button"
              onClick={() => handleVote('disagree')}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(188,0,0,0.1)', border: '1px solid rgba(188,0,0,0.25)', color: '#BC0000' }}
            >
              <ThumbsDown size={16} /> No way
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-2">
              <div
                className="rounded-l-full transition-all duration-500"
                style={{ width: `${agreePct}%`, backgroundColor: '#00D4FF', minWidth: totalVotes > 0 ? '4px' : 0 }}
              />
              <div
                className="rounded-r-full transition-all duration-500"
                style={{ width: `${disagreePct}%`, backgroundColor: '#BC0000', minWidth: totalVotes > 0 ? '4px' : 0 }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: vote === 'agree' ? '#00D4FF' : '#64748b', fontWeight: vote === 'agree' ? 700 : 400 }}>
                <ThumbsUp size={12} className="inline mr-1" style={{ verticalAlign: '-2px' }} />
                I&apos;d do it {agreePct}%
              </span>
              <span style={{ color: vote === 'disagree' ? '#BC0000' : '#64748b', fontWeight: vote === 'disagree' ? 700 : 400 }}>
                No way {disagreePct}%
                <ThumbsDown size={12} className="inline ml-1" style={{ verticalAlign: '-2px' }} />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

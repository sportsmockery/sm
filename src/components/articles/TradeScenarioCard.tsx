'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRightLeft } from 'lucide-react';

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
    </div>
  );
}

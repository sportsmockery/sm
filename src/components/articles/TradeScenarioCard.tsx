'use client';

import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface TradeItem {
  type: 'player' | 'pick';
  label: string;
}

interface TradeScenarioCardProps {
  teamA: string;
  teamB: string;
  teamAReceives: TradeItem[];
  teamBReceives: TradeItem[];
}

function TradeColumn({ team, receives }: { team: string; receives: TradeItem[] }) {
  return (
    <div className="flex-1">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        {team} receives
      </h4>
      <div className="space-y-2">
        {receives.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: item.type === 'player' ? 'rgba(0,212,255,0.15)' : 'rgba(214,176,94,0.15)',
                color: item.type === 'player' ? '#00D4FF' : '#D6B05E',
              }}
            >
              {item.type}
            </span>
            <span className="text-sm text-white font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradeScenarioCard({ teamA, teamB, teamAReceives, teamBReceives }: TradeScenarioCardProps) {
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
        <TradeColumn team={teamA} receives={teamAReceives} />
        <div className="hidden md:flex items-center justify-center">
          <ArrowRightLeft size={20} className="text-slate-600" />
        </div>
        <div className="md:hidden flex justify-center">
          <ArrowRightLeft size={20} className="text-slate-600 rotate-90" />
        </div>
        <TradeColumn team={teamB} receives={teamBReceives} />
      </div>
    </div>
  );
}

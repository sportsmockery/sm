'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface PlayerInfo {
  name: string;
  team: string;
  headshot: string;
}

interface StatComparison {
  label: string;
  playerA: number;
  playerB: number;
  higherWins?: boolean;
  format?: string;
}

interface PlayerComparisonProps {
  playerA: PlayerInfo;
  playerB: PlayerInfo;
  stats: StatComparison[];
}

function StatBar({ label, valueA, valueB, higherWins = true, isVisible }: {
  label: string;
  valueA: number;
  valueB: number;
  higherWins?: boolean;
  isVisible: boolean;
}) {
  const max = Math.max(valueA, valueB) * 1.15;
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;

  // Determine which player "wins" this stat
  const aWins = higherWins ? valueA >= valueB : valueA <= valueB;
  const bWins = !aWins;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: aWins ? '#00D4FF' : '#64748b', fontWeight: aWins ? 600 : 400 }}>{valueA.toFixed(1)}</span>
        <span className="font-medium text-slate-300">{label}</span>
        <span style={{ color: bWins ? '#BC0000' : '#64748b', fontWeight: bWins ? 600 : 400 }}>{valueB.toFixed(1)}</span>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 flex justify-end">
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out ml-auto"
              style={{
                width: isVisible ? `${pctA}%` : '0%',
                backgroundColor: aWins ? '#00D4FF' : 'rgba(0,212,255,0.3)',
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: isVisible ? `${pctB}%` : '0%',
                backgroundColor: bWins ? '#BC0000' : 'rgba(188,0,0,0.3)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayerComparison({ playerA, playerB, stats }: PlayerComparisonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-xl p-5 my-8"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Player headers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[playerA, playerB].map((player, idx) => (
          <div key={player.name} className="flex flex-col items-center text-center">
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2" style={{ border: `2px solid ${idx === 0 ? '#00D4FF' : '#BC0000'}` }}>
              {player.headshot ? (
                <Image src={player.headshot} alt={player.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-[18px] font-bold" style={{ color: idx === 0 ? '#00D4FF' : '#BC0000' }}>
                    {player.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <h4 className="text-sm font-bold text-white">{player.name}</h4>
            <span className="text-xs" style={{ color: idx === 0 ? '#00D4FF' : '#BC0000' }}>
              {player.team}
            </span>
          </div>
        ))}
      </div>

      {/* Stat bars */}
      {stats.map((stat) => (
        <StatBar
          key={stat.label}
          label={stat.label}
          valueA={stat.playerA}
          valueB={stat.playerB}
          higherWins={stat.higherWins}
          isVisible={isVisible}
        />
      ))}
    </div>
  );
}

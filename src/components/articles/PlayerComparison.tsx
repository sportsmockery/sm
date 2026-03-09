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
  format?: string;
}

interface PlayerComparisonProps {
  playerA: PlayerInfo;
  playerB: PlayerInfo;
  stats: StatComparison[];
}

function StatBar({ label, valueA, valueB, isVisible }: {
  label: string;
  valueA: number;
  valueB: number;
  isVisible: boolean;
}) {
  const max = Math.max(valueA, valueB) * 1.15;
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
        <span>{valueA.toFixed(1)}</span>
        <span className="font-medium text-slate-300">{label}</span>
        <span>{valueB.toFixed(1)}</span>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 flex justify-end">
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out ml-auto"
              style={{
                width: isVisible ? `${pctA}%` : '0%',
                backgroundColor: '#00D4FF',
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
                backgroundColor: '#FF6A00',
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
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
              <Image src={player.headshot} alt={player.name} fill className="object-cover" />
            </div>
            <h4 className="text-sm font-bold text-white">{player.name}</h4>
            <span className="text-xs" style={{ color: idx === 0 ? '#00D4FF' : '#FF6A00' }}>
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
          isVisible={isVisible}
        />
      ))}
    </div>
  );
}

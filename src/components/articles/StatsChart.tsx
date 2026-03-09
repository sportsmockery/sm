'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface StatsChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  type?: 'bar' | 'line';
}

export function StatsChart({ title, data, color = '#00D4FF', type = 'bar' }: StatsChartProps) {
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

  const max = Math.max(...data.map((d) => d.value)) * 1.15;

  if (type === 'line') {
    const width = 600;
    const height = 200;
    const padding = 30;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const points = data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * chartW,
      y: padding + chartH - (d.value / max) * chartH,
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div
        ref={ref}
        className="rounded-xl p-5 my-8"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={padding}
              x2={width - padding}
              y1={padding + chartH * (1 - pct)}
              y2={padding + chartH * (1 - pct)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
            style={{
              strokeDasharray: isVisible ? 'none' : '1000',
              strokeDashoffset: isVisible ? 0 : 1000,
            }}
          />
          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={color}
              className="transition-opacity duration-700"
              style={{ opacity: isVisible ? 1 : 0, transitionDelay: `${i * 100}ms` }}
            />
          ))}
          {/* Labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={points[i].x}
              y={height - 5}
              textAnchor="middle"
              fill="#A0A8B0"
              fontSize={11}
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="rounded-xl p-5 my-8"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{d.label}</span>
              <span className="text-white font-medium">{d.value}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: isVisible ? `${(d.value / max) * 100}%` : '0%',
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

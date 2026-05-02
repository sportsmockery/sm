'use client';

import { cn, formatNumber } from '@/lib/utils';

export interface BarRow {
  label: string;
  value: number;
  team?: 'chicago' | 'opponent' | 'neutral';
}

export interface BarChartProps {
  rows: BarRow[];
  /** Salary cap or other reference line (in same units as values). */
  capLine?: number;
  /** Max value used for normalization; defaults to max(values, capLine). */
  max?: number;
  className?: string;
  format?: (n: number) => string;
}

export function BarChart({ rows, capLine, max, className, format = formatNumber }: BarChartProps) {
  const computedMax =
    max ?? Math.max(...rows.map((r) => r.value), capLine ?? 0, 1);

  const capPct = capLine != null ? Math.min(100, (capLine / computedMax) * 100) : null;

  return (
    <div className={cn('relative w-full space-y-3', className)}>
      {capPct != null && (
        <div
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-white/40 pointer-events-none"
          style={{ left: `${capPct}%` }}
          aria-label={`Salary cap line at ${format(capLine!)}`}
        >
          <span className="absolute -top-5 -translate-x-1/2 text-[10px] uppercase tracking-wider text-white/60">
            Cap
          </span>
        </div>
      )}
      {rows.map((row) => {
        const pct = Math.min(100, (row.value / computedMax) * 100);
        const color =
          row.team === 'chicago'
            ? 'bg-brand-red'
            : row.team === 'opponent'
            ? 'bg-brand-opponent'
            : 'bg-white/40';
        const overCap = capLine != null && row.value > capLine;
        return (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs font-medium text-white/80 truncate">{row.label}</span>
            <div className="relative flex-1 h-6 rounded-full bg-white/5 overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-[width] duration-500 ease-out',
                  color,
                  overCap && 'opacity-90 ring-2 ring-grade-red/50',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-20 text-right text-xs tabular-nums text-white/80">{format(row.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  label?: string;
  format?: (n: number) => string;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  format = (n) => n.toString(),
  className,
}: SliderProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs font-medium text-white/80 mb-2">
          <span>{label}</span>
          <span className="tabular-nums text-white">{format(value)}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full appearance-none h-1.5 rounded-full bg-white/10',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-red',
          '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-red',
        )}
      />
    </div>
  );
}

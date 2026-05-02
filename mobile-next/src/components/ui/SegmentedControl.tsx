'use client';

import { cn } from '@/lib/utils';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (next: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn('liquid-glass-dark rounded-full p-1 flex gap-1', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200',
              active ? 'bg-brand-red text-white' : 'text-white/70 hover:text-white',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

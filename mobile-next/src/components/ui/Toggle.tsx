'use client';

import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, className, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between gap-4 w-full text-left rounded-xl px-4 py-3',
        'liquid-glass-dark transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && <div className="text-sm font-semibold text-white truncate">{label}</div>}
          {description && <div className="text-xs text-white/60 truncate">{description}</div>}
        </div>
      )}
      <span
        className={cn(
          'shrink-0 relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-brand-red' : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </span>
    </button>
  );
}

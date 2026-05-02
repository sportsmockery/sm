'use client';

import { X } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

export interface TradeAssetPillProps {
  primary: string;
  secondary?: string;
  value?: number;
  imageUrl?: string;
  side: 'sent' | 'received';
  onRemove?: () => void;
  className?: string;
}

export function TradeAssetPill({
  primary,
  secondary,
  value,
  imageUrl,
  side,
  onRemove,
  className,
}: TradeAssetPillProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full liquid-glass-pill px-2 py-1.5',
        'border-l-2',
        side === 'sent' ? 'border-l-brand-red' : 'border-l-brand-opponent',
        className,
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <span className="h-7 w-7 rounded-full bg-white/10 grid place-items-center text-[10px] text-white/70">
          {primary.charAt(0)}
        </span>
      )}
      <div className="min-w-0">
        <div className="text-xs font-semibold text-white truncate max-w-[120px]">{primary}</div>
        {secondary && (
          <div className="text-[10px] text-white/60 truncate max-w-[120px]">{secondary}</div>
        )}
      </div>
      {value != null && (
        <span className="text-[10px] tabular-nums text-white/70 ml-1">${formatNumber(value)}</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${primary}`}
          className="ml-1 h-5 w-5 grid place-items-center rounded-full bg-white/10 text-white/80"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

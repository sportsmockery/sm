'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isNative } from '@/lib/utils';

export type AdFormat = 'banner' | 'mrec';

export interface AdSlotProps {
  format?: AdFormat;
  className?: string;
  label?: string;
  /** Optional ad unit override; falls back to env-configured ID. */
  adId?: string;
}

const dims = {
  banner: 'min-h-[50px] h-[50px]',
  mrec: 'min-h-[250px] h-[250px]',
};

/**
 * Fixed-dim ad placeholder. Per Directive 3, this MUST render the same
 * dimensions during static export and during runtime — never lazily resize
 * after AdMob loads. Native ad SDK (if any) is invoked separately via
 * lib/ads.ts and overlays this slot.
 */
export function AdSlot({ format = 'banner', className, label = 'Advertisement', adId }: AdSlotProps) {
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNative());
    if (!isNative()) return;
    // Future: request a banner here once AdMob is wired up via lib/ads.ts.
    // For now we just render the placeholder so size is stable.
    void adId;
  }, [adId]);

  return (
    <div
      className={cn(
        dims[format],
        'w-full rounded-lg border border-white/5 bg-black/20 flex items-center justify-center',
        className,
      )}
      aria-label={label}
    >
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
        {native ? label : `${label} (preview)`}
      </span>
    </div>
  );
}

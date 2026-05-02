'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ValidationResult } from '@/lib/gm-types';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

export interface CapValidationProps {
  validation: ValidationResult | null;
}

export function CapValidation({ validation }: CapValidationProps) {
  if (!validation) return null;
  const errors = validation.issues?.filter((i) => i.severity === 'error') ?? [];
  const warnings = validation.issues?.filter((i) => i.severity === 'warning') ?? [];
  const isValid = validation.status === 'valid';

  if (isValid && warnings.length === 0) {
    return (
      <LiquidGlassCard className="flex items-center gap-2 px-4 py-3" rounded="xl">
        <CheckCircle2 size={16} className="text-grade-green" />
        <span className="text-xs text-white/80">Trade is cap-compliant.</span>
      </LiquidGlassCard>
    );
  }

  return (
    <LiquidGlassCard className="space-y-1.5 px-4 py-3" rounded="xl">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className={errors.length ? 'text-grade-red' : 'text-grade-amber'} />
        <span className="text-xs font-semibold text-white">
          {errors.length ? 'Trade blocked' : 'Cap warnings'}
        </span>
      </div>
      <ul className="space-y-0.5 text-[11px] text-white/70 pl-6 list-disc">
        {errors.map((i, idx) => <li key={`e-${idx}`} className="text-grade-red/90">{i.message}</li>)}
        {warnings.map((i, idx) => <li key={`w-${idx}`}>{i.message}</li>)}
      </ul>
    </LiquidGlassCard>
  );
}

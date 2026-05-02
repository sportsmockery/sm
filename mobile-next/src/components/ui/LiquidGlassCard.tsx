import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface LiquidGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  theme?: 'dark' | 'light';
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
  padded?: boolean;
  children: ReactNode;
}

const radius = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export function LiquidGlassCard({
  theme = 'dark',
  rounded = '2xl',
  padded = true,
  className,
  children,
  ...rest
}: LiquidGlassCardProps) {
  return (
    <div
      className={cn(
        theme === 'dark' ? 'liquid-glass-dark' : 'liquid-glass-light',
        radius[rounded],
        padded && 'p-4',
        'transition-colors duration-200',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

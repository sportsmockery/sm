import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Render as inline-block so it sits inline with text. */
  inline?: boolean;
}

const radii: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'md', inline }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        inline ? 'inline-block' : 'block',
        'bg-white/5 animate-pulse',
        radii[rounded],
        className,
      )}
    />
  );
}

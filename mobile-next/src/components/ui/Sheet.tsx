'use client';

import { Drawer } from 'vaul';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Snap points expressed as fractions of viewport height. */
  snapPoints?: (number | string)[];
}

export function Sheet({ open, onOpenChange, title, description, children, className, snapPoints }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={snapPoints}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 inset-x-0 z-50 mt-24 flex flex-col rounded-t-3xl liquid-glass-dark',
            'max-h-[92dvh] safe-bottom',
            'outline-none',
            className,
          )}
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-white/30" aria-hidden />
          {(title || description) && (
            <div className="px-5 pt-3 pb-2">
              {title && (
                <Drawer.Title className="text-lg font-semibold text-white">{title}</Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="text-sm text-white/70 mt-1">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function SheetTrigger({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={cn('inline-flex items-center', className)}>
      {children}
    </button>
  );
}

'use client'

/**
 * InteractivePress — universal tactile wrapper.
 *
 * Synchronizes a subtle visual press with a native haptic. Use in place of a
 * plain <div> or <button> for cards, list items, and major actions.
 *
 *   <InteractivePress onClick={...}>{children}</InteractivePress>
 *   <InteractivePress as="button" hapticStyle="medium">…</InteractivePress>
 *
 * Notes:
 * - Haptics route through `src/lib/haptics.ts` (Capacitor → vibrate → no-op).
 * - Respects `prefers-reduced-motion` (skips press scale).
 * - Keyboard-activatable (Enter / Space) when rendered as a div with role="button".
 * - Disabled state prevents click, haptic, animation, and pointer cursor.
 */

import { forwardRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { triggerHaptic, type HapticStyle } from '@/lib/haptics'
import { cn } from '@/lib/utils'

type AsTag = 'div' | 'button' | 'a'

export interface InteractivePressProps {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void
  className?: string
  hapticStyle?: HapticStyle
  disabled?: boolean
  /** Visual press intensity. Defaults: scale 0.97, opacity 0.95. */
  pressScale?: number
  pressOpacity?: number
  /** Render element. Defaults to 'div' with role="button". Use 'a' for links, 'button' for forms. */
  as?: AsTag
  /** When `as="a"`. */
  href?: string
  /** When `as="button"`. */
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  /** Forwarded to underlying element. */
  id?: string
}

export const InteractivePress = forwardRef<HTMLElement, InteractivePressProps>(function InteractivePress(
  {
    children,
    onClick,
    className,
    hapticStyle = 'light',
    disabled = false,
    pressScale = 0.97,
    pressOpacity = 0.95,
    as = 'div',
    href,
    type,
    ariaLabel,
    id,
  },
  ref,
) {
  const prefersReducedMotion = useReducedMotion()

  const handleActivate = (e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    if (disabled) return
    // Fire haptic immediately for zero-latency feel; do not await before invoking onClick.
    void triggerHaptic(hapticStyle)
    onClick?.(e)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return
    if (as !== 'div') return // native button/anchor handle their own keys
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      handleActivate(e)
    }
  }

  const whileTap = disabled || prefersReducedMotion
    ? undefined
    : { scale: pressScale, opacity: pressOpacity }

  const sharedProps = {
    onClick: handleActivate,
    onKeyDown: as === 'div' ? handleKeyDown : undefined,
    'aria-disabled': disabled || undefined,
    'aria-label': ariaLabel,
    id,
    className: cn(
      'touch-manipulation select-none',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      className,
    ),
    whileTap,
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  }

  if (as === 'button') {
    const buttonProps = sharedProps as HTMLMotionProps<'button'> & { ref?: React.Ref<HTMLButtonElement> }
    return (
      <motion.button
        {...buttonProps}
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? 'button'}
        disabled={disabled}
      >
        {children}
      </motion.button>
    )
  }

  if (as === 'a') {
    const anchorProps = sharedProps as HTMLMotionProps<'a'> & { ref?: React.Ref<HTMLAnchorElement> }
    return (
      <motion.a
        {...anchorProps}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        role={disabled ? 'link' : undefined}
        aria-disabled={disabled || undefined}
      >
        {children}
      </motion.a>
    )
  }

  const divProps = sharedProps as HTMLMotionProps<'div'> & { ref?: React.Ref<HTMLDivElement> }
  return (
    <motion.div
      {...divProps}
      ref={ref as React.Ref<HTMLDivElement>}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </motion.div>
  )
})

export default InteractivePress

'use client'

import { ReactNode, forwardRef, CSSProperties } from 'react'
import { motion, HTMLMotionProps, Variants } from 'framer-motion'

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  /** Index for staggered animations in grids */
  index?: number
  /** Base delay before animation starts (in seconds) */
  delay?: number
  /** Enable hover lift effect */
  hoverLift?: boolean
  /** Enable hover scale effect */
  hoverScale?: boolean
  /** Custom hover scale amount */
  hoverScaleAmount?: number
  /** Enable hover glow effect (Bears orange) */
  hoverGlow?: boolean
  /** Disable all animations (for reduced motion preference) */
  disableAnimation?: boolean
  /** Element to render as */
  as?: 'div' | 'article' | 'li' | 'section'
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (custom: { index: number; delay: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom ease curve for natural feel
      delay: custom.delay + custom.index * 0.08,
    },
  }),
}

/**
 * AnimatedCard
 *
 * A reusable animated card component with:
 * - Entrance animation (fade in + slide up)
 * - Staggered animations for grids (via index prop)
 * - Hover effects: lift, scale, and Bears orange glow
 * - Respects prefers-reduced-motion
 *
 * Usage:
 * ```tsx
 * <AnimatedCard index={0} hoverLift hoverGlow>
 *   <CardContent />
 * </AnimatedCard>
 * ```
 */
const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      children,
      index = 0,
      delay = 0,
      hoverLift = false,
      hoverScale = false,
      hoverScaleAmount = 1.02,
      hoverGlow = false,
      disableAnimation = false,
      as = 'div',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    // Build hover animation
    const hoverEffects: Record<string, string | number> = {}
    const transitionProps: Record<string, string | number> = {
      duration: 0.2,
    }

    if (hoverLift) {
      hoverEffects.y = -4
    }

    if (hoverScale) {
      hoverEffects.scale = hoverScaleAmount
    }

    // Glow is handled via CSS class since it's a box-shadow
    const glowClass = hoverGlow ? 'hover-glow-bears' : ''

    const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div

    if (disableAnimation) {
      // For static rendering, use a simple div wrapper
      // This avoids complex polymorphic ref type issues
      return (
        <div
          ref={ref}
          className={`${className} ${glowClass}`.trim()}
          style={style as CSSProperties}
        >
          {children}
        </div>
      )
    }

    return (
      <MotionComponent
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={{ index, delay }}
        whileHover={Object.keys(hoverEffects).length > 0 ? hoverEffects : undefined}
        transition={Object.keys(hoverEffects).length > 0 ? transitionProps : undefined}
        className={`${className} ${glowClass}`.trim()}
        style={style}
        {...props}
      >
        {children}
      </MotionComponent>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

export default AnimatedCard

'use client'

import { useEffect, useRef, useState, RefObject } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return [ref, isVisible]
}

// Hook for staggered animations on multiple elements
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay: number = 100
): number[] {
  return Array.from({ length: itemCount }, (_, i) => i * baseDelay)
}

// Predefined animation classes for scroll reveal
export const scrollAnimations = {
  fadeIn: {
    hidden: 'opacity-0',
    visible: 'opacity-100 transition-opacity duration-500',
  },
  fadeInUp: {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0 transition-all duration-500',
  },
  fadeInDown: {
    hidden: 'opacity-0 -translate-y-8',
    visible: 'opacity-100 translate-y-0 transition-all duration-500',
  },
  fadeInLeft: {
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0 transition-all duration-500',
  },
  fadeInRight: {
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0 transition-all duration-500',
  },
  scaleIn: {
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100 transition-all duration-500',
  },
  slideInUp: {
    hidden: 'opacity-0 translate-y-full',
    visible: 'opacity-100 translate-y-0 transition-all duration-700',
  },
} as const

export type AnimationType = keyof typeof scrollAnimations

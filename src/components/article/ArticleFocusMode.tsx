'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

interface ArticleFocusModeProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function ArticleFocusMode({ children, className = '', style }: ArticleFocusModeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { y, direction } = useScrollPosition()

  useEffect(() => {
    if (!ref.current) return

    if (y > 500 && direction === 'down') {
      ref.current.classList.add('faded')
    } else {
      ref.current.classList.remove('faded')
    }
  }, [y, direction])

  return (
    <aside ref={ref} className={`article-sidebar-focus ${className}`} style={style}>
      {children}
    </aside>
  )
}

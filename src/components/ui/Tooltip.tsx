'use client'

import { useState, useRef, useEffect, ReactNode, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
  maxWidth?: number
  disabled?: boolean
}

interface TooltipState {
  x: number
  y: number
  position: TooltipPosition
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  maxWidth = 250,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const padding = 8

    let x: number
    let y: number
    let finalPosition = position

    switch (position) {
      case 'top':
        x = rect.left + scrollX + rect.width / 2
        y = rect.top + scrollY - padding
        break
      case 'bottom':
        x = rect.left + scrollX + rect.width / 2
        y = rect.bottom + scrollY + padding
        break
      case 'left':
        x = rect.left + scrollX - padding
        y = rect.top + scrollY + rect.height / 2
        break
      case 'right':
        x = rect.right + scrollX + padding
        y = rect.top + scrollY + rect.height / 2
        break
    }

    // Check viewport boundaries and flip if needed
    if (position === 'top' && rect.top < 60) {
      finalPosition = 'bottom'
      y = rect.bottom + scrollY + padding
    } else if (position === 'bottom' && window.innerHeight - rect.bottom < 60) {
      finalPosition = 'top'
      y = rect.top + scrollY - padding
    }

    setTooltipState({ x, y, position: finalPosition })
  }

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => {
      calculatePosition()
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
    setTooltipState(null)
  }

  const getTooltipStyles = (): React.CSSProperties => {
    if (!tooltipState) return { opacity: 0 }

    const styles: React.CSSProperties = {
      position: 'absolute',
      maxWidth,
      zIndex: 9999,
    }

    switch (tooltipState.position) {
      case 'top':
        styles.left = tooltipState.x
        styles.top = tooltipState.y
        styles.transform = 'translate(-50%, -100%)'
        break
      case 'bottom':
        styles.left = tooltipState.x
        styles.top = tooltipState.y
        styles.transform = 'translate(-50%, 0)'
        break
      case 'left':
        styles.left = tooltipState.x
        styles.top = tooltipState.y
        styles.transform = 'translate(-100%, -50%)'
        break
      case 'right':
        styles.left = tooltipState.x
        styles.top = tooltipState.y
        styles.transform = 'translate(0, -50%)'
        break
    }

    return styles
  }

  const getArrowStyles = (): React.CSSProperties => {
    if (!tooltipState) return {}

    const arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: 8,
      height: 8,
      backgroundColor: 'var(--bg-elevated)',
      transform: 'rotate(45deg)',
    }

    switch (tooltipState.position) {
      case 'top':
        arrowStyles.bottom = -4
        arrowStyles.left = '50%'
        arrowStyles.marginLeft = -4
        break
      case 'bottom':
        arrowStyles.top = -4
        arrowStyles.left = '50%'
        arrowStyles.marginLeft = -4
        break
      case 'left':
        arrowStyles.right = -4
        arrowStyles.top = '50%'
        arrowStyles.marginTop = -4
        break
      case 'right':
        arrowStyles.left = -4
        arrowStyles.top = '50%'
        arrowStyles.marginTop = -4
        break
    }

    return arrowStyles
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </span>

      {mounted && isVisible && tooltipState && createPortal(
        <div
          role="tooltip"
          style={getTooltipStyles()}
          className={`animate-in fade-in zoom-in-95 duration-150 ${className}`}
        >
          <div
            className="relative rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-lg"
            style={{ maxWidth }}
          >
            {content}
            <div style={getArrowStyles()} className="border-l border-t border-[var(--border-default)]" />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Help Tooltip - specialized tooltip for help icons
interface HelpTooltipProps {
  content: ReactNode
  position?: TooltipPosition
  className?: string
}

export function HelpTooltip({ content, position = 'top', className = '' }: HelpTooltipProps) {
  return (
    <Tooltip content={content} position={position} className={className}>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
        aria-label="Help"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>
    </Tooltip>
  )
}

// Info Badge - inline info with tooltip
interface InfoBadgeProps {
  label: string
  tooltip: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function InfoBadge({ label, tooltip, variant = 'default' }: InfoBadgeProps) {
  const variantClasses = {
    default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    error: 'bg-red-500/10 text-red-500',
  }

  return (
    <Tooltip content={tooltip}>
      <span className={`inline-flex cursor-help items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
        {label}
        <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </span>
    </Tooltip>
  )
}

// Keyboard Shortcut Tooltip - shows keyboard shortcuts
interface ShortcutTooltipProps {
  description: string
  shortcut: string | string[]
  children: ReactNode
  position?: TooltipPosition
}

export function ShortcutTooltip({ description, shortcut, children, position = 'bottom' }: ShortcutTooltipProps) {
  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut]

  const content = (
    <div className="flex flex-col gap-1">
      <span>{description}</span>
      <div className="flex items-center gap-1">
        {shortcuts.map((key, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-0.5 text-[var(--text-muted)]">+</span>}
            <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5 font-mono text-xs font-medium text-[var(--text-primary)]">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <Tooltip content={content} position={position}>
      {children}
    </Tooltip>
  )
}

// Feature Tooltip Context for onboarding/discovery
interface FeatureTooltipContextType {
  showFeatureTips: boolean
  setShowFeatureTips: (show: boolean) => void
  dismissedTips: Set<string>
  dismissTip: (id: string) => void
}

const FeatureTooltipContext = createContext<FeatureTooltipContextType | null>(null)

export function FeatureTooltipProvider({ children }: { children: ReactNode }) {
  const [showFeatureTips, setShowFeatureTips] = useState(true)
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set())

  const dismissTip = (id: string) => {
    setDismissedTips(prev => new Set([...prev, id]))
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sm-dismissed-tips')
      const tips = stored ? JSON.parse(stored) : []
      localStorage.setItem('sm-dismissed-tips', JSON.stringify([...tips, id]))
    }
  }

  useEffect(() => {
    // Load dismissed tips from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sm-dismissed-tips')
      if (stored) {
        setDismissedTips(new Set(JSON.parse(stored)))
      }
    }
  }, [])

  return (
    <FeatureTooltipContext.Provider value={{ showFeatureTips, setShowFeatureTips, dismissedTips, dismissTip }}>
      {children}
    </FeatureTooltipContext.Provider>
  )
}

export function useFeatureTooltips() {
  const context = useContext(FeatureTooltipContext)
  if (!context) {
    throw new Error('useFeatureTooltips must be used within a FeatureTooltipProvider')
  }
  return context
}

// Feature Tooltip - for highlighting new features
interface FeatureTooltipProps {
  id: string
  title: string
  description: string
  children: ReactNode
  position?: TooltipPosition
  pulse?: boolean
}

export function FeatureTooltip({ id, title, description, children, position = 'bottom', pulse = true }: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setMounted(true)
    // Check if this tip should be shown
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sm-dismissed-tips')
      const dismissed = stored ? JSON.parse(stored) : []
      if (!dismissed.includes(id)) {
        // Delay showing the tooltip
        const timeout = setTimeout(() => setIsVisible(true), 1000)
        return () => clearTimeout(timeout)
      }
    }
  }, [id])

  const dismiss = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sm-dismissed-tips')
      const tips = stored ? JSON.parse(stored) : []
      localStorage.setItem('sm-dismissed-tips', JSON.stringify([...tips, id]))
    }
  }

  return (
    <>
      <span ref={triggerRef} className="relative inline-flex">
        {children}
        {mounted && isVisible && pulse && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-red)] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent-red)]" />
          </span>
        )}
      </span>

      {mounted && isVisible && triggerRef.current && createPortal(
        <div
          className="animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            position: 'absolute',
            left: triggerRef.current.getBoundingClientRect().left + window.scrollX + triggerRef.current.offsetWidth / 2,
            top: position === 'top'
              ? triggerRef.current.getBoundingClientRect().top + window.scrollY - 8
              : triggerRef.current.getBoundingClientRect().bottom + window.scrollY + 8,
            transform: position === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            zIndex: 9999,
            maxWidth: 280,
          }}
        >
          <div className="relative rounded-xl border border-[var(--accent-red)]/30 bg-[var(--bg-elevated)] p-4 shadow-lg shadow-red-500/5">
            {/* Arrow */}
            <div
              className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-[var(--accent-red)]/30 bg-[var(--bg-elevated)] ${
                position === 'top' ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-l border-t'
              }`}
            />

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-red)]/10">
                <svg className="h-4 w-4 text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
              </div>
            </div>

            <button
              onClick={dismiss}
              className="mt-3 w-full rounded-lg bg-[var(--accent-red)]/10 px-3 py-1.5 text-sm font-medium text-[var(--accent-red)] transition-colors hover:bg-[var(--accent-red)]/20"
            >
              Got it
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Tooltip

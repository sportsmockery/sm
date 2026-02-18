'use client'

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react'

export interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export default function Dropdown({
  trigger,
  children,
  align = 'left',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClickOutside, handleKeyDown])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      <div
        className={`
          absolute top-full ${alignClass} mt-1 min-w-[200px] z-[var(--z-dropdown)]
          bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg
          overflow-hidden transition-all duration-200 origin-top
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
        `}
      >
        {children}
      </div>
    </div>
  )
}

// Dropdown Item
export interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
  danger?: boolean
  className?: string
}

export function DropdownItem({
  children,
  onClick,
  icon,
  active = false,
  disabled = false,
  danger = false,
  className = '',
}: DropdownItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
        ${active ? 'text-[var(--accent-red)]' : danger ? 'text-[var(--error)]' : 'text-[var(--sm-text-dim)]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--sm-card-hover)] hover:text-[var(--sm-text)]'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  )
}

// Dropdown Divider
export function DropdownDivider() {
  return <div className="h-px bg-[var(--border-default)] my-1" />
}

// Dropdown Label
export interface DropdownLabelProps {
  children: ReactNode
}

export function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-[var(--sm-text-muted)] uppercase tracking-wide">
      {children}
    </div>
  )
}

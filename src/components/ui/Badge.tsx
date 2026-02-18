import React, { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' },
  primary: { backgroundColor: '#8B0000', color: '#ffffff' },
  secondary: { backgroundColor: 'var(--sm-surface)', color: '#ffffff' },
  success: { backgroundColor: '#10b981', color: '#ffffff' },
  warning: { backgroundColor: '#f59e0b', color: '#ffffff' },
  danger: { backgroundColor: '#ef4444', color: '#ffffff' },
  outline: { border: '1px solid var(--sm-border)', color: 'var(--sm-text-muted)' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}

'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      icon,
      iconPosition = 'left',
      required,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseClasses =
      'w-full h-[42px] px-4 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm font-sans transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-red)] focus:ring-2 focus:ring-[var(--accent-red-glow)] disabled:opacity-50 disabled:cursor-not-allowed'

    const errorClasses = error
      ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-red-500/20'
      : ''

    const iconPadding = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : ''

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            {label}
            {required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`${baseClasses} ${errorClasses} ${iconPadding}`}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
        </div>

        {(error || helper) && (
          <p
            className={`text-xs mt-1 ${error ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}
          >
            {error || helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

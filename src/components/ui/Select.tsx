'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  helper?: string
  required?: boolean
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helper,
      required,
      options,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseClasses =
      'w-full h-[42px] px-4 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm font-sans transition-all duration-200 hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-red)] focus:ring-2 focus:ring-[var(--accent-red-glow)] disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer'

    const errorClasses = error
      ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-red-500/20'
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
          <select
            ref={ref}
            id={inputId}
            className={`${baseClasses} ${errorClasses}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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

Select.displayName = 'Select'

export default Select

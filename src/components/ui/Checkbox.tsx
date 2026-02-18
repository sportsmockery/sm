'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-3 cursor-pointer"
        >
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              className="peer sr-only"
              {...props}
            />
            <div className="w-5 h-5 bg-[var(--sm-surface)] border border-[var(--border-default)] rounded transition-all duration-200 peer-hover:border-[var(--border-strong)] peer-focus:ring-2 peer-focus:ring-[var(--accent-red-glow)] peer-checked:bg-[var(--accent-red)] peer-checked:border-[var(--accent-red)] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
              <svg
                className="w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            {/* Checkmark overlay */}
            <svg
              className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {label && (
            <span className="text-sm text-[var(--sm-text)]">{label}</span>
          )}
        </label>

        {error && <p className="text-xs mt-1 text-[var(--error)]">{error}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox

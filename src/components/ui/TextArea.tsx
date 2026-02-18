'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
  required?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { label, error, helper, required, className = '', id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseClasses =
      'w-full min-h-[100px] px-4 py-3 bg-[var(--sm-surface)] border border-[var(--border-default)] rounded-lg text-[var(--sm-text)] text-sm font-sans transition-all duration-200 placeholder:text-[var(--sm-text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-red)] focus:ring-2 focus:ring-[var(--accent-red-glow)] disabled:opacity-50 disabled:cursor-not-allowed resize-y'

    const errorClasses = error
      ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-red-500/20'
      : ''

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--sm-text-dim)] mb-2"
          >
            {label}
            {required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={`${baseClasses} ${errorClasses}`}
          {...props}
        />

        {(error || helper) && (
          <p
            className={`text-xs mt-1 ${error ? 'text-[var(--error)]' : 'text-[var(--sm-text-muted)]'}`}
          >
            {error || helper}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea

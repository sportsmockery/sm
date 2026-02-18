'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary:
        'bg-[var(--accent-red)] text-white hover:bg-[var(--accent-red-hover)] focus-visible:ring-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]',
      secondary:
        'bg-[var(--sm-surface)] text-[var(--sm-text)] border border-[var(--border-default)] hover:bg-[var(--sm-card-hover)] hover:border-[var(--border-strong)] focus-visible:ring-zinc-400',
      ghost:
        'bg-transparent text-[var(--sm-text-dim)] hover:bg-[var(--sm-card-hover)] hover:text-[var(--sm-text)] focus-visible:ring-zinc-400',
      danger:
        'bg-transparent text-[var(--error)] border border-[var(--error)] hover:bg-[var(--error)] hover:text-white focus-visible:ring-red-500',
      link: 'bg-transparent text-[var(--accent-red)] hover:underline p-0 h-auto focus-visible:ring-red-500',
    }

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }

    const widthClass = fullWidth ? 'w-full' : ''

    const classes = [
      baseClasses,
      variantClasses[variant],
      variant !== 'link' ? sizeClasses[size] : '',
      widthClass,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Loading spinner for button
function LoadingSpinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Icon Button variant
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    }

    return (
      <Button
        ref={ref}
        size={size}
        className={`${sizeClasses[size]} !p-0 ${className}`}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// Button Group
export interface ButtonGroupProps {
  children: ReactNode
  className?: string
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div
      className={`inline-flex rounded-lg overflow-hidden border border-[var(--border-default)] ${className}`}
      role="group"
    >
      {children}
    </div>
  )
}

export default Button

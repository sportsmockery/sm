'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'elevated' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-xl overflow-hidden'

    const variantClasses = {
      default:
        'bg-[var(--bg-card)] border border-[var(--border-default)]',
      glass:
        'bg-white/5 backdrop-blur-lg border border-white/10',
      glow: 'bg-[var(--bg-card)] border border-[var(--border-default)] transition-all duration-300 hover:border-[var(--accent-red)] hover:shadow-[0_0_30px_rgba(255,0,0,0.15)]',
      elevated:
        'bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg',
      interactive:
        'bg-[var(--bg-card)] border border-[var(--border-default)] transition-all duration-200 cursor-pointer hover:translate-y-[-2px] hover:shadow-xl',
    }

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between pb-4 border-b border-[var(--border-default)] mb-4 ${className}`}
      {...props}
    >
      {children || (
        <>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </>
      )}
    </div>
  )
}

// Card Body
export function CardBody({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

// Card Footer
export function CardFooter({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`pt-4 mt-4 border-t border-[var(--border-default)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Stat Card
export interface StatCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    label?: string
  }
  icon?: ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  className = '',
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-2 font-sans">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs font-medium mt-2 ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              {trend.label && (
                <span className="text-[var(--text-muted)]"> {trend.label}</span>
              )}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

export default Card

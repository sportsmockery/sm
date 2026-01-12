'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

export interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  status?: 'online' | 'away' | 'offline'
}

export default function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  className = '',
  status,
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const statusSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
    '2xl': 'w-5 h-5 border-2',
  }

  const statusColors = {
    online: 'bg-[var(--success)]',
    away: 'bg-[var(--warning)]',
    offline: 'bg-[var(--text-muted)]',
  }

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center font-semibold text-[var(--text-secondary)]`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || 'Avatar'}
            fill
            className="object-cover"
          />
        ) : name ? (
          getInitials(name)
        ) : (
          <svg
            className="w-1/2 h-1/2 text-[var(--text-muted)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full border-[var(--bg-primary)]`}
        />
      )}
    </div>
  )
}

// Avatar Group
export interface AvatarGroupProps {
  children: ReactNode
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export function AvatarGroup({
  children,
  max,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children]
  const visibleAvatars = max ? avatars.slice(0, max) : avatars
  const remainingCount = max ? avatars.length - max : 0

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, i) => (
        <div key={i} className="ring-2 ring-[var(--bg-primary)] rounded-full">
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center font-semibold text-[var(--text-secondary)] ring-2 ring-[var(--bg-primary)]`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

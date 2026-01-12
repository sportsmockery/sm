import { ReactNode } from 'react'

interface ArticleGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export default function ArticleGrid({
  children,
  columns = 3,
  className = '',
}: ArticleGridProps) {
  const columnClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 ${columnClasses[columns]} ${className}`}
    >
      {children}
    </div>
  )
}

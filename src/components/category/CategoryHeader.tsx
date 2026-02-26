'use client'

interface CategoryHeaderProps {
  categorySlug: string
  categoryName: string
  postCount: number
  description?: string
  className?: string
}

// Per design spec section 8.1: Use #bc0000 or team-specific color
// For brand consistency, we use the primary red for all categories per spec note
export default function CategoryHeader({
  categoryName,
  postCount,
  description,
  className = '',
}: CategoryHeaderProps) {
  return (
    <header
      className={`relative bg-[#bc0000] py-12 lg:py-16 ${className}`}
      style={{ minHeight: '150px' }}
    >
      <div className="mx-auto max-w-[1110px] px-4">
        <div className="flex flex-col items-center text-center">
          {/* Category name per spec: 36-42px, Montserrat 900, centered, white */}
          <h1
            className="mb-3 text-[36px] lg:text-[42px] font-black uppercase tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {categoryName}
          </h1>

          {/* Description/subtitle per spec: 14-16px, 400 weight, centered */}
          {description && (
            <p
              className="mb-4 max-w-2xl text-[14px] lg:text-[16px] text-white/80"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {description}
            </p>
          )}

          {/* Post count */}
          <p className="text-[13px] text-white/70">
            {postCount.toLocaleString()} {postCount === 1 ? 'Article' : 'Articles'}
          </p>
        </div>
      </div>
    </header>
  )
}

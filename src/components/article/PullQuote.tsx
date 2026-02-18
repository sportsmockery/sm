interface PullQuoteProps {
  quote: string
  attribution?: string
  className?: string
}

export default function PullQuote({
  quote,
  attribution,
  className = '',
}: PullQuoteProps) {
  if (!quote) return null

  return (
    <blockquote
      className={`relative my-8 overflow-hidden rounded-2xl p-8 ${className}`}
      style={{ backgroundColor: 'var(--sm-surface)' }}
    >
      {/* Large quotation mark */}
      <div className="absolute -left-2 -top-4 font-serif text-[120px] leading-none text-[var(--sm-accent)] opacity-20">
        &ldquo;
      </div>

      {/* Quote text */}
      <p className="relative z-10 text-2xl font-medium italic leading-relaxed" style={{ color: 'var(--sm-text)' }}>
        {quote}
      </p>

      {/* Closing quotation mark */}
      <div className="absolute -bottom-16 -right-2 font-serif text-[120px] leading-none text-[var(--sm-accent)] opacity-20">
        &rdquo;
      </div>

      {/* Attribution */}
      {attribution && (
        <footer className="relative z-10 mt-4 flex items-center gap-3">
          <div className="h-px w-8" style={{ backgroundColor: 'var(--sm-accent)' }} />
          <cite className="not-italic text-sm font-semibold" style={{ color: 'var(--sm-accent)' }}>
            {attribution}
          </cite>
        </footer>
      )}
    </blockquote>
  )
}

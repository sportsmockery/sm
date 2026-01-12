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
      className={`relative my-8 overflow-hidden rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-800 ${className}`}
    >
      {/* Large quotation mark */}
      <div className="absolute -left-2 -top-4 font-serif text-[120px] leading-none text-[#8B0000]/20 dark:text-[#FF6666]/20">
        &ldquo;
      </div>

      {/* Quote text */}
      <p className="relative z-10 text-2xl font-medium italic leading-relaxed text-zinc-800 dark:text-zinc-200">
        {quote}
      </p>

      {/* Closing quotation mark */}
      <div className="absolute -bottom-16 -right-2 font-serif text-[120px] leading-none text-[#8B0000]/20 dark:text-[#FF6666]/20">
        &rdquo;
      </div>

      {/* Attribution */}
      {attribution && (
        <footer className="relative z-10 mt-4 flex items-center gap-3">
          <div className="h-px w-8 bg-[#8B0000] dark:bg-[#FF6666]" />
          <cite className="not-italic text-sm font-semibold text-[#8B0000] dark:text-[#FF6666]">
            {attribution}
          </cite>
        </footer>
      )}
    </blockquote>
  )
}

interface FactBoxProps {
  title?: string
  facts: string[]
  className?: string
}

export default function FactBox({
  title = 'Quick Facts',
  facts,
  className = '',
}: FactBoxProps) {
  if (!facts || facts.length === 0) return null

  return (
    <div
      className={`rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 dark:border-blue-900/50 dark:from-blue-950/50 dark:to-blue-900/30 ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/20">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>
        <h3 className="font-heading text-lg font-bold text-blue-900 dark:text-blue-100">
          {title}
        </h3>
      </div>

      {/* Facts list */}
      <ul className="space-y-3">
        {facts.map((fact, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="text-blue-900 dark:text-blue-100">{fact}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

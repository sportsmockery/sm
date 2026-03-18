export function StreakBadge({ type, count }: { type: string; count: number }) {
  if (!type || count === 0) return null
  const isWin = type === 'W'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-medium text-white"
      style={{ backgroundColor: isWin ? '#16a34a' : '#BC0000' }}
    >
      {type}{count}
    </span>
  )
}

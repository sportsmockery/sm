export function VibeBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  )
}

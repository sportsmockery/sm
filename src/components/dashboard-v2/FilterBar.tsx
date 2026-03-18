'use client'

interface FilterOption {
  key: string
  label: string
  color?: string
}

interface FilterBarProps {
  options: FilterOption[]
  selected: string
  onSelect: (key: string) => void
  size?: 'sm' | 'md'
}

export default function FilterBar({ options, selected, onSelect, size = 'sm' }: FilterBarProps) {
  const py = size === 'sm' ? 'py-1' : 'py-1.5'
  const px = size === 'sm' ? 'px-2.5' : 'px-3.5'
  const text = size === 'sm' ? 'text-[11px]' : 'text-xs'

  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ backgroundColor: 'rgba(11,15,20,0.04)' }}
    >
      {options.map((opt) => {
        const isActive = selected === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`${px} ${py} ${text} font-medium rounded-md transition-all`}
            style={{
              backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
              color: isActive ? (opt.color || '#0B0F14') : 'rgba(11,15,20,0.4)',
              boxShadow: isActive ? '0 1px 3px rgba(11,15,20,0.08)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

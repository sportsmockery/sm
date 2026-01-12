'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'

// Dynamic import to avoid SSR issues with react-select
const Select = dynamic(() => import('react-select'), { ssr: false })

interface SelectOption {
  value: string
  label: string
  icon?: string
  avatar?: string
  description?: string
}

interface SearchableSelectProps {
  options: SelectOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  label?: string
  isLoading?: boolean
  isClearable?: boolean
}

// Custom option component for categories with team icons
const CategoryOption = ({ data, innerProps, isSelected, isFocused }: {
  data: SelectOption
  innerProps: React.HTMLAttributes<HTMLDivElement>
  isSelected: boolean
  isFocused: boolean
}) => (
  <div
    {...innerProps}
    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
      isSelected
        ? 'bg-blue-600 text-white'
        : isFocused
        ? 'bg-zinc-100 dark:bg-zinc-800'
        : 'bg-white dark:bg-zinc-900'
    }`}
  >
    {data.icon && (
      <div className="relative h-6 w-6 flex-shrink-0">
        <Image src={data.icon} alt="" fill className="object-contain" />
      </div>
    )}
    <div>
      <div className={`font-medium ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {data.label}
      </div>
      {data.description && (
        <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {data.description}
        </div>
      )}
    </div>
  </div>
)

// Custom option component for authors with avatars
const AuthorOption = ({ data, innerProps, isSelected, isFocused }: {
  data: SelectOption
  innerProps: React.HTMLAttributes<HTMLDivElement>
  isSelected: boolean
  isFocused: boolean
}) => (
  <div
    {...innerProps}
    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
      isSelected
        ? 'bg-blue-600 text-white'
        : isFocused
        ? 'bg-zinc-100 dark:bg-zinc-800'
        : 'bg-white dark:bg-zinc-900'
    }`}
  >
    {data.avatar ? (
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
        <Image src={data.avatar} alt="" fill className="object-cover" />
      </div>
    ) : (
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
          {data.label.charAt(0).toUpperCase()}
        </span>
      </div>
    )}
    <span className={`font-medium ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
      {data.label}
    </span>
  </div>
)

// Custom single value display for categories
const CategorySingleValue = ({ data }: { data: SelectOption }) => (
  <div className="flex items-center gap-2">
    {data.icon && (
      <div className="relative h-5 w-5 flex-shrink-0">
        <Image src={data.icon} alt="" fill className="object-contain" />
      </div>
    )}
    <span className="text-zinc-900 dark:text-zinc-100">{data.label}</span>
  </div>
)

// Custom single value display for authors
const AuthorSingleValue = ({ data }: { data: SelectOption }) => (
  <div className="flex items-center gap-2">
    {data.avatar ? (
      <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
        <Image src={data.avatar} alt="" fill className="object-cover" />
      </div>
    ) : (
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {data.label.charAt(0).toUpperCase()}
        </span>
      </div>
    )}
    <span className="text-zinc-900 dark:text-zinc-100">{data.label}</span>
  </div>
)

export function CategorySelect({
  options,
  value,
  onChange,
  placeholder = 'Select category...',
  label,
  isLoading,
  isClearable = true,
}: SearchableSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value) || null

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}
      <Select
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected ? (selected as SelectOption).value : null)}
        placeholder={placeholder}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Option: CategoryOption as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          SingleValue: CategorySingleValue as any,
        }}
        classNames={{
          control: () =>
            'rounded-lg border border-zinc-300 bg-white px-1 py-0.5 dark:border-zinc-700 dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600',
          menu: () =>
            'mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900',
          menuList: () => 'py-1',
          input: () => 'text-zinc-900 dark:text-zinc-100',
          placeholder: () => 'text-zinc-400 dark:text-zinc-500',
          indicatorSeparator: () => 'hidden',
          dropdownIndicator: () => 'text-zinc-400 dark:text-zinc-500',
          clearIndicator: () => 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
        }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            boxShadow: 'none',
            minHeight: '42px',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'transparent',
          }),
          option: () => ({}),
          singleValue: () => ({}),
        }}
      />
    </div>
  )
}

export function AuthorSelect({
  options,
  value,
  onChange,
  placeholder = 'Select author...',
  label,
  isLoading,
  isClearable = true,
}: SearchableSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value) || null

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}
      <Select
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected ? (selected as SelectOption).value : null)}
        placeholder={placeholder}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Option: AuthorOption as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          SingleValue: AuthorSingleValue as any,
        }}
        classNames={{
          control: () =>
            'rounded-lg border border-zinc-300 bg-white px-1 py-0.5 dark:border-zinc-700 dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600',
          menu: () =>
            'mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900',
          menuList: () => 'py-1',
          input: () => 'text-zinc-900 dark:text-zinc-100',
          placeholder: () => 'text-zinc-400 dark:text-zinc-500',
          indicatorSeparator: () => 'hidden',
          dropdownIndicator: () => 'text-zinc-400 dark:text-zinc-500',
          clearIndicator: () => 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
        }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            boxShadow: 'none',
            minHeight: '42px',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'transparent',
          }),
          option: () => ({}),
          singleValue: () => ({}),
        }}
      />
    </div>
  )
}

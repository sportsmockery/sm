'use client'

import { ReactNode, useState, useMemo } from 'react'

// Table types
export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => ReactNode
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField?: string
  sortable?: boolean
  selectable?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selectedKeys: string[]) => void
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
  stickyHeader?: boolean
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  sortable = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  stickyHeader = false,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (key: string) => {
    if (!sortable) return

    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  // Handle selection
  const allSelected =
    data.length > 0 &&
    data.every((row) => selectedRows.includes(String(row[keyField])))

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(data.map((row) => String(row[keyField])))
    }
  }

  const handleSelectRow = (key: string) => {
    if (selectedRows.includes(key)) {
      onSelectionChange?.(selectedRows.filter((k) => k !== key))
    } else {
      onSelectionChange?.([...selectedRows, key])
    }
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-[var(--border-default)] ${className}`}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--sm-surface)]">
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--sm-surface)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3 font-bold text-xs uppercase tracking-wide text-[var(--sm-text-muted)] border-b border-[var(--border-default)]
                  ${alignClasses[column.align || 'left']}
                  ${stickyHeader ? 'sticky top-0 bg-[var(--sm-surface)] z-10' : ''}
                  ${column.sortable !== false && sortable ? 'cursor-pointer select-none hover:text-[var(--sm-text)]' : ''}
                `}
                style={{ width: column.width }}
                onClick={() =>
                  column.sortable !== false && sortable && handleSort(column.key)
                }
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {column.sortable !== false && sortable && (
                    <SortIndicator
                      active={sortConfig?.key === column.key}
                      direction={
                        sortConfig?.key === column.key
                          ? sortConfig.direction
                          : null
                      }
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-[var(--sm-text-muted)]">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-[var(--sm-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowKey = String(row[keyField])
              const isSelected = selectedRows.includes(rowKey)

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    border-b border-[var(--sm-border)] transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${isSelected ? 'bg-[var(--accent-red-glow)]' : 'hover:bg-[var(--sm-card-hover)]'}
                  `}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowKey)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--sm-surface)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-[var(--sm-text)] ${alignClasses[column.align || 'left']}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : (row[column.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

// Sort Indicator
function SortIndicator({
  active,
  direction,
}: {
  active: boolean
  direction: 'asc' | 'desc' | null
}) {
  return (
    <span className="flex flex-col">
      <svg
        className={`w-3 h-3 -mb-1 ${active && direction === 'asc' ? 'text-[var(--accent-red)]' : 'text-[var(--sm-text-muted)]'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7 14l5-5 5 5z" />
      </svg>
      <svg
        className={`w-3 h-3 ${active && direction === 'desc' ? 'text-[var(--accent-red)]' : 'text-[var(--sm-text-muted)]'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </span>
  )
}

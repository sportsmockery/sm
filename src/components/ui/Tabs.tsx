'use client'

import { useState, ReactNode, createContext, useContext } from 'react'

// Tab Context
type TeamColor = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

interface TabContextType {
  activeTab: string
  setActiveTab: (id: string) => void
  teamColor?: TeamColor
}

const TabContext = createContext<TabContextType | null>(null)

// Tab Group
export interface TabGroupProps {
  defaultTab?: string
  children: ReactNode
  className?: string
  teamColor?: TeamColor
  onChange?: (tabId: string) => void
}

export function TabGroup({
  defaultTab,
  children,
  className = '',
  teamColor,
  onChange,
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || '')

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <TabContext.Provider
      value={{ activeTab, setActiveTab: handleTabChange, teamColor }}
    >
      <div className={className}>{children}</div>
    </TabContext.Provider>
  )
}

// Tab List
export interface TabListProps {
  children: ReactNode
  className?: string
}

export function TabList({ children, className = '' }: TabListProps) {
  return (
    <div
      className={`flex gap-0 border-b border-[var(--border-default)] ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

// Tab
export interface TabProps {
  id: string
  children: ReactNode
  className?: string
  icon?: ReactNode
  disabled?: boolean
}

export function Tab({
  id,
  children,
  className = '',
  icon,
  disabled = false,
}: TabProps) {
  const context = useContext(TabContext)
  if (!context) throw new Error('Tab must be used within TabGroup')

  const { activeTab, setActiveTab, teamColor } = context
  const isActive = activeTab === id

  const teamColors = {
    bears: 'border-[var(--bears-secondary)] text-[var(--bears-secondary)]',
    bulls: 'border-[var(--bulls-primary)] text-[var(--bulls-primary)]',
    cubs: 'border-[var(--cubs-primary)] text-[var(--cubs-primary)]',
    whitesox: 'border-[var(--whitesox-secondary)] text-[var(--whitesox-secondary)]',
    blackhawks: 'border-[var(--blackhawks-primary)] text-[var(--blackhawks-primary)]',
  }

  const activeClass = teamColor
    ? teamColors[teamColor]
    : 'border-[var(--accent-red)] text-[var(--accent-red)]'

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      id={`tab-${id}`}
      disabled={disabled}
      onClick={() => setActiveTab(id)}
      className={`
        px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
        ${isActive ? activeClass : 'border-transparent text-[var(--sm-text-dim)] hover:text-[var(--sm-text)]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

// Tab Panels Container
export interface TabPanelsProps {
  children: ReactNode
  className?: string
}

export function TabPanels({ children, className = '' }: TabPanelsProps) {
  return <div className={className}>{children}</div>
}

// Tab Panel
export interface TabPanelProps {
  id: string
  children: ReactNode
  className?: string
}

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const context = useContext(TabContext)
  if (!context) throw new Error('TabPanel must be used within TabGroup')

  const { activeTab } = context
  const isActive = activeTab === id

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={`animate-fade-in ${className}`}
    >
      {children}
    </div>
  )
}

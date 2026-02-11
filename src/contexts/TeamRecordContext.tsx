'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TeamRecordContextType {
  /** Formatted record string from the hero (e.g., "11-6", "23-22", "21-22-8") */
  record: string | null
  /** Set the record from TeamHubLayout */
  setRecord: (record: string | null) => void
}

const TeamRecordContext = createContext<TeamRecordContextType | undefined>(undefined)

export function TeamRecordProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<string | null>(null)

  return (
    <TeamRecordContext.Provider value={{ record, setRecord }}>
      {children}
    </TeamRecordContext.Provider>
  )
}

export function useTeamRecord() {
  const context = useContext(TeamRecordContext)
  if (!context) {
    throw new Error('useTeamRecord must be used within a TeamRecordProvider')
  }
  return context
}

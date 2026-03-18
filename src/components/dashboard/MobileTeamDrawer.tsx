'use client'

import { useEffect } from 'react'
import type { Team } from './types'
import TeamWorkspace from './TeamWorkspace'

interface Props {
  team: Team | null
  onClose: () => void
}

export default function MobileTeamDrawer({ team, onClose }: Props) {
  // Lock body scroll when open
  useEffect(() => {
    if (team) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [team])

  if (!team) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col lg:hidden"
      style={{ backgroundColor: 'rgba(11,15,20,0.5)' }}
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content */}
      <div
        className="relative mt-12 flex-1 overflow-y-auto rounded-t-2xl animate-slide-up"
        style={{ backgroundColor: '#FAFAFB' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'rgba(11,15,20,0.15)' }}
          />
        </div>

        <div className="px-3 pb-6">
          <TeamWorkspace team={team} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

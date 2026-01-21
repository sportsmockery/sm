'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export type TeamKey = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

export interface TeamOption {
  key: TeamKey
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  league: string
  categorySlug: string
}

export const TEAMS: TeamOption[] = [
  {
    key: 'bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    primaryColor: '#0B162A',
    secondaryColor: '#C83200',
    league: 'NFL',
    categorySlug: 'chicago-bears',
  },
  {
    key: 'bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    league: 'NBA',
    categorySlug: 'chicago-bulls',
  },
  {
    key: 'cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    primaryColor: '#0E3386',
    secondaryColor: '#CC3433',
    league: 'MLB',
    categorySlug: 'chicago-cubs',
  },
  {
    key: 'whitesox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    primaryColor: '#27251F',
    secondaryColor: '#C4CED4',
    league: 'MLB',
    categorySlug: 'chicago-white-sox',
  },
  {
    key: 'blackhawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    primaryColor: '#CF0A2C',
    secondaryColor: '#000000',
    league: 'NHL',
    categorySlug: 'chicago-blackhawks',
  },
]

interface TeamSelectorProps {
  selectedTeam: TeamKey
  onTeamChange?: (team: TeamKey) => void
  className?: string
}

export default function TeamSelector({
  selectedTeam,
  onTeamChange,
  className = '',
}: TeamSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTeamSelect = (teamKey: TeamKey) => {
    if (onTeamChange) {
      onTeamChange(teamKey)
    } else {
      // Update URL with new team
      const params = new URLSearchParams(searchParams.toString())
      params.set('team', teamKey)
      router.push(`/datahub?${params.toString()}`)
    }
  }

  return (
    <div className={`flex flex-wrap justify-center gap-2 md:gap-3 ${className}`}>
      {TEAMS.map((team) => {
        const isSelected = selectedTeam === team.key
        return (
          <button
            key={team.key}
            onClick={() => handleTeamSelect(team.key)}
            className={`
              flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg
              transition-all duration-200 font-medium text-sm border-2
              ${isSelected
                ? 'ring-2 ring-offset-2 ring-offset-[#f5f5f5] dark:ring-offset-[#0a0a0b] shadow-lg scale-105'
                : 'hover:scale-102 opacity-70 hover:opacity-100'
              }
            `}
            style={{
              backgroundColor: isSelected ? team.primaryColor : 'transparent',
              color: isSelected ? 'white' : team.primaryColor,
              borderColor: isSelected ? team.primaryColor : team.primaryColor,
              // @ts-ignore - custom CSS variable for ring color
              '--tw-ring-color': team.secondaryColor,
            } as React.CSSProperties}
          >
            <Image
              src={team.logo}
              alt={team.name}
              width={24}
              height={24}
              className="w-5 h-5 md:w-6 md:h-6"
            />
            <span className="hidden sm:inline">{team.shortName}</span>
            <span className="text-[10px] opacity-60 hidden md:inline">
              {team.league}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function getTeamByKey(key: TeamKey): TeamOption {
  return TEAMS.find((t) => t.key === key) || TEAMS[0]
}

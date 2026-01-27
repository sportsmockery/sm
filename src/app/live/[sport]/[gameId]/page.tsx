'use client'

import { useParams } from 'next/navigation'
import LiveGamePage from '@/components/live/LiveGamePage'

export default function LiveGameRoute() {
  const params = useParams()
  const sport = params?.sport as string
  const gameId = params?.gameId as string

  return <LiveGamePage sport={sport} gameId={gameId} />
}

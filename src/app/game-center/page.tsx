import { Metadata } from 'next'
import GameCenterClient from './GameCenterClient'

export const metadata: Metadata = {
  title: 'Game Center | Live Chicago Sports | SportsMockery',
  description: 'Live scores, stats, and play-by-play for Bears, Bulls, Blackhawks, Cubs, and White Sox games.',
}

export const dynamic = 'force-dynamic'

export default function GameCenterPage() {
  return <GameCenterClient />
}

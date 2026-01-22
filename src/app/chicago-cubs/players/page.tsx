import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCubsPlayers } from '@/lib/cubsData'

export const metadata: Metadata = {
  title: 'Chicago Cubs Players | Roster & Stats | SportsMockery',
  description: 'View all Chicago Cubs players, stats, and profiles. Select any player to see their full statistics and game log.',
}

export const revalidate = 3600

export default async function PlayersIndexPage() {
  const players = await getCubsPlayers()

  if (!players || players.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Players Found</h1>
          <p className="text-zinc-400">Unable to load roster data. Please try again later.</p>
        </div>
      </main>
    )
  }

  // Sort players by jersey number and get the first one
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = typeof a.jerseyNumber === 'number' ? a.jerseyNumber : parseInt(String(a.jerseyNumber)) || 999
    const numB = typeof b.jerseyNumber === 'number' ? b.jerseyNumber : parseInt(String(b.jerseyNumber)) || 999
    return numA - numB
  })

  const firstPlayer = sortedPlayers[0]

  // Redirect to the first player's profile page
  redirect(`/chicago-cubs/players/${firstPlayer.slug}`)
}

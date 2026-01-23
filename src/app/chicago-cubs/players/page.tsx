import { redirect } from 'next/navigation'
import { getCubsPlayers } from '@/lib/cubsData'

export const revalidate = 3600

/**
 * /chicago-cubs/players redirects to the first player by jersey number
 * The individual player page has a switcher to select other players
 */
export default async function PlayersIndexPage() {
  const players = await getCubsPlayers()

  if (!players || players.length === 0) {
    // Redirect to roster if no players found
    redirect('/chicago-cubs/roster')
  }

  // Sort players by jersey number and redirect to first player
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = typeof a.jerseyNumber === 'number' ? a.jerseyNumber : parseInt(String(a.jerseyNumber)) || 999
    const numB = typeof b.jerseyNumber === 'number' ? b.jerseyNumber : parseInt(String(b.jerseyNumber)) || 999
    return numA - numB
  })

  const firstPlayer = sortedPlayers[0]
  redirect(`/chicago-cubs/players/${firstPlayer.slug}`)
}

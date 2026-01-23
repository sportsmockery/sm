import { redirect } from 'next/navigation'
import { getWhiteSoxPlayers } from '@/lib/whitesoxData'

export const revalidate = 3600

/**
 * /chicago-white-sox/players redirects to the first player by jersey number
 * The individual player page has a switcher to select other players
 */
export default async function PlayersIndexPage() {
  const players = await getWhiteSoxPlayers()

  if (!players || players.length === 0) {
    // Redirect to roster if no players found
    redirect('/chicago-white-sox/roster')
  }

  // Sort players by jersey number and redirect to first player
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = typeof a.jerseyNumber === 'number' ? a.jerseyNumber : parseInt(String(a.jerseyNumber)) || 999
    const numB = typeof b.jerseyNumber === 'number' ? b.jerseyNumber : parseInt(String(b.jerseyNumber)) || 999
    return numA - numB
  })

  const firstPlayer = sortedPlayers[0]
  redirect(`/chicago-white-sox/players/${firstPlayer.slug}`)
}

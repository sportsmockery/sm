import { SITE_URL } from '@/lib/seo'

export interface SportsEventGame {
  gameId: string
  date: string
  time?: string | null
  homeTeam: string
  awayTeam: string
  homeScore?: number | null
  awayScore?: number | null
  venue?: string | null
  status: 'scheduled' | 'in_progress' | 'final'
}

function mapEventStatus(status: string): string {
  switch (status) {
    case 'final':
      return 'https://schema.org/EventScheduled'
    case 'in_progress':
      return 'https://schema.org/EventScheduled'
    case 'scheduled':
    default:
      return 'https://schema.org/EventScheduled'
  }
}

export default function SportsEventSchema({ games }: { games: SportsEventGame[] }) {
  if (!games || games.length === 0) return null

  const events = games.map(game => {
    const startDate = game.time
      ? `${game.date}T${game.time}`
      : game.date

    const event: any = {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${game.awayTeam} at ${game.homeTeam}`,
      startDate,
      eventStatus: mapEventStatus(game.status),
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      homeTeam: {
        '@type': 'SportsTeam',
        name: game.homeTeam,
      },
      awayTeam: {
        '@type': 'SportsTeam',
        name: game.awayTeam,
      },
    }

    if (game.venue) {
      event.location = {
        '@type': 'StadiumOrArena',
        name: game.venue,
      }
    }

    if (game.status === 'final' && game.homeScore != null && game.awayScore != null) {
      event.result = {
        '@type': 'SportsEvent',
        homeTeam: { '@type': 'SportsTeam', name: game.homeTeam, score: String(game.homeScore) },
        awayTeam: { '@type': 'SportsTeam', name: game.awayTeam, score: String(game.awayScore) },
      }
    }

    return event
  })

  return (
    <>
      {events.map((event, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}
    </>
  )
}

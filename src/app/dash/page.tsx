import { DashProviders } from './providers'
import { DashContent } from './DashContent'

export const metadata = {
  title: 'City Pulse | Sports Mockery',
  description: 'Chicago sports command center — live scores, team vibes, city mood, debates, and Scout AI.',
}

export default function DashPage() {
  return (
    <DashProviders>
      <DashContent />
    </DashProviders>
  )
}

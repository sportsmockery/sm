import { DashProviders } from './providers'
import { DashContent } from './DashContent'

export const metadata = {
  title: 'Dashboard | Sports Mockery',
  description: 'Chicago sports intelligence dashboard — live scores, team vibes, debates, and Scout AI.',
}

export default function DashPage() {
  return (
    <DashProviders>
      <DashContent />
    </DashProviders>
  )
}

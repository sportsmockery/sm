import { Dash3Providers } from './providers'
import { Dash3Content } from './Dash3Content'

export const metadata = {
  title: 'City Pulse | Sports Mockery',
  description: 'The state of Chicago sports — live scores, team vibes, debates, and Scout AI.',
}

export default function Dash3Page() {
  return (
    <Dash3Providers>
      <Dash3Content />
    </Dash3Providers>
  )
}

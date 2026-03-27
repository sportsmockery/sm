import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fan Hub & Live Chat',
  description: 'Join the conversation with Chicago sports fans. Live chat rooms for Bears, Bulls, Cubs, White Sox, and Blackhawks. AI-powered insights and trending discussions.',
  openGraph: {
    title: 'Fan Hub & Live Chat | Sports Mockery',
    description: 'Connect with Chicago sports fans in real-time. Live chat, AI insights, and trending discussions across all teams.',
    type: 'website',
  },
}

export default function FanHubLayout({ children }: { children: React.ReactNode }) {
  return children
}

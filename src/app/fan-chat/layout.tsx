import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fan Chat | Live Discussion',
  description: 'Chat with fellow Chicago sports fans in real time. AI-powered personalities for every team channel.',
  alternates: { canonical: 'https://sportsmockery.com/fan-chat' },
  openGraph: {
    title: 'Fan Chat | Sports Mockery',
    description: 'Chat with fellow Chicago sports fans in real time. AI-powered personalities for every team channel.',
    images: [{ url: 'https://sportsmockery.com/og-image.png', width: 1200, height: 630 }],
  },
}

export default function FanChatLayout({ children }: { children: React.ReactNode }) {
  return children
}

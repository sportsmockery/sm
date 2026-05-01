import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fan Chat — Live Discussion',
  description: 'Chat with fellow Chicago sports fans in real time. AI-powered personalities for every team channel.',
  // Live-chat threads are ephemeral and authenticated — keep noindex so
  // search engines never surface partial conversations (#43).
  robots: { index: false, follow: false },
}

export default function FanChatLayout({ children }: { children: React.ReactNode }) {
  return children
}

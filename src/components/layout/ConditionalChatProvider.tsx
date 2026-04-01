'use client'
import { usePathname } from 'next/navigation'
import { ChatProvider } from '@/contexts/ChatContext'

const CHAT_ROUTES = ['/', '/chicago-bears', '/chicago-bulls', '/chicago-cubs', '/chicago-white-sox', '/chicago-blackhawks']

export default function ConditionalChatProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const needsChat = CHAT_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (needsChat) {
    const teamSlug = pathname.includes('bulls') ? 'bulls'
      : pathname.includes('cubs') ? 'cubs'
      : pathname.includes('white-sox') ? 'whitesox'
      : pathname.includes('blackhawks') ? 'blackhawks'
      : 'bears'
    return <ChatProvider teamSlug={teamSlug}>{children}</ChatProvider>
  }

  return <>{children}</>
}

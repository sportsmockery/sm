'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChatProvider } from '@/contexts/ChatContext'
import TeamChatPanel from '@/components/chat/TeamChatPanel'

function ChatPageContent() {
  // Auto-open the chat when page loads
  useEffect(() => {
    // The ChatProvider will handle connecting to the Bears room
  }, [])

  return (
    <div className="min-h-screen bg-[#0B162A]">
      {/* Header */}
      <header className="bg-[#0B162A] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-white.png"
              alt="Sports Mockery"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Image
              src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png"
              alt="Chicago Bears"
              width={32}
              height={32}
              className="w-8 h-8"
              unoptimized
            />
            <span className="text-white font-semibold">Bears Fan Chat</span>
          </div>
        </div>
      </header>

      {/* Chat Container - Full Page */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-[#0f0f1a] rounded-2xl overflow-hidden shadow-2xl" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Chat Header */}
          <div className="bg-[#C83803] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Chicago Bears Fan Chat</h1>
                <p className="text-white/80 text-sm">Connect with fellow Bears fans</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Chat Content Area */}
          <div className="flex flex-col h-[calc(100%-72px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-[#C83803]/20 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-[#C83803]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Welcome to Bears Fan Chat!</h2>
                <p className="text-white/60 max-w-md mb-6">
                  Join the conversation with fellow Chicago Bears fans. Discuss games, trades, rumors, and everything Bears football.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  <Link
                    href="/login"
                    className="w-full py-3 px-6 bg-[#C83803] text-white font-semibold rounded-xl hover:bg-[#a52d02] transition-colors text-center"
                  >
                    Sign In to Chat
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full py-3 px-6 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-center"
                  >
                    Create Account
                  </Link>
                </div>
                <p className="text-white/40 text-sm mt-6">
                  Chat is moderated. Be respectful and follow our community guidelines.
                </p>
              </div>
            </div>

            {/* Input Area (disabled for non-logged-in users) */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Sign in to send messages..."
                  disabled
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 cursor-not-allowed"
                />
                <button
                  disabled
                  className="px-6 py-3 bg-[#C83803]/50 text-white/50 font-semibold rounded-xl cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#C83803]/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#C83803]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Live Discussion</h3>
            <p className="text-white/60 text-sm">Chat in real-time during games and breaking news</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#C83803]/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#C83803]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Moderated</h3>
            <p className="text-white/60 text-sm">Safe, friendly environment for all Bears fans</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#C83803]/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#C83803]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">GIFs & Reactions</h3>
            <p className="text-white/60 text-sm">Express yourself with GIFs and emoji reactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider teamSlug="bears">
      <ChatPageContent />
    </ChatProvider>
  )
}

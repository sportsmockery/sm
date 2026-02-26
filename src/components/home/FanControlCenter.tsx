'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function FanControlCenter() {
  return (
    <section className="py-8 md:py-10 lg:py-12" style={{ backgroundColor: 'var(--sm-surface)' }}>
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)' }}
          >
            Chicago Fan Control Center
          </h2>
          <p
            className="text-sm md:text-base max-w-xl mx-auto"
            style={{ color: 'var(--sm-text-muted)' }}
          >
            Connect with fellow fans and get instant answers about your Chicago teams
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Fan Chat Card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, #0B162A 0%, #1a2d4d 100%)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C83803] opacity-20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ff6b35] opacity-10 rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-[#C83803] flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>

              {/* Content */}
              <h3
                className="text-xl md:text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Fan Chat
              </h3>
              <p className="text-white/70 text-sm md:text-base mb-6 leading-relaxed">
                Live game threads, instant reactions and unfiltered Chicago takes. Join thousands of fans discussing every play.
              </p>

              {/* Live Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live Now
                </span>
              </div>

              {/* CTA */}
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C83803] text-white font-semibold rounded-xl hover:bg-[#a52d02] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Open Fan Chat
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Scout AI Card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#bc0000] opacity-20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ff4444] opacity-10 rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#bc0000] to-[#ff4444] flex items-center justify-center mb-5">
                <Image
                  src="/downloads/scout-v2.png"
                  alt="Scout AI"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </div>

              {/* Content */}
              <h3
                className="text-xl md:text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Scout AI
              </h3>
              <p className="text-white/70 text-sm md:text-base mb-6 leading-relaxed">
                Ask about strategy, trades, history and stats for your Chicago teams. Get instant, intelligent answers.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Stats', 'History', 'Matchups', 'Trades'].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/scout-ai"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Scout AI Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

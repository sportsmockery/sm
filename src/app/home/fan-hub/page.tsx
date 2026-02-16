'use client'

import Link from 'next/link'
import Image from 'next/image'

const ROOMS = [
  { name: 'Bears Den', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', online: 342, active: true },
  { name: 'Bulls Court', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', online: 218 },
  { name: 'Cubs Dugout', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', online: 156 },
  { name: 'Sox Clubhouse', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', online: 89 },
  { name: 'Hawks Rink', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', online: 127 },
]

const CHAT_MESSAGES = [
  { user: 'BearDown_Mike', text: 'Caleb Williams is going to be elite this season', time: '2m ago' },
  { user: 'ChiTownFan', text: 'That O-line improvement is no joke. Top 10 unit now.', time: '1m ago' },
  { isAI: true, text: 'The Bears offensive line allowed only 28 sacks last season, ranking 11th in the NFL. With the additions in free agency, a top-10 finish is realistic.', time: 'just now' },
]

const TRENDING = [
  'Bears mock draft predictions',
  'Bulls trade deadline targets',
  'Cubs spring training updates',
  'Blackhawks prospect watch',
]

export default function FanHubPage() {
  return (
    <>
      {/* Hero */}
      <section className="hm-page-hero">
        <div className="hm-page-hero-bg" />
        <div className="hm-scan-line" />
        <div className="hm-hero-content hm-fade-in" style={{ position: 'relative', zIndex: 2 }}>
          <span className="hm-tag" style={{ marginBottom: 24 }}>Community</span>
          <h1>The <span className="hm-gradient-text">Fan Hub</span></h1>
          <p>Real-time chat rooms for every Chicago team. AI-powered personalities. Polls. Trending topics. Your home for Chicago sports conversation.</p>
        </div>
      </section>

      {/* Fan Layout */}
      <div className="hm-container" style={{ paddingBottom: 120 }}>
        <div className="hm-fan-layout hm-fade-in">
          {/* Room List */}
          <div className="hm-room-list">
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Chat Rooms</h4>
            {ROOMS.map((room) => (
              <div key={room.name} className={`hm-room-item ${room.active ? 'hm-room-active' : ''}`}>
                <img src={room.logo} alt={room.name} className="hm-room-logo" width={32} height={32} />
                <div style={{ flex: 1 }}>
                  <div className="hm-room-name">{room.name}</div>
                  <div className="hm-room-online">{room.online} online</div>
                </div>
                {room.active && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                )}
              </div>
            ))}
          </div>

          {/* Chat Window */}
          <div className="hm-fan-chat">
            <div className="hm-chat-header">
              <img src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" alt="Bears" width={24} height={24} style={{ borderRadius: '50%' }} />
              <span>Bears Den</span>
              <span className="hm-chat-model">342 online</span>
            </div>
            <div className="hm-chat-messages" style={{ flex: 1 }}>
              {CHAT_MESSAGES.map((msg, i) => (
                <div key={i}>
                  {msg.isAI ? (
                    <div className="hm-chat-msg hm-chat-msg-ai" style={{ display: 'flex', gap: 10, maxWidth: '90%' }}>
                      <Image src="/downloads/scout-v2.png" alt="AI" width={24} height={24} style={{ borderRadius: '50%', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: '#ff4444', fontWeight: 600, marginBottom: 4 }}>Bears AI Bot</div>
                        {msg.text}
                        <div style={{ fontSize: 10, color: '#55556a', marginTop: 6 }}>{msg.time}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#ff4444' }}>{msg.user}</span>
                        <span style={{ fontSize: 10, color: '#55556a' }}>{msg.time}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#8a8a9a', marginTop: 2 }}>{msg.text}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hm-chat-input">
              <input className="hm-chat-input-field" type="text" placeholder="Type a message..." readOnly />
              <button className="hm-chat-send" aria-label="Send">&rarr;</button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hm-fan-sidebar">
            {/* Poll */}
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Live Poll</h4>
            <div className="hm-poll-card">
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Bears biggest need?</div>
              {[
                { label: 'Offensive Line', pct: 42 },
                { label: 'Edge Rusher', pct: 31 },
                { label: 'Cornerback', pct: 18 },
                { label: 'Wide Receiver', pct: 9 },
              ].map((opt) => (
                <div key={opt.label} className="hm-poll-option">
                  <div className="hm-poll-fill" style={{ width: `${opt.pct}%` }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{opt.label}</span>
                  <span style={{ position: 'relative', zIndex: 1, marginLeft: 'auto', fontWeight: 600 }}>{opt.pct}%</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#55556a', marginTop: 8 }}>1,247 votes</div>
            </div>

            {/* Trending */}
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 20 }}>Trending</h4>
            {TRENDING.map((topic, i) => (
              <div key={topic} className="hm-trending-item">
                <span className="hm-trending-rank">{i + 1}</span>
                <span style={{ color: '#8a8a9a', fontSize: 13 }}>{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <Link href="/fan-chat" className="hm-btn-primary">
            Join the Conversation &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}

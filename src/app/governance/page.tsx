import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fan Senate | Governance - Sports Mockery',
  description: 'Shape the conversation. Vote on proposals, submit ideas, and make your voice heard in Chicago sports discourse.',
}

const activeProposals = [
  {
    id: '1', title: 'Should the Bears pursue a veteran QB in free agency?',
    description: 'With the current QB situation uncertain, should the Bears invest significant cap space in a proven veteran quarterback, or continue developing through the draft?',
    votesFor: 3420, votesAgainst: 1890, endsIn: '2 days', team: 'Bears', teamColor: '#C83200', author: 'ChicagoFan85', comments: 234,
  },
  {
    id: '2', title: 'Bulls: Full rebuild or competitive retool?',
    description: 'The Bulls are at a crossroads. Should they trade away veteran assets for picks and young talent, or make moves to compete now around the current core?',
    votesFor: 2156, votesAgainst: 2098, endsIn: '5 days', team: 'Bulls', teamColor: '#CE1141', author: 'BullsNation', comments: 189,
  },
  {
    id: '3', title: 'Cubs should prioritize pitching over hitting',
    description: 'In the upcoming offseason, should the Cubs focus their resources on building a dominant rotation, or invest in impact bats to support the young core?',
    votesFor: 1876, votesAgainst: 1654, endsIn: '7 days', team: 'Cubs', teamColor: '#0E3386', author: 'WrigleyResident', comments: 156,
  },
]

const pastProposals = [
  { id: '101', title: 'Bears should draft defense in Round 1', result: 'passed', votesFor: 4521, votesAgainst: 2134, team: 'Bears', teamColor: '#C83200' },
  { id: '102', title: 'Bulls should extend Coby White', result: 'passed', votesFor: 3245, votesAgainst: 1876, team: 'Bulls', teamColor: '#CE1141' },
  { id: '103', title: 'Sox should fire manager mid-season', result: 'rejected', votesFor: 2134, votesAgainst: 3456, team: 'White Sox', teamColor: '#27251F' },
]

export default function GovernancePage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '64px 16px 48px', borderBottom: '1px solid var(--sm-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--sm-radius-lg)', marginBottom: '24px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(59,130,246,0.3)',
          }}>
            <svg style={{ width: 40, height: 40, color: '#fff' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: 'var(--sm-text)', marginBottom: '16px',
            fontFamily: "Barlow, var(--font-heading), sans-serif",
          }}>
            Fan Senate
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--sm-text-muted)', maxWidth: '640px', marginBottom: '32px', lineHeight: 1.6 }}>
            Your voice shapes the conversation. Vote on hot-button issues, submit proposals,
            and see where Chicago fans truly stand.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--sm-text)' }}>{activeProposals.length}</div>
              <div style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>Active Proposals</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#3b82f6' }}>15.2K</div>
              <div style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>Total Votes Cast</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#6366f1' }}>892</div>
              <div style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>Active Senators</div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Proposal CTA */}
      <section style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <div className="glass-card glass-card-static" style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '24px 28px',
        }}>
          <div>
            <h3 style={{ fontWeight: 700, color: 'var(--sm-text)', marginBottom: '4px' }}>Have a burning question for the fanbase?</h3>
            <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', margin: 0 }}>Submit a proposal and let the people decide.</p>
          </div>
          <button className="btn-primary">Submit Proposal</button>
        </div>
      </section>

      {/* Active Proposals */}
      <section style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '16px 16px 32px' }}>
        <h2 style={{
          fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', color: 'var(--sm-text)',
          fontFamily: "Barlow, var(--font-heading), sans-serif", marginBottom: '24px',
        }}>
          Active Proposals
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeProposals.map((proposal) => {
            const total = proposal.votesFor + proposal.votesAgainst
            const percentage = Math.round((proposal.votesFor / total) * 100)

            return (
              <div key={proposal.id} className="glass-card glass-card-static" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="sm-tag" style={{ background: `${proposal.teamColor}20`, color: proposal.teamColor, borderColor: `${proposal.teamColor}30` }}>
                        {proposal.team}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--sm-text-muted)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                        {proposal.endsIn} left
                      </span>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--sm-text)' }}>{proposal.title}</h3>
                  </div>
                </div>

                <p style={{ color: 'var(--sm-text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>{proposal.description}</p>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>Yes: {percentage}%</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>No: {100 - percentage}%</span>
                  </div>
                  <div style={{ position: 'relative', height: 16, overflow: 'hidden', borderRadius: '9999px', background: 'var(--sm-surface)' }}>
                    <div style={{
                      position: 'absolute', inset: 0, right: `${100 - percentage}%`, borderRadius: '9999px',
                      background: 'linear-gradient(90deg, #059669, #10b981)',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sm-text-muted)', marginTop: '8px' }}>
                    <span>{proposal.votesFor.toLocaleString()} votes</span>
                    <span>{proposal.votesAgainst.toLocaleString()} votes</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
                    <span>by @{proposal.author}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                      {proposal.comments} comments
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-sm" style={{ borderRadius: 'var(--sm-radius-md)', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'none', fontWeight: 600, cursor: 'pointer', padding: '8px 16px', fontSize: '14px' }}>
                      Vote Yes
                    </button>
                    <button className="btn-sm" style={{ borderRadius: 'var(--sm-radius-md)', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', fontWeight: 600, cursor: 'pointer', padding: '8px 16px', fontSize: '14px' }}>
                      Vote No
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Past Proposals */}
      <section style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '16px 16px 32px' }}>
        <h2 style={{
          fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', color: 'var(--sm-text)',
          fontFamily: "Barlow, var(--font-heading), sans-serif", marginBottom: '24px',
        }}>
          Past Proposals
        </h2>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {pastProposals.map((proposal) => {
            const total = proposal.votesFor + proposal.votesAgainst
            const percentage = Math.round((proposal.votesFor / total) * 100)
            const passed = proposal.result === 'passed'

            return (
              <div key={proposal.id} className="glass-card glass-card-static" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="sm-tag" style={{ fontSize: '10px', background: `${proposal.teamColor}20`, color: proposal.teamColor, borderColor: `${proposal.teamColor}30` }}>
                    {proposal.team}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px',
                    background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: passed ? '#10b981' : '#ef4444',
                  }}>
                    {passed ? 'Passed' : 'Rejected'}
                  </span>
                </div>
                <h4 style={{ fontWeight: 600, color: 'var(--sm-text)', marginBottom: '12px', fontSize: '15px' }}>{proposal.title}</h4>
                <div style={{ position: 'relative', height: 8, overflow: 'hidden', borderRadius: '9999px', background: 'var(--sm-surface)' }}>
                  <div style={{
                    position: 'absolute', inset: 0, right: `${100 - percentage}%`, borderRadius: '9999px',
                    background: passed ? '#10b981' : '#ef4444',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sm-text-muted)', marginTop: '8px' }}>
                  <span>Yes: {percentage}%</span>
                  <span>{total.toLocaleString()} votes</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '16px 16px 48px' }}>
        <h2 style={{
          fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', color: 'var(--sm-text)',
          fontFamily: "Barlow, var(--font-heading), sans-serif", marginBottom: '24px',
        }}>
          How It Works
        </h2>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {[
            { step: '01', title: 'Submit or Vote', description: 'Create proposals for the community or cast your vote on active discussions.' },
            { step: '02', title: 'Community Decides', description: 'Proposals are open for voting for 7 days. Every registered user gets one vote.' },
            { step: '03', title: 'Results Published', description: 'Results are published and inform our editorial direction and coverage focus.' },
          ].map((item) => (
            <div key={item.step} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--sm-text-dim)', marginBottom: '16px' }}>{item.step}</div>
              <h3 style={{ fontWeight: 700, color: 'var(--sm-text)', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Back link */}
      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 16px 64px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--sm-text-muted)', textDecoration: 'none' }}>
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}

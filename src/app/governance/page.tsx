import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fan Senate | Governance - Sports Mockery',
  description: 'Shape the conversation. Vote on proposals, submit ideas, and make your voice heard in Chicago sports discourse.',
}

const activeProposals = [
  {
    id: '1',
    title: 'Should the Bears pursue a veteran QB in free agency?',
    description: 'With the current QB situation uncertain, should the Bears invest significant cap space in a proven veteran quarterback, or continue developing through the draft?',
    votesFor: 3420,
    votesAgainst: 1890,
    endsIn: '2 days',
    team: 'Bears',
    teamColor: '#C83200',
    author: 'ChicagoFan85',
    comments: 234,
  },
  {
    id: '2',
    title: 'Bulls: Full rebuild or competitive retool?',
    description: 'The Bulls are at a crossroads. Should they trade away veteran assets for picks and young talent, or make moves to compete now around the current core?',
    votesFor: 2156,
    votesAgainst: 2098,
    endsIn: '5 days',
    team: 'Bulls',
    teamColor: '#CE1141',
    author: 'BullsNation',
    comments: 189,
  },
  {
    id: '3',
    title: 'Cubs should prioritize pitching over hitting',
    description: 'In the upcoming offseason, should the Cubs focus their resources on building a dominant rotation, or invest in impact bats to support the young core?',
    votesFor: 1876,
    votesAgainst: 1654,
    endsIn: '7 days',
    team: 'Cubs',
    teamColor: '#0E3386',
    author: 'WrigleyResident',
    comments: 156,
  },
]

const pastProposals = [
  { id: '101', title: 'Bears should draft defense in Round 1', result: 'passed', votesFor: 4521, votesAgainst: 2134, team: 'Bears', teamColor: '#C83200' },
  { id: '102', title: 'Bulls should extend Coby White', result: 'passed', votesFor: 3245, votesAgainst: 1876, team: 'Bulls', teamColor: '#CE1141' },
  { id: '103', title: 'Sox should fire manager mid-season', result: 'rejected', votesFor: 2134, votesAgainst: 3456, team: 'White Sox', teamColor: '#27251F' },
]

export default function GovernancePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24" style={{ borderBottom: '1px solid var(--sm-border)' }}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>

            <h1 className="mb-4 font-heading text-4xl font-black sm:text-5xl lg:text-6xl" style={{ color: 'var(--sm-text)' }}>
              Fan{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Senate
              </span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg" style={{ color: 'var(--sm-text-muted)' }}>
              Your voice shapes the conversation. Vote on hot-button issues, submit proposals,
              and see where Chicago fans truly stand.
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-black" style={{ color: 'var(--sm-text)' }}>{activeProposals.length}</div>
                <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Active Proposals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-400">15.2K</div>
                <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Total Votes Cast</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-indigo-400">892</div>
                <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Active Senators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Proposal CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 sm:flex-row">
          <div>
            <h3 className="font-bold" style={{ color: 'var(--sm-text)' }}>Have a burning question for the fanbase?</h3>
            <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Submit a proposal and let the people decide.</p>
          </div>
          <button className="whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 font-bold text-white transition-all hover:from-blue-400 hover:to-indigo-400">
            Submit Proposal
          </button>
        </div>
      </section>

      {/* Active Proposals */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--sm-text)' }}>
            Active Proposals
          </h2>
        </div>

        <div className="space-y-6">
          {activeProposals.map((proposal) => {
            const total = proposal.votesFor + proposal.votesAgainst
            const percentage = Math.round((proposal.votesFor / total) * 100)

            return (
              <div
                key={proposal.id}
                className="group rounded-2xl p-6 transition-all"
                style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${proposal.teamColor}20`, color: proposal.teamColor }}
                      >
                        {proposal.team}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                        {proposal.endsIn} left
                      </span>
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--sm-text)' }}>{proposal.title}</h3>
                  </div>
                </div>

                <p className="mb-6" style={{ color: 'var(--sm-text-muted)' }}>{proposal.description}</p>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-emerald-400">Yes: {percentage}%</span>
                    <span className="font-semibold text-red-400">No: {100 - percentage}%</span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                    <span>{proposal.votesFor.toLocaleString()} votes</span>
                    <span>{proposal.votesAgainst.toLocaleString()} votes</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                    <span>by @{proposal.author}</span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                      {proposal.comments} comments
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/30">
                      Vote Yes
                    </button>
                    <button className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30">
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
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--sm-text-muted), var(--sm-text-dim))' }} />
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--sm-text)' }}>
            Past Proposals
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pastProposals.map((proposal) => {
            const total = proposal.votesFor + proposal.votesAgainst
            const percentage = Math.round((proposal.votesFor / total) * 100)
            const passed = proposal.result === 'passed'

            return (
              <div
                key={proposal.id}
                className="rounded-xl p-5"
                style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${proposal.teamColor}20`, color: proposal.teamColor }}
                  >
                    {proposal.team}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    passed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {passed ? 'Passed' : 'Rejected'}
                  </span>
                </div>

                <h4 className="mb-3 font-semibold" style={{ color: 'var(--sm-text)' }}>{proposal.title}</h4>

                <div className="relative h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      passed ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <span>Yes: {percentage}%</span>
                  <span>{total.toLocaleString()} votes</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--sm-text)' }}>
            How It Works
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: '01', title: 'Submit or Vote', description: 'Create proposals for the community or cast your vote on active discussions.' },
            { step: '02', title: 'Community Decides', description: 'Proposals are open for voting for 7 days. Every registered user gets one vote.' },
            { step: '03', title: 'Results Published', description: 'Results are published and inform our editorial direction and coverage focus.' },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl p-6"
              style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
            >
              <div className="mb-4 text-4xl font-black" style={{ color: 'var(--sm-text-dim)' }}>{item.step}</div>
              <h3 className="mb-2 font-bold" style={{ color: 'var(--sm-text)' }}>{item.title}</h3>
              <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--sm-text-muted)' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}

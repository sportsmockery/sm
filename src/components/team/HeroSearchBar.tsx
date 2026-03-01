'use client'

export default function HeroSearchBar({ teamName }: { teamName: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '12px',
      }}
    >
      <div
        className="hero-search-bar"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 16px',
          borderRadius: 'var(--sm-radius-pill)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'default',
          transition: 'border-color 0.2s',
        }}
      >
        <svg
          width="13"
          height="13"
          fill="none"
          stroke="var(--sm-text-dim)"
          strokeWidth={2}
          viewBox="0 0 24 24"
          style={{ flexShrink: 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <span
          style={{
            color: 'var(--sm-text-dim)',
            fontFamily: "Barlow, sans-serif",
            fontSize: '12px',
            fontWeight: 400,
            whiteSpace: 'nowrap',
          }}
        >
          Search {teamName}...
        </span>
      </div>
    </div>
  )
}

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
          position: 'relative',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="var(--sm-text-dim)"
          strokeWidth={2}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder={`Search ${teamName}...`}
          readOnly
          style={{
            width: '100%',
            padding: '8px 14px 8px 34px',
            borderRadius: 'var(--sm-radius-pill)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--sm-text-dim)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px',
            fontWeight: 400,
            outline: 'none',
            cursor: 'default',
            transition: 'border-color 0.2s',
          }}
        />
      </div>
    </div>
  )
}

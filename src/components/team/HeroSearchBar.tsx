'use client'

export default function HeroSearchBar({ teamName }: { teamName: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
      }}
    >
      <div
        className="hero-search-bar"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="var(--sm-text-muted)"
          strokeWidth={2}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            left: '14px',
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
          placeholder={`Search ${teamName} tools & content...`}
          readOnly
          style={{
            width: '100%',
            padding: '12px 16px 12px 42px',
            borderRadius: 'var(--sm-radius-pill)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--sm-border)',
            color: 'var(--sm-text-muted)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            outline: 'none',
            cursor: 'default',
            backdropFilter: 'blur(8px)',
            transition: 'border-color 0.2s',
          }}
        />
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Digital Collectibles | NFT Marketplace - Sports Mockery',
  description: 'Collect unique digital moments from Chicago sports history. Exclusive NFTs featuring Bears, Bulls, Cubs, White Sox, and Blackhawks.',
}

const collections = [
  {
    id: 'bears-legends',
    name: 'Bears Legends',
    description: 'Iconic moments from Bears history',
    items: 156,
    floorPrice: '0.5 ETH',
    gradient: 'linear-gradient(135deg, #0B162A, #C83200)',
  },
  {
    id: 'bulls-dynasty',
    name: 'Bulls Dynasty',
    description: 'Relive the championship glory',
    items: 234,
    floorPrice: '0.8 ETH',
    gradient: 'linear-gradient(135deg, #CE1141, #000000)',
  },
  {
    id: 'cubs-historic',
    name: 'Cubs Historic',
    description: 'From Wrigley with love',
    items: 189,
    floorPrice: '0.6 ETH',
    gradient: 'linear-gradient(135deg, #0E3386, #CC3433)',
  },
  {
    id: 'sox-moments',
    name: 'Sox Moments',
    description: 'South Side pride on chain',
    items: 112,
    floorPrice: '0.4 ETH',
    gradient: 'linear-gradient(135deg, #27251F, #4a4a4a)',
  },
  {
    id: 'hawks-glory',
    name: 'Hawks Glory',
    description: 'Championship ice memories',
    items: 98,
    floorPrice: '0.45 ETH',
    gradient: 'linear-gradient(135deg, #CF0A2C, #000000)',
  },
]

const featuredNFTs = [
  {
    id: '1',
    name: '1985 Bears Super Bowl Shuffle',
    collection: 'Bears Legends',
    rarity: 'legendary',
    price: '5.0 ETH',
    edition: '1 of 85',
  },
  {
    id: '2',
    name: 'MJ Last Shot 1998',
    collection: 'Bulls Dynasty',
    rarity: 'legendary',
    price: '10.0 ETH',
    edition: '1 of 23',
  },
  {
    id: '3',
    name: 'Cubs World Series Final Out',
    collection: 'Cubs Historic',
    rarity: 'legendary',
    price: '8.5 ETH',
    edition: '1 of 108',
  },
]

export default function CollectiblesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <section className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--sm-border)', padding: '64px 0' }}>
        <div className="sm-grid-overlay" />

        <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Badge */}
            <span className="sm-tag" style={{ marginBottom: '24px' }}>
              <span className="pulse-dot" />
              Marketplace Coming Soon
            </span>

            {/* Title */}
            <h1 style={{
              marginBottom: '16px',
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 900,
              color: 'var(--sm-text)',
              fontFamily: 'var(--sm-font-heading)',
              lineHeight: 1.1,
            }}>
              Digital{' '}
              <span style={{ background: 'var(--sm-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Collectibles
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{ marginBottom: '32px', maxWidth: '640px', fontSize: 'var(--text-lg)', color: 'var(--sm-text-muted)', lineHeight: 1.6 }}>
              Own a piece of Chicago sports history. Exclusive NFTs featuring legendary moments
              from your favorite teams, verified on the blockchain.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--sm-text)' }}>789</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-dim)' }}>Total NFTs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--accent-red)' }}>5</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-dim)' }}>Collections</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--sm-text)' }}>0.4 ETH</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-dim)' }}>Floor Price</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '6px', height: '32px', borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-gradient)' }} />
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', color: 'var(--sm-text)' }}>
            Featured Collectibles
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {featuredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="glass-card"
              style={{ overflow: 'hidden', border: '1px solid rgba(255,180,0,0.2)' }}
            >
              {/* Image placeholder */}
              <div style={{
                aspectRatio: '1',
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(180,120,0,0.3), var(--sm-surface))',
              }}>
                {/* Trophy icon */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '80px', height: '80px', color: 'rgba(255,180,0,0.2)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                  </svg>
                </div>

                {/* Rarity badge */}
                <span className="sm-tag" style={{ position: 'absolute', left: '12px', top: '12px', background: 'rgba(255,180,0,0.2)', color: '#fbbf24' }}>
                  Legendary
                </span>

                {/* Edition badge */}
                <span style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  borderRadius: 'var(--sm-radius-pill)',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '4px 12px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                }}>
                  {nft.edition}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: '20px' }}>
                <p style={{ marginBottom: '4px', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24' }}>
                  {nft.collection}
                </p>
                <h3 style={{ marginBottom: '12px', fontWeight: 700, color: 'var(--sm-text)' }}>{nft.name}</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--sm-text-dim)' }}>Current Price</p>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--sm-text)' }}>{nft.price}</p>
                  </div>
                  <button className="btn btn-sm" style={{ background: 'var(--sm-gradient)', color: '#fff', borderRadius: 'var(--sm-radius-md)', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '6px', height: '32px', borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-gradient)' }} />
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', color: 'var(--sm-text)' }}>
            Collections
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="glass-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: collection.gradient,
                padding: '24px',
              }}
            >
              <div style={{ position: 'relative' }}>
                {/* Icon placeholder */}
                <div style={{
                  marginBottom: '16px',
                  display: 'flex',
                  width: '56px',
                  height: '56px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--sm-radius-md)',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <svg style={{ width: '28px', height: '28px', color: '#fff' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                  </svg>
                </div>

                <h3 style={{ marginBottom: '4px', fontSize: 'var(--text-xl)', fontWeight: 700, color: '#fff' }}>{collection.name}</h3>
                <p style={{ marginBottom: '16px', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>{collection.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--text-sm)' }}>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Items:</span>
                    <span style={{ marginLeft: '4px', fontWeight: 700, color: '#fff' }}>{collection.items}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Floor:</span>
                    <span style={{ marginLeft: '4px', fontWeight: 700, color: '#fff' }}>{collection.floorPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '48px 16px' }}>
        <div className="glass-card" style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--sm-gradient-subtle)',
          padding: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
        }}>
          <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 900, color: 'var(--sm-text)' }}>
              Get Early Access
            </h2>
            <p style={{ marginBottom: '32px', color: 'var(--sm-text-muted)' }}>
              Be the first to know when our NFT marketplace launches. Early supporters get exclusive drops and whitelist access.
            </p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-md btn-primary"
                style={{ width: '100%' }}
              >
                Join Waitlist
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px 64px' }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)', textDecoration: 'none' }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}

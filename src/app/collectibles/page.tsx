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
    gradient: 'from-[#0B162A] to-[#C83200]',
  },
  {
    id: 'bulls-dynasty',
    name: 'Bulls Dynasty',
    description: 'Relive the championship glory',
    items: 234,
    floorPrice: '0.8 ETH',
    gradient: 'from-[#CE1141] to-[#000000]',
  },
  {
    id: 'cubs-historic',
    name: 'Cubs Historic',
    description: 'From Wrigley with love',
    items: 189,
    floorPrice: '0.6 ETH',
    gradient: 'from-[#0E3386] to-[#CC3433]',
  },
  {
    id: 'sox-moments',
    name: 'Sox Moments',
    description: 'South Side pride on chain',
    items: 112,
    floorPrice: '0.4 ETH',
    gradient: 'from-[#27251F] to-[#4a4a4a]',
  },
  {
    id: 'hawks-glory',
    name: 'Hawks Glory',
    description: 'Championship ice memories',
    items: 98,
    floorPrice: '0.45 ETH',
    gradient: 'from-[#CF0A2C] to-[#000000]',
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

const rarityColors = {
  common: 'text-zinc-400 bg-zinc-500/20',
  rare: 'text-blue-400 bg-blue-500/20',
  epic: 'text-purple-400 bg-purple-500/20',
  legendary: 'text-amber-400 bg-amber-500/20',
}

export default function CollectiblesPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800 py-16 lg:py-24">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-pink-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-500/20 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
              </span>
              <span className="text-sm font-semibold text-pink-300">Marketplace Coming Soon</span>
            </div>

            {/* Title */}
            <h1 className="mb-4 font-heading text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              Digital{' '}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Collectibles
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-2xl text-lg text-zinc-400">
              Own a piece of Chicago sports history. Exclusive NFTs featuring legendary moments
              from your favorite teams, verified on the blockchain.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-black text-white">789</div>
                <div className="text-sm text-zinc-500">Total NFTs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-pink-400">5</div>
                <div className="text-sm text-zinc-500">Collections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">0.4 ETH</div>
                <div className="text-sm text-zinc-500">Floor Price</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Featured Collectibles
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-zinc-900 transition-all hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/20"
            >
              {/* Legendary glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

              {/* Image placeholder */}
              <div className="relative aspect-square overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/50 to-zinc-900">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%)] bg-[size:12px_12px]" />

                  {/* Trophy icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-20 w-20 text-amber-500/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                    </svg>
                  </div>
                </div>

                {/* Rarity badge */}
                <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${rarityColors.legendary}`}>
                  Legendary
                </div>

                {/* Edition badge */}
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {nft.edition}
                </div>
              </div>

              {/* Info */}
              <div className="relative p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {nft.collection}
                </p>
                <h3 className="mb-3 font-bold text-white">{nft.name}</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Current Price</p>
                    <p className="text-lg font-bold text-white">{nft.price}</p>
                  </div>
                  <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-amber-400">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-pink-500 to-purple-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Collections
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${collection.gradient} p-6 transition-transform hover:scale-[1.02]`}
            >
              {/* Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Glow */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />

              <div className="relative">
                {/* Icon placeholder */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                  </svg>
                </div>

                <h3 className="mb-1 text-xl font-bold text-white">{collection.name}</h3>
                <p className="mb-4 text-sm text-white/70">{collection.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Items:</span>
                    <span className="ml-1 font-bold text-white">{collection.items}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Floor:</span>
                    <span className="ml-1 font-bold text-white">{collection.floorPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-900 to-purple-900 p-8 sm:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-xl text-center">
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Get Early Access
            </h2>
            <p className="mb-8 text-pink-200/80">
              Be the first to know when our NFT marketplace launches. Early supporters get exclusive drops and whitelist access.
            </p>

            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-white px-6 py-3 font-bold text-pink-900 transition-all hover:bg-pink-100"
              >
                Join Waitlist
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
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

/**
 * Homepage components export
 *
 * SSR Components (guaranteed rendering):
 * - InfoDeck, FeaturedShell, LatestStream, SeasonalFocus, EvergreenClassics
 *
 * Legacy Components:
 * - HeroCarousel, TeamSpotlight, HomepageTimeline, PersonalizedFeed
 */

// SSR Homepage Components - guaranteed to render with fallback data
export { InfoDeck } from './InfoDeck'
export { FeaturedShell } from './FeaturedShell'
export { LatestStream } from './LatestStream'
export { SeasonalFocus } from './SeasonalFocus'
export { EvergreenClassics } from './EvergreenClassics'

// Legacy components (client-side)
export { default as HeroCarousel } from './HeroCarousel'
export { default as TeamSpotlight } from './TeamSpotlight'
export { default as HomepageTimeline } from './HomepageTimeline'
export { default as PersonalizedFeed } from './PersonalizedFeed'

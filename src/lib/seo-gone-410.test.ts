import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { LEGACY_GONE_410 } from './seo-gone-410'

describe('LEGACY_GONE_410', () => {
  describe('toxic backlink author paths (PR: extend 410 middleware)', () => {
    it('returns 410 for /author/the-importance-reputable-casino-slot-play/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/the-importance-reputable-casino-slot-play/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/the-importance-reputable-casino-slot-play'), true)
    })

    it('returns 410 for /author/safe-place-to-do-betting-in-2023/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/safe-place-to-do-betting-in-2023/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/safe-place-to-do-betting-in-2023'), true)
    })

    it('returns 410 for /author/anything-with-casino-in-slug/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/anything-with-casino-in-slug/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/anything-with-casino-in-slug'), true)
    })

    it('returns 410 for /author/exploring-the-deliciou-world-of-hhc/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/exploring-the-deliciou-world-of-hhc/'), true)
    })

    it('returns 410 for /author/soccer-event-thats-bridging-continents/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/soccer-event-thats-bridging-continents/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/soccer-event-thats-bridging-continents'), true)
    })

    it('returns 410 for /author/Understanding-The-Fast-Fashion/ (and lowercase variant)', () => {
      assert.equal(LEGACY_GONE_410.test('/author/Understanding-The-Fast-Fashion/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/understanding-the-fast-fashion/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/Understanding-The-Fast-Fashion'), true)
    })

    it('returns 410 for /author/a-comprehensive-overview-of-current-research/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/a-comprehensive-overview-of-current-research/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/a-comprehensive-overview-of-current-research'), true)
    })

    it('returns 410 for /author/nordik-eyewear-making-waves-in-the-industry/', () => {
      assert.equal(LEGACY_GONE_410.test('/author/nordik-eyewear-making-waves-in-the-industry/'), true)
      assert.equal(LEGACY_GONE_410.test('/author/nordik-eyewear-making-waves-in-the-industry'), true)
    })

    it('does NOT 410 /author/john-smith (regression for legitimate author)', () => {
      assert.equal(LEGACY_GONE_410.test('/author/john-smith'), false)
      assert.equal(LEGACY_GONE_410.test('/author/john-smith/'), false)
    })

    it('returns 410 for various spam-keyword author slugs', () => {
      const toxicSlugs = [
        '/author/best-online-slot-machines',
        '/author/poker-strategy-guide',
        '/author/sportsbook-tips-2024',
        '/author/lottery-winners',
        '/author/bet-365-review',
        '/author/cbd-oil-benefits',
        '/author/crypto-gambling-tips',
        '/author/escort-service-guide',
        '/author/vape-shop-reviews',
      ]
      for (const path of toxicSlugs) {
        assert.equal(LEGACY_GONE_410.test(path), true, `expected ${path} to match`)
      }
    })

    it('does NOT 410 legitimate author pages', () => {
      const legitSlugs = [
        '/author/john-smith',
        '/author/legitimate-author-name',
        '/author/jane-doe',
        '/author/chris-burhans',
        '/author/sm-staff',
        '/author/mike-jones',
      ]
      for (const path of legitSlugs) {
        assert.equal(LEGACY_GONE_410.test(path), false, `expected ${path} NOT to match`)
        assert.equal(LEGACY_GONE_410.test(path + '/'), false, `expected ${path}/ NOT to match`)
      }
    })
  })

  describe('existing PR #92 patterns (regression checks)', () => {
    it('still returns 410 for /tag/foo', () => {
      assert.equal(LEGACY_GONE_410.test('/tag/foo'), true)
      assert.equal(LEGACY_GONE_410.test('/tag/foo/'), true)
    })

    it('still returns 410 for /app-pages/anything', () => {
      assert.equal(LEGACY_GONE_410.test('/app-pages'), true)
      assert.equal(LEGACY_GONE_410.test('/app-pages/'), true)
      assert.equal(LEGACY_GONE_410.test('/app-pages/some-orphan'), true)
    })

    it('still returns 410 for /cart-2, /checkout, /apply, /advertise', () => {
      assert.equal(LEGACY_GONE_410.test('/cart-2'), true)
      assert.equal(LEGACY_GONE_410.test('/checkout'), true)
      assert.equal(LEGACY_GONE_410.test('/apply'), true)
      assert.equal(LEGACY_GONE_410.test('/advertise'), true)
    })

    it('does NOT 410 /chicago-bears (regression)', () => {
      assert.equal(LEGACY_GONE_410.test('/chicago-bears'), false)
      assert.equal(LEGACY_GONE_410.test('/chicago-bulls'), false)
      assert.equal(LEGACY_GONE_410.test('/chicago-cubs'), false)
      assert.equal(LEGACY_GONE_410.test('/chicago-white-sox'), false)
      assert.equal(LEGACY_GONE_410.test('/chicago-blackhawks'), false)
    })

    it('does NOT 410 the homepage or other content paths', () => {
      assert.equal(LEGACY_GONE_410.test('/'), false)
      assert.equal(LEGACY_GONE_410.test('/scout-ai'), false)
      assert.equal(LEGACY_GONE_410.test('/gm'), false)
      assert.equal(LEGACY_GONE_410.test('/mock-draft'), false)
    })
  })
})

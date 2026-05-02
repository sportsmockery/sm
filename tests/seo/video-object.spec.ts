import { test, expect } from '@playwright/test'

test('Bears Film Room embeds use youtube-nocookie.com', async ({ request }) => {
  const res = await request.get('/bears-film-room')
  expect(res.status(), '/bears-film-room returned non-2xx').toBeLessThan(400)
  const html = await res.text()

  // Should use youtube-nocookie.com for privacy-enhanced embeds
  const hasNoCookie = html.includes('youtube-nocookie.com/embed/')
  expect(hasNoCookie, 'expected youtube-nocookie.com embed URL').toBeTruthy()

  // Should NOT contain bare youtube.com/embed/ (non-nocookie)
  const iframes = html.match(/src="https:\/\/www\.youtube\.com\/embed\//g) || []
  expect(iframes.length, 'expected no bare youtube.com/embed/ iframes').toBe(0)
})

test('Bears Film Room includes VideoObject JSON-LD', async ({ request }) => {
  const res = await request.get('/bears-film-room')
  expect(res.status()).toBeLessThan(400)
  const html = await res.text()

  // Extract all JSON-LD scripts
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []
  const videoObjects = jsonLdMatches
    .map((match) => {
      const json = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '')
      try {
        return JSON.parse(json.replace(/\\u003c/g, '<'))
      } catch {
        return null
      }
    })
    .filter((obj) => obj?.['@type'] === 'VideoObject')

  expect(videoObjects.length, 'expected at least one VideoObject JSON-LD').toBeGreaterThanOrEqual(1)

  const video = videoObjects[0]
  expect(video['@context']).toBe('https://schema.org')
  expect(video.name).toBeTruthy()
  expect(video.description).toBeTruthy()
  expect(video.uploadDate).toBeTruthy()
  expect(video.embedUrl).toContain('youtube-nocookie.com')
  expect(video.contentUrl).toContain('youtube.com/watch?v=')
  expect(video.thumbnailUrl).toBeTruthy()
})

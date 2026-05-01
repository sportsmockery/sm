import { test, expect } from '@playwright/test'

const SAMPLE_PATHS = [
  '/',
  '/chicago-bears',
  '/chicago-cubs',
  '/scout-ai',
  '/gm',
  '/owner',
  '/vision-theater',
]

const APEX_HOST = 'sportsmockery.com'

for (const path of SAMPLE_PATHS) {
  test(`canonical points to apex on ${path}`, async ({ request }) => {
    const res = await request.get(path)
    expect(res.status(), `${path} returned non-2xx`).toBeLessThan(400)
    const html = await res.text()
    const match = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    expect(match, `no canonical link found on ${path}`).toBeTruthy()
    const href = match![1]
    expect(href, `canonical href is empty on ${path}`).toBeTruthy()
    const url = new URL(href)
    expect(url.protocol, `${path} canonical must be https`).toBe('https:')
    expect(url.host, `${path} canonical must be apex (no www., no test.)`).toBe(APEX_HOST)
  })
}

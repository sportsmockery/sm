import { SITE_URL } from './constants'

export function canonicalUrl(path: string): string {
  const cleaned = path.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (cleaned.startsWith('http')) {
    const u = new URL(cleaned)
    u.host = 'sportsmockery.com'
    u.protocol = 'https:'
    const out = u.toString().replace(/\/+$/, '')
    return out === 'https://sportsmockery.com' ? `${SITE_URL}/` : out
  }
  if (cleaned === '' || cleaned === '/') return `${SITE_URL}/`
  return `${SITE_URL}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`
}

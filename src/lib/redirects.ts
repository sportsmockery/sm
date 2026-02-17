/**
 * Client-side utilities for the first-time visitor redirect system.
 * Reads/clears the sm_intended_destination cookie set by middleware.
 */

export function getIntendedDestination(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  const match = cookies.find(c => c.trim().startsWith('sm_intended_destination='))

  if (match) {
    const value = decodeURIComponent(match.split('=')[1])
    // Validate: must start with / and not // (prevent open redirect)
    if (value.startsWith('/') && !value.startsWith('//')) {
      return value
    }
  }

  return null
}

export function clearIntendedDestination(): void {
  if (typeof document === 'undefined') return
  document.cookie = 'sm_intended_destination=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

export function getIntendedOrFallback(fallback: string = '/'): string {
  const destination = getIntendedDestination()
  if (destination) {
    clearIntendedDestination()
    return destination
  }
  return fallback
}

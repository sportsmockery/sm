'use client'

import { useEffect, useState } from 'react'

interface AdPlacement {
  id: number
  name: string
  placement_type: string
  html_code: string
  css_code?: string
  is_active: boolean
  priority: number
  conditions?: {
    device_type?: 'all' | 'mobile' | 'desktop'
    min_paragraph?: number
  }
}

interface AdRendererProps {
  placement: string
  className?: string
}

/**
 * Ad Renderer Component
 *
 * Fetches and renders ads for a specific placement location.
 * Handles device targeting and priority sorting.
 *
 * Usage:
 * <AdRenderer placement="AFTER_FEATURED_IMAGE" />
 * <AdRenderer placement="SIDEBAR" />
 * <AdRenderer placement="IN_CONTENT_PARAGRAPH_3" />
 */
export default function AdRenderer({ placement, className = '' }: AdRendererProps) {
  const [ads, setAds] = useState<AdPlacement[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Fetch ads from cache or API
    fetchAds()

    return () => window.removeEventListener('resize', checkMobile)
  }, [placement])

  const fetchAds = async () => {
    try {
      // Try to get from sessionStorage cache first
      const cacheKey = `ads_${placement}`
      const cached = sessionStorage.getItem(cacheKey)

      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setAds(data)
          return
        }
      }

      const res = await fetch('/api/admin/ads')
      const data = await res.json()

      const filteredAds = (data.ads || [])
        .filter((ad: AdPlacement) =>
          ad.is_active &&
          ad.placement_type === placement
        )
        .sort((a: AdPlacement, b: AdPlacement) => a.priority - b.priority)

      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: filteredAds,
        timestamp: Date.now(),
      }))

      setAds(filteredAds)
    } catch (error) {
      console.error('Failed to fetch ads:', error)
    }
  }

  // Filter ads based on device
  const visibleAds = ads.filter(ad => {
    const deviceType = ad.conditions?.device_type || 'all'
    if (deviceType === 'all') return true
    if (deviceType === 'mobile' && isMobile) return true
    if (deviceType === 'desktop' && !isMobile) return true
    return false
  })

  if (visibleAds.length === 0) return null

  return (
    <div className={`ad-container ad-container--${placement.toLowerCase()} ${className}`}>
      {visibleAds.map((ad) => (
        <div key={ad.id} className="ad-slot" data-ad-id={ad.id}>
          {/* Custom CSS */}
          {ad.css_code && (
            <style dangerouslySetInnerHTML={{ __html: ad.css_code }} />
          )}
          {/* Ad HTML */}
          <div
            className="ad-content"
            dangerouslySetInnerHTML={{ __html: ad.html_code }}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Insert ads into article content HTML
 *
 * Usage in server component:
 * const contentWithAds = await insertAdsIntoContent(content, ads)
 */
export function insertAdsIntoContent(
  content: string,
  ads: AdPlacement[],
  paragraphCount: number
): string {
  if (!ads || ads.length === 0) return content

  // Find paragraph ads
  const paragraphAds = ads
    .filter(ad => ad.is_active && ad.placement_type.startsWith('IN_CONTENT_PARAGRAPH'))
    .sort((a, b) => a.priority - b.priority)

  if (paragraphAds.length === 0) return content

  // Split content by paragraphs
  const paragraphRegex = /(<\/p>)/gi
  const parts = content.split(paragraphRegex)

  let result = ''
  let pCount = 0

  for (let i = 0; i < parts.length; i++) {
    result += parts[i]

    // Check if this is a closing </p> tag
    if (parts[i].toLowerCase() === '</p>') {
      pCount++

      // Check if any ad should be inserted after this paragraph
      for (const ad of paragraphAds) {
        const targetParagraph = parseInt(ad.placement_type.replace('IN_CONTENT_PARAGRAPH_', '')) || 3
        const minParagraphs = ad.conditions?.min_paragraph || targetParagraph

        if (pCount === targetParagraph && paragraphCount >= minParagraphs) {
          result += `
            <div class="ad-container ad-container--in-content" data-ad-id="${ad.id}">
              ${ad.css_code ? `<style>${ad.css_code}</style>` : ''}
              <div class="ad-content">${ad.html_code}</div>
            </div>
          `
        }
      }
    }
  }

  return result
}

/**
 * Count paragraphs in HTML content
 */
export function countParagraphs(content: string): number {
  const matches = content.match(/<\/p>/gi)
  return matches ? matches.length : 0
}

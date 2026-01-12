import { NextRequest, NextResponse } from 'next/server'
import {
  getTopPosts,
  getTrendingPosts,
  getViewsByDate,
  getCategoryBreakdown,
  getSiteStats,
} from '@/lib/analytics'

// POST: Log analytics events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    // Log analytics event (in production, store in database)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', { type, ...data })
    }

    // Store events in database or send to analytics service
    // For now, we just acknowledge receipt
    switch (type) {
      case 'pageview':
        // Track page view
        break
      case 'event':
        // Track custom event
        break
      case 'scroll_depth':
        // Track scroll milestone
        break
      case 'time_on_page':
        // Track time spent on page
        break
      default:
        // Unknown event type
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log analytics' },
      { status: 500 }
    )
  }
}

// GET: Retrieve analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') || 'overview'
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const days = parseInt(searchParams.get('days') || '30', 10)

    let data: unknown

    switch (dataType) {
      case 'overview':
        data = await getSiteStats()
        break

      case 'top_posts':
        data = await getTopPosts(limit)
        break

      case 'trending':
        data = await getTrendingPosts(limit)
        break

      case 'views_by_date':
        data = await getViewsByDate(days)
        break

      case 'category_breakdown':
        data = await getCategoryBreakdown()
        break

      case 'all':
        const [stats, topPosts, trending, viewsByDate, categories] = await Promise.all([
          getSiteStats(),
          getTopPosts(limit),
          getTrendingPosts(limit),
          getViewsByDate(days),
          getCategoryBreakdown(),
        ])
        data = {
          stats,
          topPosts,
          trending,
          viewsByDate,
          categories,
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid data type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getTopPosts } from '@/lib/analytics'

export async function GET() {
  try {
    const posts = await getTopPosts(5)
    return NextResponse.json(posts, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

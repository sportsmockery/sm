import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Public read-only API for ChatGPT and external consumers.
 * GET /api/public?type=articles|teams|live|search&q=...&team=bears&limit=10
 *
 * No auth required. Returns JSON with CORS headers.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') || 'articles'
  const team = searchParams.get('team')
  const q = searchParams.get('q')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503, headers: CORS_HEADERS }
      )
    }

    switch (type) {
      case 'articles':
        return await getArticles({ team, q, limit })
      case 'teams':
        return await getTeams()
      case 'live':
        return await getLiveGames()
      case 'search':
        return await searchArticles(q || '', limit)
      default:
        return NextResponse.json(
          {
            error: 'Invalid type. Use: articles, teams, live, search',
            usage: {
              articles: '/api/public?type=articles&team=bears&limit=10',
              search: '/api/public?type=search&q=caleb+williams&limit=10',
              teams: '/api/public?type=teams',
              live: '/api/public?type=live',
            },
          },
          { status: 400, headers: CORS_HEADERS }
        )
    }
  } catch (err) {
    console.error('[public-api]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

async function getArticles({ team, q, limit }: { team: string | null; q: string | null; limit: number }) {
  let query = supabaseAdmin!
    .from('sm_posts')
    .select('id,title,slug,excerpt,featured_image,published_at,views,category:sm_categories!category_id(slug,name),author:sm_authors!author_id(display_name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (team) {
    // Map team slug to category slug
    const teamMap: Record<string, string> = {
      bears: 'bears',
      bulls: 'bulls',
      cubs: 'cubs',
      blackhawks: 'blackhawks',
      'white-sox': 'white-sox',
      whitesox: 'white-sox',
    }
    const catSlug = teamMap[team.toLowerCase()]
    if (catSlug) {
      const { data: cat } = await supabaseAdmin!
        .from('sm_categories')
        .select('id')
        .eq('slug', catSlug)
        .single()
      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }
  }

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
  }

  const articles = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    url: `https://test.sportsmockery.com/${p.category?.slug || 'news'}/${p.slug}`,
    excerpt: p.excerpt,
    image: p.featured_image,
    author: p.author?.display_name || 'SM Staff',
    team: p.category?.name || null,
    published_at: p.published_at,
    views: p.views,
  }))

  return NextResponse.json(
    { count: articles.length, articles },
    { headers: CORS_HEADERS }
  )
}

async function searchArticles(q: string, limit: number) {
  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const { data, error } = await supabaseAdmin!
    .from('sm_posts')
    .select('id,title,slug,excerpt,featured_image,published_at,category:sm_categories!category_id(slug,name),author:sm_authors!author_id(display_name)')
    .eq('status', 'published')
    .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
  }

  const articles = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    url: `https://test.sportsmockery.com/${p.category?.slug || 'news'}/${p.slug}`,
    excerpt: p.excerpt,
    image: p.featured_image,
    author: p.author?.display_name || 'SM Staff',
    team: p.category?.name || null,
    published_at: p.published_at,
  }))

  return NextResponse.json(
    { query: q, count: articles.length, articles },
    { headers: CORS_HEADERS }
  )
}

async function getTeams() {
  const teams = [
    { key: 'bears', name: 'Chicago Bears', sport: 'NFL', url: 'https://test.sportsmockery.com/chicago-bears' },
    { key: 'bulls', name: 'Chicago Bulls', sport: 'NBA', url: 'https://test.sportsmockery.com/chicago-bulls' },
    { key: 'cubs', name: 'Chicago Cubs', sport: 'MLB', url: 'https://test.sportsmockery.com/chicago-cubs' },
    { key: 'blackhawks', name: 'Chicago Blackhawks', sport: 'NHL', url: 'https://test.sportsmockery.com/chicago-blackhawks' },
    { key: 'white-sox', name: 'Chicago White Sox', sport: 'MLB', url: 'https://test.sportsmockery.com/chicago-white-sox' },
  ]

  return NextResponse.json({ teams }, { headers: CORS_HEADERS })
}

async function getLiveGames() {
  const { data: registry } = await supabaseAdmin!
    .from('live_games_registry')
    .select('*')
    .in('status', ['in_progress', 'live', 'halftime'])

  if (!registry || registry.length === 0) {
    return NextResponse.json(
      { live: false, message: 'No Chicago games currently live', games: [] },
      { headers: CORS_HEADERS }
    )
  }

  return NextResponse.json(
    { live: true, count: registry.length, games: registry },
    { headers: CORS_HEADERS }
  )
}

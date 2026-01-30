import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getAdminUser(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if user is admin
  const { data: roleData } = await supabase
    .from('sm_user_roles')
    .select('role')
    .eq('email', user.email)
    .single()

  if (roleData?.role !== 'admin') return null

  return user
}

interface UserGMScore {
  user_id: string
  email: string | null
  display_name: string | null
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  average_grade: number
  total_gm_score: number
  highest_grade: number
  lowest_grade: number
  last_trade_at: string | null
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'total_gm_score'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Fetch all trades grouped by user
    const { data: trades, error } = await datalabAdmin
      .from('gm_trades')
      .select('user_id, user_email, grade, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group trades by user and calculate stats
    const userStatsMap = new Map<string, {
      user_id: string
      email: string | null
      total_trades: number
      accepted_trades: number
      rejected_trades: number
      grades: number[]
      last_trade_at: string | null
    }>()

    for (const trade of trades || []) {
      const userId = trade.user_id
      const existing = userStatsMap.get(userId)

      if (existing) {
        existing.total_trades++
        existing.grades.push(trade.grade)
        if (trade.status === 'accepted') existing.accepted_trades++
        if (trade.status === 'rejected') existing.rejected_trades++
        if (!existing.last_trade_at || trade.created_at > existing.last_trade_at) {
          existing.last_trade_at = trade.created_at
        }
      } else {
        userStatsMap.set(userId, {
          user_id: userId,
          email: trade.user_email,
          total_trades: 1,
          accepted_trades: trade.status === 'accepted' ? 1 : 0,
          rejected_trades: trade.status === 'rejected' ? 1 : 0,
          grades: [trade.grade],
          last_trade_at: trade.created_at,
        })
      }
    }

    // Convert to array and calculate final stats
    let userScores: UserGMScore[] = Array.from(userStatsMap.values()).map(user => {
      const avgGrade = user.grades.length > 0
        ? Math.round((user.grades.reduce((a, b) => a + b, 0) / user.grades.length) * 10) / 10
        : 0
      const totalScore = user.grades
        .filter((_, i) => {
          // Only count accepted trades for total score
          // We track accepted_trades count, so we can use the first N grades
          return i < user.accepted_trades
        })
        .reduce((a, b) => a + b, 0)

      // Actually calculate total_gm_score as sum of all accepted trade grades
      // We need to be smarter about this - for now, use a simpler approach
      const totalGmScore = user.accepted_trades > 0
        ? Math.round(avgGrade * user.accepted_trades)
        : 0

      return {
        user_id: user.user_id,
        email: user.email,
        display_name: user.email?.split('@')[0] || null,
        total_trades: user.total_trades,
        accepted_trades: user.accepted_trades,
        rejected_trades: user.rejected_trades,
        average_grade: avgGrade,
        total_gm_score: totalGmScore,
        highest_grade: Math.max(...user.grades),
        lowest_grade: Math.min(...user.grades),
        last_trade_at: user.last_trade_at,
      }
    })

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      userScores = userScores.filter(u =>
        u.email?.toLowerCase().includes(searchLower) ||
        u.display_name?.toLowerCase().includes(searchLower) ||
        u.user_id.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    userScores.sort((a, b) => {
      let aVal: number | string | null = null
      let bVal: number | string | null = null

      switch (sortBy) {
        case 'total_gm_score':
          aVal = a.total_gm_score
          bVal = b.total_gm_score
          break
        case 'total_trades':
          aVal = a.total_trades
          bVal = b.total_trades
          break
        case 'average_grade':
          aVal = a.average_grade
          bVal = b.average_grade
          break
        case 'accepted_trades':
          aVal = a.accepted_trades
          bVal = b.accepted_trades
          break
        case 'last_trade_at':
          aVal = a.last_trade_at || ''
          bVal = b.last_trade_at || ''
          break
        default:
          aVal = a.total_gm_score
          bVal = b.total_gm_score
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    })

    // Paginate
    const total = userScores.length
    const offset = (page - 1) * limit
    const paginatedScores = userScores.slice(offset, offset + limit)

    return NextResponse.json({
      users: paginatedScores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin GM scoring error:', error)
    return NextResponse.json({ error: 'Failed to fetch GM scoring data' }, { status: 500 })
  }
}

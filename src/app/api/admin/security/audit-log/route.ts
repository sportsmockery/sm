import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/admin/security/audit-log
 * Returns recent audit log entries for the security dashboard.
 * Requires admin authentication.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { data: logs, error } = await supabaseAdmin
      .from('security_audit_log')
      .select('id, user_id, action, resource_type, resource_id, details, ip_address, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[Security] Audit log fetch error:', error.message)
      return NextResponse.json({ logs: [] })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch {
    return NextResponse.json({ logs: [] })
  }
}

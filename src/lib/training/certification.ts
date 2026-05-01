/**
 * EDGE certification gate for the article publishing flow.
 *
 * Authors must be EDGE certified before publishing Authority Articles.
 * Editors and admins bypass the gate.
 *
 * To wire into article publishing, call this helper at the publish boundary:
 *
 *   const result = await requireEdgeCertification(user.id)
 *   if (!result.allowed) {
 *     return Response.json({ error: result.reason }, { status: 403 })
 *   }
 *
 * The gate is intentionally additive — it does not block any flow until you
 * call it. See `src/app/api/admin/posts` for where to insert.
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import type { Role } from '@/lib/roles'

export interface EdgeCertResult {
  allowed: boolean
  reason: string
  role: Role | null
  certified: boolean
}

export async function requireEdgeCertification(
  userId: string,
): Promise<EdgeCertResult> {
  if (!userId) {
    return {
      allowed: false,
      reason: 'No user — authentication required.',
      role: null,
      certified: false,
    }
  }

  const { data: userRow } = await supabaseAdmin
    .from('sm_users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  const role = (userRow?.role as Role | undefined) ?? null

  if (role === 'admin' || role === 'editor') {
    return { allowed: true, reason: 'Editor/admin override.', role, certified: true }
  }

  if (role !== 'author') {
    return {
      allowed: false,
      reason: 'Only authors, editors, and admins may publish.',
      role,
      certified: false,
    }
  }

  const { data: cert } = await supabaseAdmin
    .from('writer_training_certifications')
    .select('certified')
    .eq('user_id', userId)
    .maybeSingle()

  const certified = cert?.certified === true

  return {
    allowed: certified,
    reason: certified
      ? 'EDGE certified.'
      : 'EDGE certification required to publish Authority Articles.',
    role,
    certified,
  }
}

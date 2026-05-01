/**
 * Server-side guard for the /training experience.
 *
 * Mirrors the requireAdmin() pattern from src/lib/admin-auth.ts but allows
 * the broader staff set (author | editor | admin). Returns a discriminated
 * union the page can switch on, without throwing.
 */

import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Role } from '@/lib/roles'

export const TRAINING_ALLOWED_ROLES: Role[] = ['admin', 'editor', 'author']

export type TrainingAccess =
  | { ok: true; userId: string; email?: string; role: Role }
  | { ok: false; status: 401 | 403; error: string }

export async function requireTrainingAccess(
  request?: NextRequest,
): Promise<TrainingAccess> {
  const user = await getAuthUser(request)
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' }
  }

  const { data } = await supabaseAdmin
    .from('sm_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = data?.role as Role | undefined

  if (!role || !TRAINING_ALLOWED_ROLES.includes(role)) {
    return {
      ok: false,
      status: 403,
      error: 'You do not have access to writer training.',
    }
  }

  return { ok: true, userId: user.id, email: user.email, role }
}

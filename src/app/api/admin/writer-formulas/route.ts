import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { isValidFormula } from '@/lib/payment-formula'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: {
    id?: number | string
    formula_description?: string
    formula_code?: string
    effective_from?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, formula_description, formula_code, effective_from } = body

  if (id === undefined || id === null) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  if (!formula_description?.trim()) {
    return NextResponse.json({ error: 'formula_description required' }, { status: 400 })
  }
  if (!isValidFormula(formula_code)) {
    return NextResponse.json(
      {
        error:
          'Invalid formula. Allowed: digits, whitespace, + - * / ( ) . _ % < > ? : and the variables `posts` and `views`.',
      },
      { status: 400 }
    )
  }

  const update: Record<string, unknown> = {
    formula_description: formula_description.trim(),
    formula_code,
    updated_at: new Date().toISOString(),
  }
  if (effective_from) update.effective_from = effective_from

  const { data, error } = await supabaseAdmin
    .from('writer_payment_formulas')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, formula: data })
}

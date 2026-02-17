import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export async function PATCH(req: NextRequest) {
  try {
    const { cardId, newStatus } = await req.json()

    if (!cardId || !newStatus) {
      return NextResponse.json({ error: 'cardId and newStatus are required' }, { status: 400 })
    }

    const validStatuses = ['draft', 'review', 'approved', 'published', 'archived']
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const { error } = await datalabAdmin
      .from('stat_cards')
      .update({ status: newStatus })
      .eq('id', cardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { cardId } = await req.json()

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const { error } = await datalabAdmin
      .from('stat_cards')
      .delete()
      .eq('id', cardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

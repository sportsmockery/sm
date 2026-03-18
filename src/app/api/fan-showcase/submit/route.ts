import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { validateSubmission, generateSlug } from '@/lib/fan-showcase/validation'
import {
  detectNonChicagoFlag,
  calculateRelevanceScore,
  generateCaptions,
} from '@/lib/fan-showcase/ai-helpers'
import type { SubmitFormData } from '@/types/fan-showcase'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SubmitFormData>

    // Server-side validation
    const errors = validateSubmission(body)
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const data = body as SubmitFormData

    // Find or create creator
    const { data: existingCreator } = await datalabAdmin
      .from('fan_creators')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    let creatorId: string

    if (existingCreator) {
      // Update existing creator
      const { error: updateErr } = await datalabAdmin
        .from('fan_creators')
        .update({
          display_name: data.creator_name,
          handle: data.creator_handle,
          bio: data.creator_bio || null,
          profile_url: data.profile_url || null,
          primary_team: data.team,
          content_focus: data.type,
          social_tag_permission: data.social_tag_permission,
          newsletter_feature_permission: data.newsletter_feature_permission,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCreator.id)

      if (updateErr) {
        console.error('Error updating creator:', updateErr)
        return NextResponse.json({ error: 'Failed to update creator profile.' }, { status: 500 })
      }
      creatorId = existingCreator.id
    } else {
      const { data: newCreator, error: createErr } = await datalabAdmin
        .from('fan_creators')
        .insert({
          display_name: data.creator_name,
          handle: data.creator_handle,
          email: data.email,
          bio: data.creator_bio || null,
          profile_url: data.profile_url || null,
          primary_team: data.team,
          content_focus: data.type,
          social_tag_permission: data.social_tag_permission,
          newsletter_feature_permission: data.newsletter_feature_permission,
        })
        .select('id')
        .single()

      if (createErr || !newCreator) {
        console.error('Error creating creator:', createErr)
        return NextResponse.json({ error: 'Failed to create creator profile.' }, { status: 500 })
      }
      creatorId = newCreator.id
    }

    // AI helper fields
    const nonChicagoFlag = detectNonChicagoFlag(
      data.title,
      data.description,
      data.written_take || null,
      data.source_url || null
    )

    const { score, reason } = calculateRelevanceScore({
      title: data.title,
      description: data.description,
      written_take: data.written_take || null,
      source_url: data.source_url || null,
      type: data.type,
      team: data.team,
    })

    const [caption1, caption2, caption3] = generateCaptions(data.type, data.team)

    const slug = generateSlug(data.title)

    // Create submission
    const { data: submission, error: subErr } = await datalabAdmin
      .from('fan_submissions')
      .insert({
        slug,
        creator_id: creatorId,
        type: data.type,
        team: data.team,
        title: data.title,
        description: data.description,
        written_take: data.written_take || null,
        source_platform: data.source_platform || null,
        source_url: data.source_url || null,
        medium: data.medium || null,
        league_name: data.league_name || null,
        fantasy_platform: data.fantasy_platform || null,
        brag_line: data.brag_line || null,
        status: 'pending_review',
        rights_agreed: data.rights_agreed,
        moderation_acknowledged: data.moderation_acknowledged,
        ownership_confirmed: data.ownership_confirmed,
        non_infringement_confirmed: data.non_infringement_confirmed,
        ai_relevance_score: score,
        ai_relevance_reason: reason,
        ai_non_chicago_flag: nonChicagoFlag,
        ai_caption_1: caption1,
        ai_caption_2: caption2,
        ai_caption_3: caption3,
      })
      .select('id, slug')
      .single()

    if (subErr || !submission) {
      console.error('Error creating submission:', subErr)
      return NextResponse.json({ error: 'Failed to create submission.' }, { status: 500 })
    }

    // Log moderation event
    await datalabAdmin.from('fan_moderation_events').insert({
      submission_id: submission.id,
      action: 'submitted',
      previous_status: null,
      new_status: 'pending_review',
      note: 'Submission received',
    })

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      slug: submission.slug,
    })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

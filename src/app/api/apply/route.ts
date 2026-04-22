import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string | null
    const email = formData.get('email') as string | null
    const phone = formData.get('phone') as string | null
    const position = formData.get('position') as string | null
    const experience = formData.get('experience') as string | null
    const portfolio = formData.get('portfolio') as string | null
    const coverLetter = formData.get('coverLetter') as string | null
    const resumeFile = formData.get('resume') as File | null

    if (!name || !email || !position || !coverLetter) {
      return NextResponse.json(
        { error: 'Name, email, position, and cover letter are required' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    // Validate resume file type if provided
    if (resumeFile && resumeFile.size > 0) {
      if (!ALLOWED_TYPES.includes(resumeFile.type)) {
        return NextResponse.json(
          { error: 'Resume must be a PDF or DOCX file' },
          { status: 400 }
        )
      }
      if (resumeFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Resume must be under 10 MB' },
          { status: 400 }
        )
      }
    }

    // Build attachments array
    const attachments: { filename: string; content: Buffer }[] = []
    if (resumeFile && resumeFile.size > 0) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer())
      attachments.push({
        filename: resumeFile.name,
        content: buffer,
      })
    }

    const { error } = await resend.emails.send({
      from: 'SM Edge Careers <info@sportsmockery.com>',
      to: 'jobs@sportsmockery.com',
      replyTo: email.trim(),
      subject: `Job Application: ${position} — ${name}`,
      attachments: attachments.length > 0 ? attachments : undefined,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: #0B0F14; color: #FAFAFB; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700;">New Job Application</h1>
            <p style="margin: 8px 0 0; color: #A0A0A5; font-size: 14px;">Submitted via SM Edge Careers${attachments.length > 0 ? ' — Resume attached' : ''}</p>
          </div>

          <div style="background: #16161A; color: #FAFAFB; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.06); border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; width: 120px; vertical-align: top;">Name</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; vertical-align: top;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px;"><a href="mailto:${escapeHtml(email)}" style="color: #00D4FF;">${escapeHtml(email)}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; vertical-align: top;">Phone</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px;">${escapeHtml(phone)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; vertical-align: top;">Position</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px; font-weight: 600;">${escapeHtml(position)}</td>
              </tr>
              ${experience ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; vertical-align: top;">Experience</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px;">${escapeHtml(experience)}</td>
              </tr>` : ''}
              ${portfolio ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; vertical-align: top;">Portfolio</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px;"><a href="${escapeHtml(portfolio)}" style="color: #00D4FF;">${escapeHtml(portfolio)}</a></td>
              </tr>` : ''}
              ${attachments.length > 0 ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A0A0A5; font-size: 13px; vertical-align: top;">Resume</td>
                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px; color: #00D4FF;">${escapeHtml(resumeFile!.name)} (attached)</td>
              </tr>` : ''}
            </table>

            <div style="margin-top: 24px;">
              <h3 style="font-size: 14px; color: #A0A0A5; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Cover Letter</h3>
              <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(coverLetter)}</div>
            </div>
          </div>

          <p style="color: #71717a; font-size: 12px; margin-top: 16px; text-align: center;">
            Sent from SM Edge Careers — ${new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[apply] Resend error:', error.message)
      return NextResponse.json(
        { error: 'Failed to send application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[apply] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

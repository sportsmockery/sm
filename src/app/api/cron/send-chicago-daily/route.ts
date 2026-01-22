import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// =============================================================================
// GET Handler - Simple test email (no stories fetch)
// =============================================================================

export async function GET() {
  // AUTH DISABLED FOR TESTING - re-enable after test

  try {
    // Get yesterday's date label
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const dateLabel = yesterday.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const { data, error } = await resend.emails.send({
      from: 'Sports Mockery <info@sportsmockery.com>',
      to: ['cbur22@gmail.com'],
      subject: `Chicago Sports News for ${dateLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #bc0000;">Chicago Sports News</h1>
          <p>This is a test email from Sports Mockery.</p>
          <p>Date: ${dateLabel}</p>
          <p style="color: #666; font-size: 12px;">
            From: Sports Mockery &lt;info@sportsmockery.com&gt;
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      to: 'cbur22@gmail.com',
      subject: `Chicago Sports News for ${dateLabel}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Test Email Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

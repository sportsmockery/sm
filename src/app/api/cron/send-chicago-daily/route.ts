import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendChicagoDailyEmail,
  sendABTest,
  sendBatch,
  AB_VARIANTS,
} from '@/lib/email/chicago-daily';

// =============================================================================
// Configuration
// =============================================================================

const CRON_SECRET = process.env.CRON_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =============================================================================
// GET Handler (Vercel Cron)
// =============================================================================

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse date from query params (default: yesterday)
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const testMode = searchParams.get('test') === 'true';
    const abTest = searchParams.get('ab') === 'true';

    let targetDate: Date;
    if (dateParam === 'yesterday' || !dateParam) {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 1);
    } else {
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
    }

    // Fetch subscribers from Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: subscribers, error: subError } = await supabase
      .from('email_subscribers')
      .select('email')
      .eq('subscribed', true)
      .eq('list', 'chicago_daily');

    if (subError) {
      console.error('[Subscriber Fetch Error]', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No subscribers found', sent: 0 },
        { status: 200 }
      );
    }

    const recipients = subscribers.map((s) => s.email);

    console.log(`[Cron] Sending Chicago Daily to ${recipients.length} subscribers`);

    // Send email(s)
    let results;

    if (abTest && recipients.length >= 100) {
      // A/B test with control vs emoji variant
      results = await sendABTest({
        date: targetDate,
        recipients,
        variants: [AB_VARIANTS[0], AB_VARIANTS[1]], // control, emoji
        showAppPromo: false,
      });
    } else if (recipients.length > 100) {
      // Batch send for large lists
      results = await sendBatch({
        date: targetDate,
        recipients,
        batchSize: 100,
        testMode,
      });
    } else {
      // Single send for small lists
      const result = await sendChicagoDailyEmail({
        date: targetDate,
        recipients,
        testMode,
      });
      results = [result];
    }

    // Log to database
    const successCount = results.filter((r) => r.success).length;
    const totalSent = results.reduce((sum, r) => sum + r.recipientCount, 0);

    await supabase.from('email_send_log').insert({
      campaign: 'chicago_daily',
      date: targetDate.toISOString().split('T')[0],
      recipients_count: totalSent,
      success: successCount === results.length,
      results: JSON.stringify(results),
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      batches: results.length,
      totalRecipients: totalSent,
      results: results.map((r) => ({
        success: r.success,
        id: r.id,
        subject: r.subject,
        recipientCount: r.recipientCount,
        error: r.error,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// =============================================================================
// POST Handler (Manual/Admin Trigger)
// =============================================================================

export async function POST(request: NextRequest) {
  // Verify auth (use your existing auth middleware pattern)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      date,
      recipients,
      testMode = false,
      abTest = false,
      variant = 'control',
      showAppPromo = false,
    } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'recipients array is required' },
        { status: 400 }
      );
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setDate(targetDate.getDate() - 1);

    // Find variant
    const selectedVariant =
      AB_VARIANTS.find((v) => v.id === variant) || AB_VARIANTS[0];

    if (abTest) {
      const results = await sendABTest({
        date: targetDate,
        recipients,
        showAppPromo,
      });
      return NextResponse.json({ success: true, results });
    }

    const result = await sendChicagoDailyEmail({
      date: targetDate,
      recipients,
      variant: selectedVariant,
      showAppPromo,
      testMode,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Manual Send Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

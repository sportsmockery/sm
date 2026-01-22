import { NextRequest, NextResponse } from 'next/server';
import { sendChicagoDailyEmail } from '@/lib/email/chicago-daily';

// =============================================================================
// Configuration
// =============================================================================

const CRON_SECRET = process.env.CRON_SECRET;

// =============================================================================
// GET Handler - Simple test trigger
// =============================================================================

export async function GET() {
  // AUTH DISABLED FOR TESTING - re-enable after test

  try {
    // Send to hard-coded test recipient (cbur22@gmail.com)
    // No database lookup - recipients are defined in chicago-daily.ts
    const result = await sendChicagoDailyEmail();

    return NextResponse.json({
      triggered: true,
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

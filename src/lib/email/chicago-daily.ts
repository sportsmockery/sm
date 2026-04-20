import { Resend } from 'resend';
import { ChicagoDailyEmail } from '@/emails/ChicagoDailyEmail';
import { prepareDailyEmailVariables } from '@/lib/email/prepare-daily';
import type { DailyEdgeEmailVariables } from '@/types/daily-email';

// Re-export types for cron job compatibility
export type { DailyEdgeEmailVariables };
export type Story = DailyEdgeEmailVariables['hero_story'];
export type GameResult = DailyEdgeEmailVariables['scoreboard_games'][number];

// =============================================================================
// Configuration
// =============================================================================

const resend = new Resend(process.env.RESEND_API_KEY);

const CONFIG = {
  fromEmail: 'Edge by SportsMockery <info@sportsmockery.com>',
  replyTo: 'info@sportsmockery.com',
  apiBaseUrl:
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/daily`
      : 'https://test.sportsmockery.com/api/daily',
};

const TEST_RECIPIENTS = ['cbur22@gmail.com'];

// =============================================================================
// Types
// =============================================================================

export type SendResult = {
  success: boolean;
  id?: string;
  error?: string;
  recipientCount: number;
  subject: string;
};

export type ABVariant = {
  id: string;
  name: string;
  subjectFn: (v: DailyEdgeEmailVariables) => string;
};

// =============================================================================
// Subject line variants
// =============================================================================

export const AB_VARIANTS: ABVariant[] = [
  {
    id: 'control',
    name: 'Control',
    subjectFn: (v) => {
      const scores = v.scoreboard_games;
      if (scores.length > 0) {
        const snippet = scores.slice(0, 2).map((g) =>
          `${g.winner === 'home' ? g.team_home : g.team_away} ${Math.max(g.score_home, g.score_away)}-${Math.min(g.score_home, g.score_away)}`
        ).join(', ');
        return `${snippet} + ${v.stories_count} stories | Edge Daily`;
      }
      return `${v.hero_story.category}: ${v.hero_story.title.slice(0, 40)} | Edge Daily`;
    },
  },
  {
    id: 'headline',
    name: 'Headline Focus',
    subjectFn: (v) => v.hero_story.title.slice(0, 60),
  },
  {
    id: 'count',
    name: 'Story Count',
    subjectFn: (v) => `${v.stories_count} Chicago sports stories you need today | Edge`,
  },
];

// =============================================================================
// API fetch
// =============================================================================

function formatDateForApi(d: Date) { return d.toISOString().split('T')[0]; }
function getYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return d; }

export async function fetchDailyContent(date: Date): Promise<DailyEdgeEmailVariables> {
  const dateStr = formatDateForApi(date);
  const url = `${CONFIG.apiBaseUrl}?date=${dateStr}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Daily API ${res.status}`);

  const data = await res.json();
  const rawStories = Array.isArray(data) ? data : (data.stories || []);
  const rawGames = Array.isArray(data) ? [] : (data.gameResults || []);

  if (rawStories.length === 0 && rawGames.length === 0) {
    throw new Error(`No content for ${dateStr}`);
  }

  return prepareDailyEmailVariables(rawStories, rawGames, new Date());
}

// backward compat
export async function fetchDailyStories(date: Date) {
  const v = await fetchDailyContent(date);
  return [v.hero_story, ...v.more_stories];
}

// =============================================================================
// Send
// =============================================================================

export type SendOptions = {
  date?: Date;
  recipients?: string[];
  variant?: ABVariant;
  showAppPromo?: boolean;
  tags?: string[];
  testMode?: boolean;
};

export async function sendChicagoDailyEmail(opts: SendOptions = {}): Promise<SendResult> {
  const recipients = opts.recipients || TEST_RECIPIENTS;
  const { date = getYesterday(), variant = AB_VARIANTS[0], tags = ['edge-daily'], testMode = false } = opts;

  try {
    const variables = await fetchDailyContent(date);
    const subject = variant.subjectFn(variables);

    if (testMode) {
      console.log('[TEST]', { subject, recipients: recipients.length, stories: variables.stories_count, games: variables.scoreboard_games.length });
      return { success: true, id: 'test', recipientCount: recipients.length, subject };
    }

    const { data, error } = await resend.emails.send({
      from: CONFIG.fromEmail,
      to: recipients,
      replyTo: CONFIG.replyTo,
      subject,
      react: ChicagoDailyEmail(variables),
      tags: tags.map((n) => ({ name: n, value: 'true' })),
      headers: {
        'X-Campaign-Id': `edge-daily-${formatDateForApi(date)}`,
        'X-Variant-Id': variant.id,
      },
    });

    if (error) {
      return { success: false, error: error.message, recipientCount: recipients.length, subject };
    }

    return { success: true, id: data?.id, recipientCount: recipients.length, subject };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, recipientCount: recipients.length, subject: 'Failed' };
  }
}

// =============================================================================
// A/B + Batch helpers
// =============================================================================

export async function sendABTest(opts: {
  date?: Date; recipients: string[]; variants?: ABVariant[]; showAppPromo?: boolean;
}): Promise<SendResult[]> {
  const { date = getYesterday(), recipients, variants = AB_VARIANTS.slice(0, 2) } = opts;
  const chunk = Math.ceil(recipients.length / variants.length);
  const results: SendResult[] = [];
  for (let i = 0; i < variants.length; i++) {
    const batch = recipients.slice(i * chunk, Math.min((i + 1) * chunk, recipients.length));
    if (!batch.length) continue;
    results.push(await sendChicagoDailyEmail({ date, recipients: batch, variant: variants[i], tags: ['edge-daily', 'ab', `v-${variants[i].id}`] }));
  }
  return results;
}

export async function sendBatch(opts: SendOptions & { batchSize?: number }): Promise<SendResult[]> {
  const { recipients = TEST_RECIPIENTS, batchSize = 100, ...rest } = opts;
  const results: SendResult[] = [];
  for (let i = 0; i < recipients.length; i += batchSize) {
    results.push(await sendChicagoDailyEmail({ ...rest, recipients: recipients.slice(i, i + batchSize) }));
    if (i + batchSize < recipients.length) await new Promise((r) => setTimeout(r, 100));
  }
  return results;
}

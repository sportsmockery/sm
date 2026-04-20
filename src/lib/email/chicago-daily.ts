import { Resend } from 'resend';
import {
  ChicagoDailyEmail,
  ChicagoDailyEmailProps,
  Story,
  GameResult,
} from '@/emails/ChicagoDailyEmail';

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
  defaultUnsubscribeUrl: 'https://sportsmockery.com/unsubscribe',
  defaultManagePrefsUrl: 'https://sportsmockery.com/preferences',
};

// =============================================================================
// TEST MODE: Hard-coded recipient (bypasses database)
// =============================================================================

const TEST_RECIPIENTS = ['cbur22@gmail.com'];

// =============================================================================
// Types
// =============================================================================

type SubjectPattern = (story: Story, date: string) => string;
type PreheaderPattern = (story: Story, storiesCount: number) => string;

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
  subjectPattern: SubjectPattern;
  preheaderPattern: PreheaderPattern;
};

// =============================================================================
// Subject & Preheader Patterns
// =============================================================================

const SUBJECT_PATTERNS: SubjectPattern[] = [
  // Pattern 1: Clean Edge branding
  (story, _date) =>
    `${story.team}: ${truncateForSubject(story.title, 40)} | Edge Daily`,

  // Pattern 2: Emoji + headline
  (story, _date) => `🔥 ${truncateForSubject(story.title, 55)}`,

  // Pattern 3: Team focus
  (story, _date) => `${story.team}: ${truncateForSubject(story.title, 50)}`,

  // Pattern 4: Breaking
  (story, _date) => `Breaking: ${truncateForSubject(story.title, 50)}`,

  // Pattern 5: Date recap
  (story, date) => `${date} — ${truncateForSubject(story.title, 40)} | Edge`,
];

const PREHEADER_PATTERNS: PreheaderPattern[] = [
  (_story, count) =>
    `Plus ${count - 1} more stories across Bears, Bulls, Cubs, Sox & Hawks.`,

  (_story, count) =>
    `Your daily Chicago sports intelligence — ${count} stories.`,

  (story, _count) =>
    truncateForPreheader(story.summary || story.title, 85) + '…',

  (_story, _count) =>
    'Bears · Bulls · Cubs · Sox · Hawks — your daily edge.',

  (story, _count) =>
    `Top story: ${truncateForPreheader(story.summary || story.title, 60)}. More inside.`,
];

// =============================================================================
// A/B Variants
// =============================================================================

export const AB_VARIANTS: ABVariant[] = [
  {
    id: 'control',
    name: 'Control (Team + Hook)',
    subjectPattern: SUBJECT_PATTERNS[0],
    preheaderPattern: PREHEADER_PATTERNS[0],
  },
  {
    id: 'emoji',
    name: 'Emoji Headline',
    subjectPattern: SUBJECT_PATTERNS[1],
    preheaderPattern: PREHEADER_PATTERNS[2],
  },
  {
    id: 'breaking',
    name: 'Breaking News Style',
    subjectPattern: SUBJECT_PATTERNS[3],
    preheaderPattern: PREHEADER_PATTERNS[4],
  },
];

// =============================================================================
// Utility Functions
// =============================================================================

function truncateForSubject(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim() + '…';
}

function truncateForPreheader(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

function getYesterdayLabel(): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return yesterday.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

// =============================================================================
// API Functions
// =============================================================================

type ApiStory = {
  id: string;
  title: string;
  url: string;
  featured_image?: string;
  image_url?: string;
  imageUrl?: string;
  team?: string;
  category?: string;
  excerpt?: string;
  summary?: string;
  published_at?: string;
  publishedAt?: string;
  views?: number;
  view_count?: number;
};

type ApiGameResult = {
  id: string;
  team: string;
  teamSlug: string;
  opponent: string;
  opponentFull: string;
  teamScore: number;
  opponentScore: number;
  isHome: boolean;
  result: 'W' | 'L' | 'OTL' | null;
  gameDate: string;
  scoresUrl: string;
};

function mapTeam(
  team?: string
): Story['team'] {
  if (!team) return 'Other';
  const normalized = team.toLowerCase();
  if (normalized.includes('bear')) return 'Bears';
  if (normalized.includes('bull')) return 'Bulls';
  if (normalized.includes('cub')) return 'Cubs';
  if (normalized.includes('white') || normalized.includes('sox'))
    return 'White Sox';
  if (normalized.includes('hawk') || normalized.includes('blackhawk'))
    return 'Blackhawks';
  return 'Other';
}

function mapApiStoryToStory(apiStory: ApiStory): Story {
  return {
    id: apiStory.id,
    title: apiStory.title,
    url: apiStory.url,
    imageUrl:
      apiStory.imageUrl ||
      apiStory.image_url ||
      apiStory.featured_image ||
      'https://test.sportsmockery.com/placeholder.jpg',
    team: mapTeam(apiStory.team || apiStory.category),
    summary: apiStory.summary || apiStory.excerpt,
    publishedAt: apiStory.publishedAt || apiStory.published_at || '',
    views: apiStory.views || apiStory.view_count || 0,
  };
}

export async function fetchDailyContent(
  date: Date
): Promise<{ stories: Story[]; gameResults: GameResult[] }> {
  const dateStr = formatDateForApi(date);
  const url = `${CONFIG.apiBaseUrl}?date=${dateStr}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch daily content: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Handle new combined format { stories, gameResults } or old array format
  let rawStories: ApiStory[];
  let rawGameResults: ApiGameResult[] = [];

  if (Array.isArray(data)) {
    rawStories = data;
  } else {
    rawStories = data.stories || [];
    rawGameResults = data.gameResults || [];
  }

  if (rawStories.length === 0 && rawGameResults.length === 0) {
    throw new Error(`No content found for date: ${dateStr}`);
  }

  const stories = rawStories.map(mapApiStoryToStory);
  const gameResults: GameResult[] = rawGameResults.map((g) => ({
    ...g,
    team: mapTeam(g.team) as GameResult['team'],
  }));

  return { stories, gameResults };
}

// Keep backwards-compatible function
export async function fetchDailyStories(date: Date): Promise<Story[]> {
  const { stories } = await fetchDailyContent(date);
  return stories;
}

// =============================================================================
// Main Send Function
// =============================================================================

export type SendOptions = {
  date?: Date;
  recipients?: string[];
  variant?: ABVariant;
  showAppPromo?: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
  testMode?: boolean;
};

export async function sendChicagoDailyEmail(
  options: SendOptions = {}
): Promise<SendResult> {
  const recipients = options.recipients || TEST_RECIPIENTS;

  const {
    date = getYesterday(),
    variant = AB_VARIANTS[0],
    showAppPromo = true,
    tags = ['chicago-daily', 'edge'],
    testMode = false,
  } = options;

  try {
    // 1. Fetch stories + game results
    const { stories, gameResults } = await fetchDailyContent(date);

    // 2. Sort by views and get hero
    const sortedStories = [...stories].sort((a, b) => b.views - a.views);
    const heroStory = sortedStories[0];

    // 3. Build subject and preheader
    const formattedDate = formatDate(date);
    const dateLabel = getYesterdayLabel();

    // Build subject — include score summary if games were played
    let subject: string;
    if (gameResults.length > 0) {
      const scoreSnippet = gameResults
        .slice(0, 2)
        .map(
          (g) =>
            `${g.team} ${g.result === 'W' ? 'W' : g.result === 'OTL' ? 'OTL' : 'L'} ${g.teamScore}-${g.opponentScore}`
        )
        .join(', ');
      subject = `${scoreSnippet} + ${stories.length} Stories | Edge Daily`;
    } else if (heroStory) {
      subject = `Chicago Sports News for ${dateLabel} | Edge Daily`;
    } else {
      subject = `Chicago Sports Daily — ${dateLabel}`;
    }

    const preheader = heroStory
      ? variant.preheaderPattern(heroStory, sortedStories.length)
      : 'Your daily Chicago sports intelligence briefing';

    // 4. Build email props
    const emailProps: ChicagoDailyEmailProps = {
      date: formattedDate,
      stories: sortedStories,
      gameResults,
      showAppPromo,
      unsubscribeUrl: CONFIG.defaultUnsubscribeUrl,
      managePrefsUrl: CONFIG.defaultManagePrefsUrl,
      previewText: preheader,
      utmParams: {
        source: 'email',
        medium: 'newsletter',
        campaign: `edge_daily_${formatDateForApi(date)}`,
      },
    };

    // 5. Log in test mode
    if (testMode) {
      console.log('[TEST MODE] Would send email:');
      console.log('  Subject:', subject);
      console.log('  Preheader:', preheader);
      console.log('  Recipients:', recipients.length);
      console.log('  Stories:', sortedStories.length);
      console.log('  Game Results:', gameResults.length);
      return {
        success: true,
        id: 'test-mode-id',
        recipientCount: recipients.length,
        subject,
      };
    }

    // 6. Send via Resend
    const { data, error } = await resend.emails.send({
      from: CONFIG.fromEmail,
      to: recipients,
      replyTo: CONFIG.replyTo,
      subject,
      react: ChicagoDailyEmail(emailProps),
      tags: tags.map((name) => ({ name, value: 'true' })),
      headers: {
        'X-Campaign-Id': `edge-daily-${formatDateForApi(date)}`,
        'X-Variant-Id': variant.id,
      },
    });

    if (error) {
      console.error('[Email Send Error]', error);
      return {
        success: false,
        error: error.message,
        recipientCount: recipients.length,
        subject,
      };
    }

    console.log('[Email Sent]', {
      id: data?.id,
      subject,
      recipientCount: recipients.length,
      stories: sortedStories.length,
      games: gameResults.length,
    });

    return {
      success: true,
      id: data?.id,
      recipientCount: recipients.length,
      subject,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email Send Error]', errorMessage);
    return {
      success: false,
      error: errorMessage,
      recipientCount: recipients.length,
      subject: 'Failed to generate',
    };
  }
}

// =============================================================================
// A/B Testing Helper
// =============================================================================

export type ABTestOptions = {
  date?: Date;
  recipients: string[];
  variants?: ABVariant[];
  showAppPromo?: boolean;
};

export async function sendABTest(
  options: ABTestOptions
): Promise<SendResult[]> {
  const {
    date = getYesterday(),
    recipients,
    variants = AB_VARIANTS.slice(0, 2),
    showAppPromo = true,
  } = options;

  const chunkSize = Math.ceil(recipients.length / variants.length);
  const results: SendResult[] = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, recipients.length);
    const variantRecipients = recipients.slice(start, end);

    if (variantRecipients.length === 0) continue;

    const result = await sendChicagoDailyEmail({
      date,
      recipients: variantRecipients,
      variant,
      showAppPromo,
      tags: ['chicago-daily', 'edge', 'ab-test', `variant-${variant.id}`],
      metadata: {
        ab_test: 'true',
        variant_id: variant.id,
        variant_name: variant.name,
      },
    });

    results.push(result);
  }

  return results;
}

// =============================================================================
// Batch Send Helper (for large lists)
// =============================================================================

export async function sendBatch(
  options: SendOptions & { batchSize?: number }
): Promise<SendResult[]> {
  const { recipients = TEST_RECIPIENTS, batchSize = 100, ...rest } = options;
  const results: SendResult[] = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const result = await sendChicagoDailyEmail({
      ...rest,
      recipients: batch,
    });
    results.push(result);

    // Rate limit: wait 100ms between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

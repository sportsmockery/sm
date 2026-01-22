import { Resend } from 'resend';
import {
  ChicagoDailyEmail,
  ChicagoDailyEmailProps,
  Story,
} from '@/emails/ChicagoDailyEmail';

// =============================================================================
// Configuration
// =============================================================================

const resend = new Resend(process.env.RESEND_API_KEY);

const CONFIG = {
  fromEmail: 'Sports Mockery <info@sportsmockery.com>',
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
  // Pattern 1: [Team] hook | Chicago Sports Daily
  (story, _date) =>
    `${story.team}: ${truncateForSubject(story.title, 40)} | Chicago Sports Daily`,

  // Pattern 2: Emoji + headline excerpt
  (story, _date) => `🔥 ${truncateForSubject(story.title, 55)}`,

  // Pattern 3: [Team]: Action + outcome
  (story, _date) => `${story.team}: ${truncateForSubject(story.title, 50)}`,

  // Pattern 4: Breaking style
  (story, _date) => `Breaking: ${truncateForSubject(story.title, 50)}`,

  // Pattern 5: Date recap
  (story, date) => `${date} Recap: ${truncateForSubject(story.title, 35)}`,
];

const PREHEADER_PATTERNS: PreheaderPattern[] = [
  // Pattern 1: Plus stories teaser
  (_story, count) =>
    `Plus ${count - 1} more stories from Bears, Bulls, Cubs, and Sox.`,

  // Pattern 2: Time-based
  (_story, count) =>
    `Your daily Chicago sports briefing — ${count} stories in 2 minutes.`,

  // Pattern 3: Hero summary
  (story, _count) =>
    truncateForPreheader(story.summary || story.title, 85) + '…',

  // Pattern 4: All teams
  (_story, _count) =>
    'Bears, Bulls, Cubs, Sox — everything you need to know today.',

  // Pattern 5: Top story hook
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

/**
 * Returns yesterday's date as a label for the email subject.
 * Format: "Jan 22, 2026"
 */
function getYesterdayLabel(): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return yesterday.toLocaleDateString('en-US', {
    month: 'short',  // "Jan"
    day: '2-digit',  // "22"
    year: 'numeric', // "2026"
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

function mapTeam(
  team?: string
): 'Bears' | 'Bulls' | 'Cubs' | 'White Sox' | 'Other' {
  if (!team) return 'Other';
  const normalized = team.toLowerCase();
  if (normalized.includes('bear')) return 'Bears';
  if (normalized.includes('bull')) return 'Bulls';
  if (normalized.includes('cub')) return 'Cubs';
  if (normalized.includes('white') || normalized.includes('sox'))
    return 'White Sox';
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
      'https://sportsmockery.com/placeholder.jpg',
    team: mapTeam(apiStory.team || apiStory.category),
    summary: apiStory.summary || apiStory.excerpt,
    publishedAt: apiStory.publishedAt || apiStory.published_at || '',
    views: apiStory.views || apiStory.view_count || 0,
  };
}

export async function fetchDailyStories(date: Date): Promise<Story[]> {
  const dateStr = formatDateForApi(date);
  const url = `${CONFIG.apiBaseUrl}?date=${dateStr}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 0 }, // No cache for cron
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch stories: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Handle both array and { stories: [] } response formats
  const rawStories: ApiStory[] = Array.isArray(data) ? data : data.stories;

  if (!rawStories || rawStories.length === 0) {
    throw new Error(`No stories found for date: ${dateStr}`);
  }

  return rawStories.map(mapApiStoryToStory);
}

// =============================================================================
// Main Send Function
// =============================================================================

export type SendOptions = {
  date?: Date;
  recipients?: string[];  // Optional - defaults to TEST_RECIPIENTS
  variant?: ABVariant;
  showAppPromo?: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
  testMode?: boolean;
};

export async function sendChicagoDailyEmail(
  options: SendOptions = {}
): Promise<SendResult> {
  // Use hard-coded test recipients if none provided
  const recipients = options.recipients || TEST_RECIPIENTS;

  const {
    date = getYesterday(),
    variant = AB_VARIANTS[0],
    showAppPromo = false,
    tags = ['chicago-daily'],
    testMode = false,
  } = options;

  try {
    // 1. Fetch stories
    const stories = await fetchDailyStories(date);

    // 2. Sort by views and get hero
    const sortedStories = [...stories].sort((a, b) => b.views - a.views);
    const heroStory = sortedStories[0];

    // 3. Build subject and preheader
    const formattedDate = formatDate(date);
    const dateLabel = getYesterdayLabel();

    // Fixed subject format: "Chicago Sports News for Jan 22, 2026"
    const subject = `Chicago Sports News for ${dateLabel}`;
    const preheader = variant.preheaderPattern(heroStory, sortedStories.length);

    // 4. Build email props
    const emailProps: ChicagoDailyEmailProps = {
      date: formattedDate,
      stories: sortedStories,
      showAppPromo,
      unsubscribeUrl: CONFIG.defaultUnsubscribeUrl,
      managePrefsUrl: CONFIG.defaultManagePrefsUrl,
      previewText: preheader,
      utmParams: {
        source: 'email',
        medium: 'newsletter',
        campaign: `chicago_daily_${formatDateForApi(date)}`,
      },
    };

    // 5. Log in test mode
    if (testMode) {
      console.log('[TEST MODE] Would send email:');
      console.log('  Subject:', subject);
      console.log('  Preheader:', preheader);
      console.log('  Recipients:', recipients.length);
      console.log('  Hero:', heroStory.title);
      console.log('  Total stories:', sortedStories.length);
      return {
        success: true,
        id: 'test-mode-id',
        recipientCount: recipients.length,
        subject,
      };
    }

    // 6. Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'Sports Mockery <info@sportsmockery.com>',
      to: recipients,
      replyTo: CONFIG.replyTo,
      subject,
      react: ChicagoDailyEmail(emailProps),
      tags: tags.map((name) => ({ name, value: 'true' })),
      headers: {
        'X-Campaign-Id': `chicago-daily-${formatDateForApi(date)}`,
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
      variant: variant.id,
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
    variants = AB_VARIANTS.slice(0, 2), // Default: control vs emoji
    showAppPromo = false,
  } = options;

  // Split recipients evenly across variants
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
      tags: ['chicago-daily', `ab-test`, `variant-${variant.id}`],
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

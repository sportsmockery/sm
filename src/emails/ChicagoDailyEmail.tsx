import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Button,
  Link,
  Hr,
} from '@react-email/components';

// =============================================================================
// Types
// =============================================================================

export type Story = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  team: 'Bears' | 'Bulls' | 'Cubs' | 'White Sox' | 'Other';
  summary?: string;
  publishedAt: string;
  views: number;
};

export type ChicagoDailyEmailProps = {
  date: string; // e.g., 'January 21, 2026'
  stories: Story[]; // unsorted; component sorts by views
  showAppPromo?: boolean;
  unsubscribeUrl: string;
  managePrefsUrl: string;
  previewText?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
};

// =============================================================================
// Constants
// =============================================================================

const BRAND_RED = '#bc0000';
const BRAND_RED_HOVER = '#a00000';
const DARK_BG = '#111827';
const LIGHT_BG = '#f9fafb';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';

const TEAM_EMOJI: Record<Story['team'], string> = {
  Bears: '🐻',
  Bulls: '🐂',
  Cubs: '🦁',
  'White Sox': '⚾',
  Other: '🏙️',
};

const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/sportsmockery',
  youtube: 'https://youtube.com/@sportsmockery',
  instagram: 'https://instagram.com/sportsmockery',
  facebook: 'https://facebook.com/sportsmockery',
};

// =============================================================================
// Utility Functions
// =============================================================================

function addUtmParams(
  url: string,
  utm?: ChicagoDailyEmailProps['utmParams']
): string {
  if (!utm) return url;
  const urlObj = new URL(url);
  if (utm.source) urlObj.searchParams.set('utm_source', utm.source);
  if (utm.medium) urlObj.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) urlObj.searchParams.set('utm_campaign', utm.campaign);
  return urlObj.toString();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim() + '…';
}

function groupByTeam(stories: Story[]): Record<Story['team'], Story[]> {
  const groups: Record<Story['team'], Story[]> = {
    Bears: [],
    Bulls: [],
    Cubs: [],
    'White Sox': [],
    Other: [],
  };
  for (const story of stories) {
    groups[story.team].push(story);
  }
  return groups;
}

// =============================================================================
// Component
// =============================================================================

export function ChicagoDailyEmail({
  date,
  stories,
  showAppPromo = false,
  unsubscribeUrl,
  managePrefsUrl,
  previewText,
  utmParams = {
    source: 'email',
    medium: 'newsletter',
    campaign: 'chicago_daily',
  },
}: ChicagoDailyEmailProps) {
  // Sort stories by views descending
  const sortedStories = [...stories].sort((a, b) => b.views - a.views);
  const heroStory = sortedStories[0];
  const remainingStories = sortedStories.slice(1);

  // Group remaining stories by team for optional section
  const teamGroups = groupByTeam(remainingStories);
  const teamsWithMultiple = (
    Object.entries(teamGroups) as [Story['team'], Story[]][]
  ).filter(([, s]) => s.length >= 2);
  const showByTeam = teamsWithMultiple.length >= 2;

  // Default preview text
  const preview =
    previewText ||
    (heroStory
      ? truncate(heroStory.summary || heroStory.title, 85)
      : 'Your daily Chicago sports briefing');

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ─────────────────────────────────────────────────────────────── */}
          {/* HEADER */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <Section style={styles.header}>
            <Row>
              <Column style={styles.headerLogoCol}>
                <Img
                  src="https://datalab.sportsmockery.com/logo-light.png"
                  alt="Sports Mockery"
                  width={120}
                  height={32}
                  style={styles.logo}
                />
              </Column>
              <Column style={styles.headerTextCol}>
                <Text style={styles.headerTitle}>Chicago Sports Daily</Text>
                <Text style={styles.headerDate}>{date}</Text>
              </Column>
            </Row>
          </Section>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* HERO STORY */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {heroStory && (
            <Section style={styles.heroSection}>
              <Link
                href={addUtmParams(heroStory.url, utmParams)}
                style={styles.heroImageLink}
              >
                <Img
                  src={heroStory.imageUrl}
                  alt={heroStory.title}
                  width={552}
                  style={styles.heroImage}
                />
              </Link>
              <Text style={styles.heroTeamTag}>
                {TEAM_EMOJI[heroStory.team]} {heroStory.team.toUpperCase()}
              </Text>
              <Link
                href={addUtmParams(heroStory.url, utmParams)}
                style={styles.heroTitleLink}
              >
                <Text style={styles.heroTitle}>{heroStory.title}</Text>
              </Link>
              {heroStory.summary && (
                <Text style={styles.heroSummary}>
                  {truncate(heroStory.summary, 150)}
                </Text>
              )}
              <Button
                href={addUtmParams(heroStory.url, utmParams)}
                style={styles.heroCta}
              >
                Read Full Story →
              </Button>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TOP STORIES */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {remainingStories.length > 0 && (
            <Section style={styles.topStoriesSection}>
              <Text style={styles.sectionTitle}>MORE STORIES</Text>
              {remainingStories.slice(0, 6).map((story) => (
                <Row key={story.id} style={styles.storyRow}>
                  <Column style={styles.storyThumbCol}>
                    <Link href={addUtmParams(story.url, utmParams)}>
                      <Img
                        src={story.imageUrl}
                        alt={story.title}
                        width={80}
                        height={80}
                        style={styles.storyThumb}
                      />
                    </Link>
                  </Column>
                  <Column style={styles.storyTextCol}>
                    <Text style={styles.storyTeam}>
                      {TEAM_EMOJI[story.team]} {story.team}
                    </Text>
                    <Link
                      href={addUtmParams(story.url, utmParams)}
                      style={styles.storyLink}
                    >
                      {truncate(story.title, 70)}
                    </Link>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* BY TEAM (optional) */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {showByTeam && (
            <Section style={styles.byTeamSection}>
              <Text style={styles.sectionTitle}>BY TEAM</Text>
              <Row>
                {teamsWithMultiple.slice(0, 2).map(([team, teamStories]) => (
                  <Column key={team} style={styles.teamCol}>
                    <Text style={styles.teamHeader}>
                      {TEAM_EMOJI[team]} {team.toUpperCase()}
                    </Text>
                    {teamStories.slice(0, 3).map((story) => (
                      <Text key={story.id} style={styles.teamStoryItem}>
                        •{' '}
                        <Link
                          href={addUtmParams(story.url, utmParams)}
                          style={styles.teamStoryLink}
                        >
                          {truncate(story.title, 45)}
                        </Link>
                      </Text>
                    ))}
                  </Column>
                ))}
              </Row>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* APP PROMO (optional) */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {showAppPromo && (
            <Section style={styles.promoSection}>
              <Row>
                <Column>
                  <Text style={styles.promoText}>
                    📱 Get alerts first — Download the SM app
                  </Text>
                </Column>
                <Column style={styles.promoButtonCol}>
                  <Button
                    href="https://sportsmockery.com/app"
                    style={styles.promoButton}
                  >
                    Download
                  </Button>
                </Column>
              </Row>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* FOOTER */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <Section style={styles.footer}>
            {/* Social Links */}
            <Row style={styles.socialRow}>
              <Column align="center">
                <Link href={SOCIAL_LINKS.twitter} style={styles.socialLink}>
                  Twitter
                </Link>
                <Text style={styles.socialDivider}>·</Text>
                <Link href={SOCIAL_LINKS.youtube} style={styles.socialLink}>
                  YouTube
                </Link>
                <Text style={styles.socialDivider}>·</Text>
                <Link href={SOCIAL_LINKS.instagram} style={styles.socialLink}>
                  Instagram
                </Link>
                <Text style={styles.socialDivider}>·</Text>
                <Link href={SOCIAL_LINKS.facebook} style={styles.socialLink}>
                  Facebook
                </Link>
              </Column>
            </Row>

            <Hr style={styles.footerHr} />

            {/* Preference Links */}
            <Row>
              <Column align="center">
                <Link href={managePrefsUrl} style={styles.footerLink}>
                  Manage Preferences
                </Link>
                <Text style={styles.footerDivider}>·</Text>
                <Link href={unsubscribeUrl} style={styles.footerLink}>
                  Unsubscribe
                </Link>
              </Column>
            </Row>

            {/* Copyright */}
            <Text style={styles.copyright}>
              © {new Date().getFullYear()} SportsMockery.com · Chicago, IL
            </Text>
            <Text style={styles.address}>
              You received this email because you subscribed to Chicago Sports
              Daily.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// =============================================================================
// Styles (email-safe inline styles)
// =============================================================================

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#ffffff',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    backgroundColor: BRAND_RED,
    padding: '16px 24px',
  },
  headerLogoCol: {
    width: '130px',
    verticalAlign: 'middle',
  },
  logo: {
    display: 'block',
  },
  headerTextCol: {
    verticalAlign: 'middle',
    textAlign: 'right' as const,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    lineHeight: '1.2',
  },
  headerDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.2',
  },

  // Hero
  heroSection: {
    padding: '24px',
  },
  heroImageLink: {
    display: 'block',
  },
  heroImage: {
    width: '100%',
    maxWidth: '552px',
    height: 'auto',
    borderRadius: '12px',
    display: 'block',
  },
  heroTeamTag: {
    display: 'inline-block',
    backgroundColor: LIGHT_BG,
    color: TEXT_SECONDARY,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '6px 12px',
    borderRadius: '4px',
    marginTop: '16px',
    marginBottom: '8px',
  },
  heroTitleLink: {
    textDecoration: 'none',
  },
  heroTitle: {
    color: TEXT_PRIMARY,
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '1.3',
    margin: '0 0 12px 0',
  },
  heroSummary: {
    color: TEXT_SECONDARY,
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  heroCta: {
    backgroundColor: BRAND_RED,
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    padding: '14px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  },

  // Top Stories
  topStoriesSection: {
    backgroundColor: LIGHT_BG,
    padding: '24px',
  },
  sectionTitle: {
    color: TEXT_SECONDARY,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    marginTop: 0,
    marginBottom: '16px',
  },
  storyRow: {
    marginBottom: '16px',
  },
  storyThumbCol: {
    width: '80px',
    verticalAlign: 'top',
  },
  storyThumb: {
    borderRadius: '8px',
    display: 'block',
    objectFit: 'cover' as const,
  },
  storyTextCol: {
    verticalAlign: 'top',
    paddingLeft: '16px',
  },
  storyTeam: {
    color: TEXT_MUTED,
    fontSize: '11px',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  storyLink: {
    color: TEXT_PRIMARY,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '1.4',
    textDecoration: 'none',
  },

  // By Team
  byTeamSection: {
    padding: '24px',
  },
  teamCol: {
    width: '50%',
    verticalAlign: 'top',
    paddingRight: '12px',
  },
  teamHeader: {
    color: TEXT_PRIMARY,
    fontSize: '13px',
    fontWeight: 700,
    marginTop: 0,
    marginBottom: '8px',
  },
  teamStoryItem: {
    color: TEXT_SECONDARY,
    fontSize: '13px',
    lineHeight: '1.6',
    margin: '0 0 4px 0',
  },
  teamStoryLink: {
    color: BRAND_RED,
    textDecoration: 'none',
  },

  // Promo
  promoSection: {
    backgroundColor: DARK_BG,
    padding: '16px 24px',
  },
  promoText: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
    lineHeight: '40px',
  },
  promoButtonCol: {
    textAlign: 'right' as const,
  },
  promoButton: {
    backgroundColor: '#ffffff',
    color: DARK_BG,
    fontSize: '14px',
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
  },

  // Footer
  footer: {
    backgroundColor: DARK_BG,
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  socialRow: {
    marginBottom: '16px',
  },
  socialLink: {
    color: TEXT_MUTED,
    fontSize: '13px',
    textDecoration: 'none',
  },
  socialDivider: {
    color: TEXT_MUTED,
    display: 'inline',
    margin: '0 8px',
  },
  footerHr: {
    borderColor: '#374151',
    borderWidth: '1px 0 0 0',
    margin: '16px 0',
  },
  footerLink: {
    color: TEXT_MUTED,
    fontSize: '12px',
    textDecoration: 'underline',
  },
  footerDivider: {
    color: TEXT_MUTED,
    display: 'inline',
    margin: '0 8px',
  },
  copyright: {
    color: TEXT_MUTED,
    fontSize: '12px',
    marginTop: '16px',
    marginBottom: '4px',
  },
  address: {
    color: '#6b7280',
    fontSize: '11px',
    margin: 0,
  },
};

export default ChicagoDailyEmail;

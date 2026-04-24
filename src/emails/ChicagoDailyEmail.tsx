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
  team: 'Bears' | 'Bulls' | 'Cubs' | 'White Sox' | 'Blackhawks' | 'Other';
  category?: string;
  summary?: string;
  publishedAt: string;
  readTime?: number;
  views: number;
};

export type EdgeInsight = {
  text: string;
  team?: string;
};

export type ChicagoDailyEmailProps = {
  date: string;
  stories: Story[];
  edgeInsights?: EdgeInsight[];
  briefingText?: string;
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

const BRAND_RED = '#BC0000';
const DARK_BG = '#0B0F14';
const CARD_BG = '#151A22';
const BORDER_COLOR = '#1E2530';
const TEXT_WHITE = '#FAFAFB';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DIM = '#6B7280';
const CYAN = '#00D4FF';

const SITE_URL = 'https://test.sportsmockery.com';
const ASSET_URL = SITE_URL;

const TEAM_LABELS: Record<Story['team'], string> = {
  Bears: 'BEARS',
  Bulls: 'BULLS',
  Cubs: 'CUBS',
  'White Sox': 'WHITE SOX',
  Blackhawks: 'BLACKHAWKS',
  Other: 'CHICAGO',
};

// =============================================================================
// Helpers
// =============================================================================

function addUtm(url: string, utm?: ChicagoDailyEmailProps['utmParams']): string {
  if (!utm) return url;
  const u = new URL(url);
  if (utm.source) u.searchParams.set('utm_source', utm.source);
  if (utm.medium) u.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) u.searchParams.set('utm_campaign', utm.campaign);
  return u.toString();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trim() + '…';
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffH = Math.round((now - then) / (1000 * 60 * 60));
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH} hours ago`;
  if (diffH < 48) return 'Yesterday';
  return `${Math.round(diffH / 24)} days ago`;
}

function formatViews(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K reads`;
  return `${v} reads`;
}

// =============================================================================
// Component
// =============================================================================

export function ChicagoDailyEmail({
  date,
  stories,
  edgeInsights,
  briefingText,
  showAppPromo = false,
  unsubscribeUrl,
  managePrefsUrl,
  previewText,
  utmParams = { source: 'email', medium: 'newsletter', campaign: 'chicago_daily' },
}: ChicagoDailyEmailProps) {
  const sorted = [...stories].sort((a, b) => b.views - a.views);
  const hero = sorted[0];
  const rest = sorted.slice(1, 7);

  const preview = previewText || (hero ? truncate(hero.summary || hero.title, 85) : 'Your Chicago sports briefing');

  // Build briefing from insights or use provided text
  const briefing = briefingText || (edgeInsights && edgeInsights.length > 0
    ? `${hero?.title || ''}. Plus: ${edgeInsights.slice(0, 2).map(i => i.text).join('. ')} and ${Math.max(0, (stories.length - 1))} more.`
    : undefined);

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <Section style={s.header}>
            <Row>
              <Column style={s.headerLeft}>
                <Img
                  src={`${ASSET_URL}/edge_logo.png`}
                  alt="EDGE"
                  width={80}
                  height={28}
                  style={{ display: 'block' }}
                />
                <Text style={s.headerSub}>Your Chicago sports briefing · 6am edition</Text>
              </Column>
              <Column style={s.headerRight}>
                <Text style={s.headerDate}>{date}</Text>
              </Column>
            </Row>
          </Section>

          {/* ── TODAY'S BRIEFING ───────────────────────────────────── */}
          {briefing && (
            <Section style={s.briefingSection}>
              <Text style={s.briefingLabel}>TODAY&apos;S BRIEFING</Text>
              <Text style={s.briefingText}>{truncate(briefing, 200)}</Text>
            </Section>
          )}

          {/* ── TOP STORY ─────────────────────────────────────────── */}
          {hero && (
            <Section style={s.heroCard}>
              <Row style={s.heroLabelRow}>
                <Column>
                  <Text style={s.heroLabel}>TOP STORY</Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={s.heroTeam}>
                    {TEAM_LABELS[hero.team]}{hero.category ? ` · ${hero.category}` : ' · News'}
                  </Text>
                </Column>
              </Row>
              <Link href={addUtm(hero.url, utmParams)} style={{ display: 'block' }}>
                <Img
                  src={hero.imageUrl}
                  alt={hero.title}
                  width={552}
                  style={s.heroImage}
                />
              </Link>
              <Link href={addUtm(hero.url, utmParams)} style={{ textDecoration: 'none' }}>
                <Text style={s.heroTitle}>{hero.title}</Text>
              </Link>
              {hero.summary && (
                <Text style={s.heroSummary}>{truncate(hero.summary, 150)}</Text>
              )}
              <Text style={s.heroMeta}>
                {hero.readTime ? `${hero.readTime} min read` : '5 min read'} · {formatViews(hero.views)} · {formatRelativeTime(hero.publishedAt)}
              </Text>
              <Button href={addUtm(hero.url, utmParams)} style={s.ctaButton}>
                See the full {TEAM_LABELS[hero.team].charAt(0) + TEAM_LABELS[hero.team].slice(1).toLowerCase()} breakdown →
              </Button>
            </Section>
          )}

          {/* ── STORY LIST ────────────────────────────────────────── */}
          {rest.length > 0 && (
            <Section style={s.storiesSection}>
              {rest.map((story) => (
                <Row key={story.id} style={s.storyRow}>
                  <Column style={s.storyImgCol}>
                    <Link href={addUtm(story.url, utmParams)}>
                      <Img src={story.imageUrl} alt={story.title} width={90} height={70} style={s.storyImg} />
                    </Link>
                  </Column>
                  <Column style={s.storyTextCol}>
                    <Text style={s.storyTeam}>
                      {TEAM_LABELS[story.team]} · {story.category || 'NEWS'}
                    </Text>
                    <Link href={addUtm(story.url, utmParams)} style={{ textDecoration: 'none' }}>
                      <Text style={s.storyTitle}>{truncate(story.title, 80)}</Text>
                    </Link>
                    {story.summary && (
                      <Text style={s.storySummary}>{truncate(story.summary, 100)}</Text>
                    )}
                    <Text style={s.storyMeta}>
                      {story.readTime ? `${story.readTime} min read` : '5 min read'} · {formatRelativeTime(story.publishedAt)}
                    </Text>
                  </Column>
                </Row>
              ))}
              <Button href={addUtm(`${SITE_URL}/feed`, utmParams)} style={s.browseButton}>
                Browse all stories →
              </Button>
            </Section>
          )}

          {/* ── SCOUT AI PROMO ────────────────────────────────────── */}
          <Section style={s.scoutSection}>
            <Row>
              <Column style={s.scoutIconCol}>
                <Img src={`${ASSET_URL}/downloads/scout-v2.png`} alt="Scout AI" width={48} height={48} style={{ borderRadius: '12px' }} />
              </Column>
              <Column style={s.scoutTextCol}>
                <Text style={s.scoutTitle}>Ask Scout anything about Chicago sports</Text>
                <Text style={s.scoutDesc}>Scout has the latest on Bears, Bulls, White Sox and more. Ask anything.</Text>
              </Column>
            </Row>
            <Button href={addUtm(`${SITE_URL}/scout-ai`, utmParams)} style={s.scoutCta}>
              Try Scout now →
            </Button>
          </Section>

          {/* ── EDGE NETWORK ──────────────────────────────────────── */}
          <Section style={s.networkSection}>
            <Text style={s.networkLabel}>Also from the Edge network</Text>
            <Text style={s.networkSub}>Podcasts and shows for Chicago fans</Text>

            <Link href={addUtm(`${SITE_URL}/untold-chicago-stories`, utmParams)} style={{ textDecoration: 'none' }}>
              <Row style={s.showRow}>
                <Column style={s.showLogoCol}>
                  <Img src={`${ASSET_URL}/untold-logo-dark.png`} alt="UNTLD" width={48} height={48} style={s.showLogo} />
                </Column>
                <Column style={s.showTextCol}>
                  <Text style={s.showName}>Untold Chicago Stories</Text>
                  <Text style={s.showDesc}>Raw documentaries from across the city</Text>
                </Column>
              </Row>
            </Link>

            <Link href={addUtm(`${SITE_URL}/pinwheels-and-ivy`, utmParams)} style={{ textDecoration: 'none' }}>
              <Row style={s.showRow}>
                <Column style={s.showLogoCol}>
                  <Img src={`${ASSET_URL}/downloads/pinwheels-ivy-logo-dark.png`} alt="Pinwheels & Ivy" width={48} height={48} style={s.showLogo} />
                </Column>
                <Column style={s.showTextCol}>
                  <Text style={s.showName}>Pinwheels & Ivy</Text>
                  <Text style={s.showDesc}>Your daily Cubs podcast</Text>
                </Column>
              </Row>
            </Link>
          </Section>

          {/* ── APP PROMO ─────────────────────────────────────────── */}
          <Section style={s.appSection}>
            <Text style={s.appTitle}>Get the Edge App</Text>
            <Text style={s.appDesc}>Real-time scores, alerts, and live win-probability on your phone.</Text>
            <Text style={s.appFeature}>· Live scores with real-time win probability</Text>
            <Text style={s.appFeature}>· Breaking news alerts for your favorite teams</Text>
            <Text style={s.appFeature}>· Personalized feed — only the teams you follow</Text>
          </Section>

          {/* ── FOOTER ────────────────────────────────────────────── */}
          <Section style={s.footer}>
            <Row>
              <Column align="center">
                <Link href="https://x.com/sportsmockery" style={s.footerSocial}>X</Link>
                <Text style={s.footerDot}>·</Text>
                <Link href="https://facebook.com/sportsmockery" style={s.footerSocial}>Facebook</Link>
                <Text style={s.footerDot}>·</Text>
                <Link href="https://tiktok.com/@sportsmockery" style={s.footerSocial}>TikTok</Link>
              </Column>
            </Row>
            <Hr style={s.footerHr} />
            <Row>
              <Column align="center">
                <Link href={managePrefsUrl} style={s.footerLink}>Manage preferences</Link>
                <Text style={s.footerDot}>·</Text>
                <Link href={unsubscribeUrl} style={s.footerLink}>Unsubscribe</Link>
              </Column>
            </Row>
            <Text style={s.copyright}>© 2026 Edge by SportsMockery · Chicago, IL</Text>
            <Text style={s.footerNote}>You received this because you subscribed to Chicago Sports Daily.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// =============================================================================
// Styles
// =============================================================================

const s: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: DARK_BG,
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: DARK_BG,
  },

  // Header
  header: { padding: '16px 24px', backgroundColor: DARK_BG },
  headerLeft: { verticalAlign: 'middle' },
  headerSub: { color: TEXT_MUTED, fontSize: '11px', margin: '4px 0 0 0', lineHeight: '1.2' },
  headerRight: { verticalAlign: 'middle', textAlign: 'right' as const },
  headerDate: {
    color: TEXT_MUTED,
    fontSize: '12px',
    margin: 0,
    padding: '4px 10px',
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: '4px',
    display: 'inline-block',
  },

  // Briefing
  briefingSection: {
    margin: '0 24px 16px',
    padding: '16px 20px',
    borderLeft: `3px solid ${BRAND_RED}`,
    backgroundColor: CARD_BG,
    borderRadius: '0 8px 8px 0',
  },
  briefingLabel: {
    color: BRAND_RED,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    margin: '0 0 8px 0',
  },
  briefingText: {
    color: TEXT_WHITE,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  },

  // Hero Card
  heroCard: {
    margin: '0 24px 24px',
    padding: '16px',
    backgroundColor: CARD_BG,
    borderRadius: '12px',
    border: `1px solid ${BORDER_COLOR}`,
  },
  heroLabelRow: { marginBottom: '12px' },
  heroLabel: {
    color: BRAND_RED,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    margin: 0,
    backgroundColor: 'rgba(188,0,0,0.15)',
    padding: '4px 10px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  heroTeam: {
    color: TEXT_MUTED,
    fontSize: '11px',
    fontWeight: 500,
    margin: 0,
  },
  heroImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    display: 'block',
  },
  heroTitle: {
    color: TEXT_WHITE,
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: '1.3',
    margin: '16px 0 8px 0',
  },
  heroSummary: {
    color: TEXT_MUTED,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 8px 0',
  },
  heroMeta: {
    color: TEXT_DIM,
    fontSize: '12px',
    margin: '0 0 16px 0',
  },
  ctaButton: {
    backgroundColor: BRAND_RED,
    color: TEXT_WHITE,
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  },

  // Story List
  storiesSection: { padding: '0 24px 24px' },
  storyRow: {
    marginBottom: '20px',
    borderBottom: `1px solid ${BORDER_COLOR}`,
    paddingBottom: '20px',
  },
  storyImgCol: { width: '90px', verticalAlign: 'top' },
  storyImg: { borderRadius: '8px', display: 'block', objectFit: 'cover' as const },
  storyTextCol: { verticalAlign: 'top', paddingLeft: '14px' },
  storyTeam: {
    color: TEXT_DIM,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '1px',
    margin: '0 0 4px 0',
    textTransform: 'uppercase' as const,
  },
  storyTitle: {
    color: TEXT_WHITE,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '1.35',
    margin: '0 0 4px 0',
  },
  storySummary: {
    color: TEXT_MUTED,
    fontSize: '13px',
    lineHeight: '1.4',
    margin: '0 0 4px 0',
  },
  storyMeta: {
    color: TEXT_DIM,
    fontSize: '11px',
    margin: 0,
  },
  browseButton: {
    backgroundColor: BRAND_RED,
    color: TEXT_WHITE,
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '8px',
  },

  // Scout
  scoutSection: {
    margin: '0 24px 24px',
    padding: '24px',
    backgroundColor: CARD_BG,
    borderRadius: '12px',
    border: `1px solid ${BORDER_COLOR}`,
    textAlign: 'center' as const,
  },
  scoutIconCol: { width: '60px', verticalAlign: 'middle', textAlign: 'center' as const },
  scoutTextCol: { verticalAlign: 'middle', paddingLeft: '12px', textAlign: 'left' as const },
  scoutTitle: { color: TEXT_WHITE, fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' },
  scoutDesc: { color: TEXT_MUTED, fontSize: '13px', margin: 0, lineHeight: '1.4' },
  scoutCta: {
    backgroundColor: BRAND_RED,
    color: TEXT_WHITE,
    fontSize: '14px',
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '16px',
  },

  // Network
  networkSection: { padding: '0 24px 24px' },
  networkLabel: { color: TEXT_WHITE, fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0' },
  networkSub: { color: TEXT_MUTED, fontSize: '12px', margin: '0 0 16px 0' },
  showRow: {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: CARD_BG,
    borderRadius: '8px',
    border: `1px solid ${BORDER_COLOR}`,
  },
  showLogoCol: { width: '60px', verticalAlign: 'middle' },
  showLogo: { borderRadius: '8px', display: 'block' },
  showTextCol: { verticalAlign: 'middle', paddingLeft: '12px' },
  showName: { color: TEXT_WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' },
  showDesc: { color: TEXT_MUTED, fontSize: '12px', margin: 0 },

  // App
  appSection: { padding: '0 24px 24px' },
  appTitle: { color: TEXT_WHITE, fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' },
  appDesc: { color: TEXT_MUTED, fontSize: '13px', margin: '0 0 12px 0' },
  appFeature: { color: TEXT_MUTED, fontSize: '12px', margin: '0 0 4px 0', lineHeight: '1.5' },

  // Footer
  footer: { padding: '32px 24px', textAlign: 'center' as const },
  footerSocial: { color: TEXT_MUTED, fontSize: '12px', textDecoration: 'none' },
  footerDot: { color: TEXT_DIM, display: 'inline', margin: '0 8px', fontSize: '12px' },
  footerHr: { borderColor: BORDER_COLOR, borderWidth: '1px 0 0 0', margin: '16px 0' },
  footerLink: { color: CYAN, fontSize: '12px', textDecoration: 'underline' },
  copyright: { color: TEXT_DIM, fontSize: '11px', margin: '16px 0 4px 0' },
  footerNote: { color: TEXT_DIM, fontSize: '11px', margin: 0 },
};

export default ChicagoDailyEmail;

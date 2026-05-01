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
const BORDER = '#1E2530';
const WHITE = '#FAFAFB';
const MUTED = '#9CA3AF';
const DIM = '#6B7280';
const CYAN = '#00D4FF';

const SITE = 'https://test.sportsmockery.com';

const TEAM_LABELS: Record<Story['team'], string> = {
  Bears: 'BEARS', Bulls: 'BULLS', Cubs: 'CUBS',
  'White Sox': 'WHITE SOX', Blackhawks: 'BLACKHAWKS', Other: 'CHICAGO',
};

// =============================================================================
// Helpers
// =============================================================================

function utm(url: string, u?: ChicagoDailyEmailProps['utmParams']): string {
  if (!u) return url;
  const o = new URL(url);
  if (u.source) o.searchParams.set('utm_source', u.source);
  if (u.medium) o.searchParams.set('utm_medium', u.medium);
  if (u.campaign) o.searchParams.set('utm_campaign', u.campaign);
  return o.toString();
}

function trunc(t: string, n: number): string {
  return t.length <= n ? t : t.slice(0, n - 1).trim() + '\u2026';
}

function relTime(d: string): string {
  const h = Math.round((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h} hours ago`;
  if (h < 48) return 'Yesterday';
  return `${Math.round(h / 24)} days ago`;
}

function fmtViews(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K reads` : `${v} reads`;
}

// =============================================================================
// Component
// =============================================================================

export function ChicagoDailyEmail({
  date,
  stories,
  edgeInsights,
  briefingText,
  unsubscribeUrl,
  managePrefsUrl,
  previewText,
  utmParams = { source: 'email', medium: 'newsletter', campaign: 'chicago_daily' },
}: ChicagoDailyEmailProps) {
  const sorted = [...stories].sort((a, b) => b.views - a.views);
  const hero = sorted[0];
  const rest = sorted.slice(1, 7);
  const preview = previewText || (hero ? trunc(hero.summary || hero.title, 85) : 'Your Chicago sports briefing');

  const briefing = briefingText || (hero && edgeInsights?.length
    ? `${hero.title}. Plus: ${edgeInsights.slice(0, 2).map(i => i.text).join('. ')} and ${Math.max(0, stories.length - 1)} more.`
    : undefined);

  const u = utmParams;

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: DARK_BG, fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: 0, padding: 0, WebkitTextSizeAdjust: '100%' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: DARK_BG }}>

          {/* ── HEADER ─────────────────────────────────────── */}
          <Section style={{ padding: '20px 24px 16px' }}>
            <Row>
              <Column style={{ verticalAlign: 'middle', width: '50%' }}>
                <Link href={utm(SITE, u)} style={{ textDecoration: 'none' }}>
                  <Img
                    src={`${SITE}/email-logo.png`}
                    alt="EDGE"
                    width={120}
                    height={41}
                    style={{ display: 'block' }}
                  />
                </Link>
              </Column>
              <Column style={{ verticalAlign: 'middle', width: '50%', textAlign: 'right' as const }}>
                <Text style={{ color: MUTED, fontSize: '13px', margin: 0, padding: '5px 12px', border: `1px solid ${BORDER}`, borderRadius: '6px', display: 'inline-block', letterSpacing: '0.3px' }}>
                  {date}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Subtitle */}
          <Section style={{ padding: '0 24px 16px' }}>
            <Text style={{ color: DIM, fontSize: '12px', margin: 0, letterSpacing: '0.5px' }}>
              Your Chicago sports briefing &middot; 6am edition
            </Text>
          </Section>

          {/* ── TOP STORY CARD ─────────────────────────────── */}
          {hero && (
            <Section style={{ margin: '0 16px 20px', backgroundColor: CARD_BG, borderRadius: '12px', overflow: 'hidden' as const, border: `1px solid ${BORDER}` }}>
              {/* Team label row */}
              <Row style={{ padding: '12px 16px 8px' }}>
                <Column>
                  <Text style={{ color: BRAND_RED, fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', margin: 0, backgroundColor: 'rgba(188,0,0,0.12)', padding: '4px 10px', borderRadius: '4px', display: 'inline-block' }}>
                    TOP STORY
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={{ color: MUTED, fontSize: '11px', fontWeight: 500, margin: 0, letterSpacing: '0.5px' }}>
                    {TEAM_LABELS[hero.team]} &middot; {hero.category || 'News'}
                  </Text>
                </Column>
              </Row>

              {/* Hero image — full width within card */}
              <Section style={{ padding: '0 12px' }}>
                <Link href={utm(hero.url, u)} style={{ display: 'block' }}>
                  <Img
                    src={hero.imageUrl}
                    alt={hero.title}
                    width={568}
                    style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
                  />
                </Link>
              </Section>

              {/* Hero content */}
              <Section style={{ padding: '16px 16px 20px' }}>
                <Link href={utm(hero.url, u)} style={{ textDecoration: 'none' }}>
                  <Text style={{ color: WHITE, fontSize: '22px', fontWeight: 700, lineHeight: '1.3', margin: '0 0 10px 0' }}>
                    {hero.title}
                  </Text>
                </Link>
                {hero.summary && (
                  <Text style={{ color: MUTED, fontSize: '14px', lineHeight: '1.55', margin: '0 0 12px 0' }}>
                    {trunc(hero.summary, 160)}
                  </Text>
                )}
                <Text style={{ color: DIM, fontSize: '12px', margin: '0 0 18px 0' }}>
                  {hero.readTime || 5} min read &middot; {fmtViews(hero.views)} &middot; {relTime(hero.publishedAt)}
                </Text>
                <Button
                  href={utm(hero.url, u)}
                  style={{
                    backgroundColor: BRAND_RED,
                    color: WHITE,
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  See the full {TEAM_LABELS[hero.team].charAt(0) + TEAM_LABELS[hero.team].slice(1).toLowerCase()} breakdown &rarr;
                </Button>
              </Section>
            </Section>
          )}

          {/* ── STORY LIST ─────────────────────────────────── */}
          {rest.length > 0 && (
            <Section style={{ padding: '0 16px' }}>
              {rest.map((s) => (
                <Link key={s.id} href={utm(s.url, u)} style={{ textDecoration: 'none', display: 'block' }}>
                  <Row style={{ marginBottom: '4px', paddingBottom: '16px', paddingTop: '16px', borderBottom: `1px solid ${BORDER}` }}>
                    <Column style={{ width: '110px', verticalAlign: 'top' }}>
                      <Img
                        src={s.imageUrl}
                        alt={s.title}
                        width={110}
                        height={80}
                        style={{ borderRadius: '8px', display: 'block', objectFit: 'cover' as const }}
                      />
                    </Column>
                    <Column style={{ verticalAlign: 'top', paddingLeft: '14px' }}>
                      <Text style={{ color: DIM, fontSize: '10px', fontWeight: 600, letterSpacing: '1px', margin: '0 0 4px 0', textTransform: 'uppercase' as const }}>
                        {TEAM_LABELS[s.team]} &middot; {s.category || 'NEWS'}
                      </Text>
                      <Text style={{ color: WHITE, fontSize: '15px', fontWeight: 600, lineHeight: '1.35', margin: '0 0 6px 0' }}>
                        {trunc(s.title, 80)}
                      </Text>
                      {s.summary && (
                        <Text style={{ color: MUTED, fontSize: '13px', lineHeight: '1.4', margin: '0 0 6px 0' }}>
                          {trunc(s.summary, 100)}
                        </Text>
                      )}
                      <Text style={{ color: DIM, fontSize: '11px', margin: 0 }}>
                        {s.readTime || 5} min read &middot; {relTime(s.publishedAt)}
                      </Text>
                    </Column>
                  </Row>
                </Link>
              ))}

              {/* Browse all CTA */}
              <Section style={{ padding: '20px 0 24px', textAlign: 'center' as const }}>
                <Button
                  href={utm(`${SITE}/feed`, u)}
                  style={{
                    backgroundColor: BRAND_RED,
                    color: WHITE,
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '12px 28px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Browse all stories &rarr;
                </Button>
              </Section>
            </Section>
          )}

          {/* ── SCOUT AI ───────────────────────────────────── */}
          <Section style={{ margin: '0 16px 20px', padding: '20px', backgroundColor: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}` }}>
            <Row>
              <Column style={{ width: '52px', verticalAlign: 'middle' }}>
                <Img
                  src={`${SITE}/downloads/scout-v2.png`}
                  alt="Scout AI"
                  width={44}
                  height={44}
                  style={{ borderRadius: '10px', display: 'block' }}
                />
              </Column>
              <Column style={{ verticalAlign: 'middle', paddingLeft: '14px' }}>
                <Text style={{ color: WHITE, fontSize: '15px', fontWeight: 700, margin: '0 0 3px 0' }}>
                  Ask Scout anything about Chicago sports
                </Text>
                <Text style={{ color: MUTED, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                  Scout has the latest on Bears, Bulls, White Sox and more. Ask anything.
                </Text>
              </Column>
            </Row>
            <Section style={{ textAlign: 'center' as const, paddingTop: '16px' }}>
              <Button
                href={utm(`${SITE}/scout-ai`, u)}
                style={{
                  backgroundColor: BRAND_RED,
                  color: WHITE,
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '10px 22px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Try Scout now &rarr;
              </Button>
            </Section>
          </Section>

          {/* ── EDGE NETWORK ───────────────────────────────── */}
          <Section style={{ padding: '0 16px 20px' }}>
            <Text style={{ color: WHITE, fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0' }}>
              Also from the Edge network
            </Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 14px 0' }}>
              Podcasts and shows for Chicago fans
            </Text>

            {/* Untold Chicago Stories */}
            <Link href={utm(`${SITE}/untold-chicago-stories`, u)} style={{ textDecoration: 'none', display: 'block' }}>
              <Row style={{ marginBottom: '8px', padding: '12px', backgroundColor: CARD_BG, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                <Column style={{ width: '52px', verticalAlign: 'middle' }}>
                  <Img src={`${SITE}/downloads/untold-logo-dark.png`} alt="Untold Chicago Stories" width={40} height={40} style={{ borderRadius: '8px', display: 'block' }} />
                </Column>
                <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                  <Text style={{ color: WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }}>Untold Chicago Stories</Text>
                  <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Raw documentaries from across the city</Text>
                </Column>
              </Row>
            </Link>

            {/* Pinwheels & Ivy */}
            <Link href={utm(`${SITE}/pinwheels-and-ivy`, u)} style={{ textDecoration: 'none', display: 'block' }}>
              <Row style={{ marginBottom: '8px', padding: '12px', backgroundColor: CARD_BG, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                <Column style={{ width: '52px', verticalAlign: 'middle' }}>
                  <Img src={`${SITE}/downloads/pinwheels-ivy-logo-dark.png`} alt="Pinwheels and Ivy" width={40} height={40} style={{ borderRadius: '8px', display: 'block' }} />
                </Column>
                <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                  <Text style={{ color: WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }}>Pinwheels &amp; Ivy</Text>
                  <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Your daily Cubs podcast</Text>
                </Column>
              </Row>
            </Link>

            {/* Southside Behavior */}
            <Link href={utm(SITE, u)} style={{ textDecoration: 'none', display: 'block' }}>
              <Row style={{ padding: '12px', backgroundColor: CARD_BG, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                <Column style={{ width: '52px', verticalAlign: 'middle' }}>
                  <Img src={`${SITE}/youtubelogos/ssb-logo.png`} alt="Southside Behavior" width={40} height={40} style={{ borderRadius: '10px', display: 'block' }} />
                </Column>
                <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                  <Text style={{ color: WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }}>Southside Behavior</Text>
                  <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>White Sox talk, no filter</Text>
                </Column>
              </Row>
            </Link>
          </Section>

          {/* ── GET THE EDGE APP ────────────────────────────── */}
          <Section style={{ padding: '0 16px 24px' }}>
            <Text style={{ color: WHITE, fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>Get the Edge App</Text>
            <Text style={{ color: MUTED, fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              Real-time scores, alerts, and live win-probability on your phone.
            </Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 4px 0', lineHeight: '1.6' }}>&middot; Live scores with real-time win probability</Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 4px 0', lineHeight: '1.6' }}>&middot; Breaking news alerts for your favorite teams</Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.6' }}>&middot; Personalized feed &mdash; only the teams you follow</Text>
            <Row>
              <Column style={{ width: '140px', paddingRight: '8px' }}>
                <Link href="https://apps.apple.com" style={{ display: 'inline-block' }}>
                  <Img
                    src={`${SITE}/app-store-badge.png`}
                    alt="Download on the App Store"
                    width={120}
                    height={40}
                    style={{ display: 'block' }}
                  />
                </Link>
              </Column>
              <Column>
                <Link href="https://play.google.com" style={{ display: 'inline-block' }}>
                  <Img
                    src={`${SITE}/google-play-badge.png`}
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    style={{ display: 'block' }}
                  />
                </Link>
              </Column>
            </Row>
          </Section>

          {/* ── FOOTER ─────────────────────────────────────── */}
          <Section style={{ padding: '24px 16px 32px', textAlign: 'center' as const }}>
            <Row>
              <Column align="center">
                <Link href="https://x.com/sportsmockery" style={{ color: MUTED, fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>X</Link>
                <Text style={{ color: DIM, display: 'inline', margin: '0 12px', fontSize: '12px' }}>&middot;</Text>
                <Link href="https://facebook.com/sportsmockery" style={{ color: MUTED, fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>Facebook</Link>
                <Text style={{ color: DIM, display: 'inline', margin: '0 12px', fontSize: '12px' }}>&middot;</Text>
                <Link href="https://tiktok.com/@sportsmockery" style={{ color: MUTED, fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>TikTok</Link>
              </Column>
            </Row>

            <Hr style={{ borderColor: BORDER, borderWidth: '1px 0 0 0', margin: '16px 0' }} />

            <Row>
              <Column align="center">
                <Link href={managePrefsUrl} style={{ color: CYAN, fontSize: '12px', textDecoration: 'underline', fontWeight: 500 }}>Manage preferences</Link>
                <Text style={{ color: DIM, display: 'inline', margin: '0 12px', fontSize: '12px' }}>&middot;</Text>
                <Link href={unsubscribeUrl} style={{ color: CYAN, fontSize: '12px', textDecoration: 'underline', fontWeight: 500 }}>Unsubscribe</Link>
              </Column>
            </Row>

            <Text style={{ color: DIM, fontSize: '11px', margin: '16px 0 4px 0' }}>
              &copy; 2026 Edge by SportsMockery &middot; Chicago, IL
            </Text>
            <Text style={{ color: DIM, fontSize: '11px', margin: 0 }}>
              You received this because you subscribed to Chicago Sports Daily.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ChicagoDailyEmail;

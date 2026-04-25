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
  return t.length <= n ? t : t.slice(0, n - 1).trim() + '…';
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
      <Body style={{ backgroundColor: DARK_BG, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: DARK_BG }}>

          {/* ── HEADER ─────────────────────────────────────── */}
          <Section style={{ padding: '16px 24px', backgroundColor: DARK_BG }}>
            <Row>
              <Column style={{ verticalAlign: 'bottom' }}>
                <Img
                  src={`${SITE}/edge_logo.png`}
                  alt="EDGE"
                  width={90}
                  height={25}
                  style={{ display: 'block' }}
                />
                <Text style={{ color: MUTED, fontSize: '11px', margin: '4px 0 0 0', lineHeight: '1' }}>
                  Your Chicago sports briefing · 6am edition
                </Text>
              </Column>
              <Column style={{ verticalAlign: 'middle', textAlign: 'right' as const }}>
                <Text style={{ color: MUTED, fontSize: '12px', margin: 0, padding: '5px 12px', border: `1px solid ${BORDER}`, borderRadius: '4px', display: 'inline-block' }}>
                  {date}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── TODAY'S BRIEFING ────────────────────────────── */}
          {briefing && (
            <Section style={{ margin: '0 24px 16px', padding: '16px 20px', borderLeft: `3px solid ${BRAND_RED}`, backgroundColor: CARD_BG, borderRadius: '0 8px 8px 0' }}>
              <Text style={{ color: BRAND_RED, fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', margin: '0 0 8px 0' }}>
                TODAY&apos;S BRIEFING
              </Text>
              <Text style={{ color: WHITE, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {trunc(briefing, 220)}
              </Text>
            </Section>
          )}

          {/* ── TOP STORY CARD ─────────────────────────────── */}
          {hero && (
            <Section style={{ margin: '0 24px 24px', padding: '0', backgroundColor: CARD_BG, borderRadius: '12px', overflow: 'hidden' as const }}>
              {/* Labels row */}
              <Row style={{ padding: '12px 16px 0' }}>
                <Column>
                  <Text style={{ color: BRAND_RED, fontSize: '10px', fontWeight: 700, letterSpacing: '1px', margin: 0, backgroundColor: 'rgba(188,0,0,0.15)', padding: '3px 8px', borderRadius: '3px', display: 'inline-block' }}>
                    TOP STORY
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={{ color: MUTED, fontSize: '11px', margin: 0 }}>
                    {TEAM_LABELS[hero.team]}{hero.category ? ` · ${hero.category}` : ' · News'}
                  </Text>
                </Column>
              </Row>
              {/* Image */}
              <Section style={{ padding: '12px 16px 0' }}>
                <Link href={utm(hero.url, u)} style={{ display: 'block' }}>
                  <Img src={hero.imageUrl} alt={hero.title} width={536} style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                </Link>
              </Section>
              {/* Content */}
              <Section style={{ padding: '16px' }}>
                <Link href={utm(hero.url, u)} style={{ textDecoration: 'none' }}>
                  <Text style={{ color: WHITE, fontSize: '22px', fontWeight: 700, lineHeight: '1.3', margin: '0 0 10px 0' }}>
                    {hero.title}
                  </Text>
                </Link>
                {hero.summary && (
                  <Text style={{ color: MUTED, fontSize: '14px', lineHeight: '1.5', margin: '0 0 8px 0' }}>
                    {trunc(hero.summary, 150)}
                  </Text>
                )}
                <Text style={{ color: DIM, fontSize: '12px', margin: '0 0 16px 0' }}>
                  {hero.readTime || 5} min read · {fmtViews(hero.views)} · {relTime(hero.publishedAt)}
                </Text>
                <Button href={utm(hero.url, u)} style={{ backgroundColor: BRAND_RED, color: WHITE, fontSize: '14px', fontWeight: 600, padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
                  See the full {TEAM_LABELS[hero.team].charAt(0) + TEAM_LABELS[hero.team].slice(1).toLowerCase()} breakdown →
                </Button>
              </Section>
            </Section>
          )}

          {/* ── STORY LIST ─────────────────────────────────── */}
          {rest.length > 0 && (
            <Section style={{ padding: '0 24px' }}>
              {rest.map((s) => (
                <Row key={s.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${BORDER}` }}>
                  <Column style={{ width: '90px', verticalAlign: 'top' }}>
                    <Link href={utm(s.url, u)}>
                      <Img src={s.imageUrl} alt={s.title} width={90} height={70} style={{ borderRadius: '8px', display: 'block', objectFit: 'cover' as const }} />
                    </Link>
                  </Column>
                  <Column style={{ verticalAlign: 'top', paddingLeft: '14px' }}>
                    <Text style={{ color: DIM, fontSize: '10px', fontWeight: 600, letterSpacing: '1px', margin: '0 0 4px 0', textTransform: 'uppercase' as const }}>
                      {TEAM_LABELS[s.team]} · {s.category || 'NEWS'}
                    </Text>
                    <Link href={utm(s.url, u)} style={{ textDecoration: 'none' }}>
                      <Text style={{ color: WHITE, fontSize: '15px', fontWeight: 600, lineHeight: '1.35', margin: '0 0 4px 0' }}>
                        {trunc(s.title, 80)}
                      </Text>
                    </Link>
                    {s.summary && (
                      <Text style={{ color: MUTED, fontSize: '13px', lineHeight: '1.4', margin: '0 0 4px 0' }}>
                        {trunc(s.summary, 100)}
                      </Text>
                    )}
                    <Text style={{ color: DIM, fontSize: '11px', margin: 0 }}>
                      {s.readTime || 5} min read · {relTime(s.publishedAt)}
                    </Text>
                  </Column>
                </Row>
              ))}
              <Button href={utm(`${SITE}/feed`, u)} style={{ backgroundColor: BRAND_RED, color: WHITE, fontSize: '14px', fontWeight: 600, padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', marginBottom: '24px' }}>
                Browse all stories →
              </Button>
            </Section>
          )}

          {/* ── SCOUT AI ───────────────────────────────────── */}
          <Section style={{ margin: '0 24px 24px', padding: '24px', backgroundColor: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}`, textAlign: 'center' as const }}>
            <Row>
              <Column style={{ width: '56px', verticalAlign: 'middle' }}>
                <Img src={`${SITE}/downloads/scout-v2.png`} alt="Scout" width={44} height={44} style={{ borderRadius: '10px', display: 'block' }} />
              </Column>
              <Column style={{ verticalAlign: 'middle', paddingLeft: '12px', textAlign: 'left' as const }}>
                <Text style={{ color: WHITE, fontSize: '15px', fontWeight: 700, margin: '0 0 3px 0' }}>
                  Ask Scout anything about Chicago sports
                </Text>
                <Text style={{ color: MUTED, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                  Scout has the latest on Bears, Bulls, White Sox and more. Ask anything.
                </Text>
              </Column>
            </Row>
            <Button href={utm(`${SITE}/scout-ai`, u)} style={{ backgroundColor: BRAND_RED, color: WHITE, fontSize: '14px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', marginTop: '16px' }}>
              Try Scout now →
            </Button>
          </Section>

          {/* ── EDGE NETWORK ───────────────────────────────── */}
          <Section style={{ padding: '0 24px 24px' }}>
            <Text style={{ color: WHITE, fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0' }}>
              Also from the Edge network
            </Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 16px 0' }}>
              Podcasts and shows for Chicago fans
            </Text>

            {/* Untold Chicago Stories */}
            <Link href={utm(`${SITE}/untold-chicago-stories`, u)} style={{ textDecoration: 'none' }}>
              <Row style={{ marginBottom: '10px', padding: '12px', backgroundColor: CARD_BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <Column style={{ width: '56px', verticalAlign: 'middle' }}>
                  <Img src={`${SITE}/downloads/untold-logo-dark.png`} alt="UNTLD" width={44} height={44} style={{ borderRadius: '8px', display: 'block' }} />
                </Column>
                <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                  <Text style={{ color: WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }}>Untold Chicago Stories</Text>
                  <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Raw documentaries from across the city</Text>
                </Column>
              </Row>
            </Link>

            {/* Pinwheels & Ivy */}
            <Link href={utm(`${SITE}/pinwheels-and-ivy`, u)} style={{ textDecoration: 'none' }}>
              <Row style={{ marginBottom: '10px', padding: '12px', backgroundColor: CARD_BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <Column style={{ width: '56px', verticalAlign: 'middle' }}>
                  <Img src={`${SITE}/downloads/pinwheels-ivy-logo-dark.png`} alt="Pinwheels & Ivy" width={44} height={44} style={{ borderRadius: '8px', display: 'block' }} />
                </Column>
                <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                  <Text style={{ color: WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }}>Pinwheels & Ivy</Text>
                  <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Your daily Cubs podcast</Text>
                </Column>
              </Row>
            </Link>

            {/* No Strokes Golf */}
            <Link href={utm(`${SITE}`, u)} style={{ textDecoration: 'none' }}>
              <Row style={{ padding: '12px', backgroundColor: CARD_BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <Column style={{ width: '56px', verticalAlign: 'middle' }}>
                  <Img src={`${SITE}/youtubelogos/ssb-logo.png`} alt="No Strokes Golf" width={44} height={44} style={{ borderRadius: '8px', display: 'block' }} />
                </Column>
                <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                  <Text style={{ color: WHITE, fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0' }}>No Strokes Golf</Text>
                  <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Golf without the handicap</Text>
                </Column>
              </Row>
            </Link>
          </Section>

          {/* ── GET THE EDGE APP ────────────────────────────── */}
          <Section style={{ padding: '0 24px 24px' }}>
            <Text style={{ color: WHITE, fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>Get the Edge App</Text>
            <Text style={{ color: MUTED, fontSize: '13px', margin: '0 0 12px 0' }}>
              Real-time scores, alerts, and live win-probability on your phone.
            </Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 4px 0', lineHeight: '1.5' }}>· Live scores with real-time win probability</Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 4px 0', lineHeight: '1.5' }}>· Breaking news alerts for your favorite teams</Text>
            <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.5' }}>· Personalized feed — only the teams you follow</Text>
            <Row>
              <Column style={{ width: '140px' }}>
                <Img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on App Store" width={120} height={40} style={{ display: 'block' }} />
              </Column>
              <Column>
                <Img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" width={135} height={40} style={{ display: 'block' }} />
              </Column>
            </Row>
          </Section>

          {/* ── FOOTER ─────────────────────────────────────── */}
          <Section style={{ padding: '32px 24px', textAlign: 'center' as const }}>
            <Row>
              <Column align="center">
                <Link href="https://x.com/sportsmockery" style={{ color: MUTED, fontSize: '12px', textDecoration: 'none' }}>X</Link>
                <Text style={{ color: DIM, display: 'inline', margin: '0 10px', fontSize: '12px' }}>·</Text>
                <Link href="https://facebook.com/sportsmockery" style={{ color: MUTED, fontSize: '12px', textDecoration: 'none' }}>Facebook</Link>
                <Text style={{ color: DIM, display: 'inline', margin: '0 10px', fontSize: '12px' }}>·</Text>
                <Link href="https://tiktok.com/@sportsmockery" style={{ color: MUTED, fontSize: '12px', textDecoration: 'none' }}>TikTok</Link>
              </Column>
            </Row>
            <Hr style={{ borderColor: BORDER, borderWidth: '1px 0 0 0', margin: '16px 0' }} />
            <Row>
              <Column align="center">
                <Link href={managePrefsUrl} style={{ color: CYAN, fontSize: '12px', textDecoration: 'underline' }}>Manage preferences</Link>
                <Text style={{ color: DIM, display: 'inline', margin: '0 10px', fontSize: '12px' }}>·</Text>
                <Link href={unsubscribeUrl} style={{ color: CYAN, fontSize: '12px', textDecoration: 'underline' }}>Unsubscribe</Link>
              </Column>
            </Row>
            <Text style={{ color: DIM, fontSize: '11px', margin: '16px 0 4px 0' }}>
              © 2026 Edge by SportsMockery · Chicago, IL
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

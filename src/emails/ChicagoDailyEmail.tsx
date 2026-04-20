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
  summary?: string;
  publishedAt: string;
  views: number;
};

export type GameResult = {
  id: string;
  team: 'Bears' | 'Bulls' | 'Cubs' | 'White Sox' | 'Blackhawks';
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

export type ChicagoDailyEmailProps = {
  date: string;
  stories: Story[];
  gameResults?: GameResult[];
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
// Constants — Edge Brand Palette
// =============================================================================

const EDGE_BLACK = '#0B0F14';
const EDGE_WHITE = '#FAFAFB';
const EDGE_RED = '#BC0000';
const EDGE_CYAN = '#00D4FF';
const EDGE_GOLD = '#D6B05E';

const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#64748B';
const TEXT_MUTED = '#94A3B8';
const DIVIDER = '#E2E8F0';
const CARD_BG = '#FFFFFF';
const BODY_BG = '#F1F5F9';

const BASE_URL = 'https://test.sportsmockery.com';

const TEAM_COLORS: Record<string, string> = {
  Bears: '#C83803',
  Bulls: '#CE1141',
  Cubs: '#0E3386',
  'White Sox': '#27251F',
  Blackhawks: '#00833E',
  Other: EDGE_RED,
};

const TEAM_LOGOS: Record<string, string> = {
  Bears: `${BASE_URL}/ar/bears-logo.png`,
  Bulls: `${BASE_URL}/ar/bulls-logo.png`,
  Cubs: `${BASE_URL}/ar/cubs-logo.png`,
  'White Sox': `${BASE_URL}/ar/whitesox-logo.png`,
  Blackhawks: `${BASE_URL}/ar/blackhawks-logo.png`,
};

// Channel branding — uses light-bg logos (black/dark text versions)
const CHANNELS = {
  untold: {
    name: 'Untold Chicago Stories',
    tagline: 'The stories Chicago forgot. Raw. Real. Untold.',
    url: 'https://www.youtube.com/@untoldchicago',
    logo: `${BASE_URL}/downloads/untold-logo.png`,
    color: '#BC0000',
    borderColor: '#BC0000',
  },
  pinwheels: {
    name: 'Pinwheels & Ivy',
    tagline: 'Your Cubs podcast. Every pitch. Every play.',
    url: 'https://www.youtube.com/c/PinwheelsandIvyPodcast',
    logo: `${BASE_URL}/downloads/pinwheels-ivy-logo.png`,
    color: '#2D8B2D',
    borderColor: '#2D8B2D',
  },
  nostrokes: {
    name: 'No Strokes Golf Podcast',
    tagline: 'Golf without the handicap. Pure entertainment.',
    url: 'https://www.youtube.com/@nostrokes',
    logo: `${BASE_URL}/downloads/nostrokes-logo.png`,
    color: '#1B5E3B',
    borderColor: '#1B5E3B',
  },
};

const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/sportsmockery',
  youtube: 'https://youtube.com/@sportsmockery',
  instagram: 'https://instagram.com/sportsmockery',
  facebook: 'https://facebook.com/sportsmockery',
  tiktok: 'https://tiktok.com/@sportsmockery',
};

// =============================================================================
// Utilities
// =============================================================================

function addUtmParams(
  url: string,
  utm?: ChicagoDailyEmailProps['utmParams']
): string {
  if (!utm) return url;
  try {
    const urlObj = new URL(url);
    if (utm.source) urlObj.searchParams.set('utm_source', utm.source);
    if (utm.medium) urlObj.searchParams.set('utm_medium', utm.medium);
    if (utm.campaign) urlObj.searchParams.set('utm_campaign', utm.campaign);
    return urlObj.toString();
  } catch {
    return url;
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim() + '…';
}

function hasImage(url?: string): boolean {
  if (!url) return false;
  if (url.includes('placeholder')) return false;
  return url.startsWith('http');
}

// =============================================================================
// Component
// =============================================================================

export function ChicagoDailyEmail({
  date,
  stories,
  gameResults = [],
  showAppPromo = true,
  unsubscribeUrl,
  managePrefsUrl,
  previewText,
  utmParams = {
    source: 'email',
    medium: 'newsletter',
    campaign: 'chicago_daily',
  },
}: ChicagoDailyEmailProps) {
  // All stories sorted by views, highest first
  const sortedStories = [...stories].sort((a, b) => b.views - a.views);
  const hotStory = sortedStories[0];
  const remainingStories = sortedStories.slice(1);

  const preview =
    previewText ||
    (heroStory
      ? truncate(heroStory.summary || heroStory.title, 90)
      : 'Your daily Chicago sports intelligence briefing');

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Container style={s.wrapper}>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HEADER — Edge Branding                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Section style={s.header}>
            <Row>
              <Column style={s.headerLogoCol}>
                <Img
                  src={`${BASE_URL}/edge-logo-blue.png`}
                  alt="Edge"
                  width={120}
                  style={{ display: 'block' }}
                />
              </Column>
              <Column style={s.headerRight}>
                <Text style={s.headerDate}>{date}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={s.headerTagline}>
                  Chicago Sports Intelligence
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Cyan accent line */}
          <Section style={s.cyanLine} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* GAME SCORES — Yesterday's Results                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {gameResults.length > 0 && (
            <Section style={s.scoresSection}>
              <Text style={s.scoresSectionLabel}>YESTERDAY'S SCORES</Text>
              {gameResults.map((game) => (
                <Section key={game.id} style={s.scoreCard}>
                  <Row>
                    <Column style={s.scoreResultCol}>
                      <Text
                        style={{
                          ...s.scoreResultBadge,
                          backgroundColor:
                            game.result === 'W'
                              ? '#16A34A'
                              : game.result === 'OTL'
                                ? EDGE_GOLD
                                : '#DC2626',
                        }}
                      >
                        {game.result}
                      </Text>
                    </Column>
                    <Column style={s.scoreTeamsCol}>
                      <Text style={s.scoreTeamName}>
                        {game.team}
                      </Text>
                      <Text style={s.scoreOpponent}>
                        {game.isHome ? 'vs' : '@'} {game.opponentFull}
                      </Text>
                    </Column>
                    <Column style={s.scoreNumbersCol}>
                      <Text style={s.scoreFinal}>
                        {game.teamScore} – {game.opponentScore}
                      </Text>
                    </Column>
                    <Column style={s.scoreLinkCol}>
                      <Link
                        href={addUtmParams(game.scoresUrl, utmParams)}
                        style={s.scoreViewLink}
                      >
                        Box Score →
                      </Link>
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HOT STORY                                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {hotStory && (
            <Section style={s.heroSection}>
              {hasImage(hotStory.imageUrl) && (
                <Link
                  href={addUtmParams(hotStory.url, utmParams)}
                  style={{ textDecoration: 'none' }}
                >
                  <Img
                    src={hotStory.imageUrl}
                    alt={hotStory.title}
                    width={600}
                    style={s.heroImage}
                  />
                </Link>
              )}
              <Section style={s.heroContent}>
                <Text style={s.hotBadgeRow}>
                  <span style={s.hotBadge as any}>HOT STORY</span>
                  {'  '}
                  <span style={{ ...(s.heroTeamPillInline as any), backgroundColor: TEAM_COLORS[hotStory.team] || EDGE_RED }}>
                    {hotStory.team.toUpperCase()}
                  </span>
                  {'  '}
                  {hotStory.views > 0 && (
                    <span style={s.hotViews as any}>
                      {hotStory.views.toLocaleString()} views
                    </span>
                  )}
                </Text>
                <Link
                  href={addUtmParams(hotStory.url, utmParams)}
                  style={{ textDecoration: 'none' }}
                >
                  <Text style={s.heroTitle}>{hotStory.title}</Text>
                </Link>
                {hotStory.summary && (
                  <Text style={s.heroSummary}>
                    {truncate(hotStory.summary, 180)}
                  </Text>
                )}
                <Button
                  href={addUtmParams(hotStory.url, utmParams)}
                  style={s.heroCta}
                >
                  Read Full Story →
                </Button>
              </Section>
            </Section>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ALL STORIES — sorted by views, top down                       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {remainingStories.length > 0 && (
            <Section style={s.storiesSection}>
              <Text style={s.sectionLabel}>TODAY'S STORIES</Text>
              {remainingStories.map((story, idx) => (
                <Section key={story.id} style={{
                  ...s.storyCard,
                  ...(idx === remainingStories.length - 1 ? { borderBottom: 'none', marginBottom: 0, paddingBottom: 0 } : {}),
                }}>
                  <Row>
                    {hasImage(story.imageUrl) && (
                      <Column style={s.storyImageCol}>
                        <Link href={addUtmParams(story.url, utmParams)}>
                          <Img
                            src={story.imageUrl}
                            alt={story.title}
                            width={120}
                            height={90}
                            style={s.storyImage}
                          />
                        </Link>
                      </Column>
                    )}
                    <Column style={hasImage(story.imageUrl) ? s.storyTextCol : s.storyTextColFull}>
                      <Text
                        style={{
                          ...s.storyTeamLabel,
                          color: TEAM_COLORS[story.team] || EDGE_RED,
                        }}
                      >
                        {story.team.toUpperCase()}
                        {story.views > 0 && (
                          <span style={{ color: TEXT_MUTED, fontWeight: 400, letterSpacing: '0' }}>
                            {' '}· {story.views.toLocaleString()} views
                          </span>
                        )}
                      </Text>
                      <Link
                        href={addUtmParams(story.url, utmParams)}
                        style={{ textDecoration: 'none' }}
                      >
                        <Text style={s.storyTitle}>
                          {truncate(story.title, 80)}
                        </Text>
                      </Link>
                      {story.summary && (
                        <Text style={s.storySummary}>
                          {truncate(story.summary, 100)}
                        </Text>
                      )}
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SCOUT AI CTA                                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Section style={s.scoutSection}>
            <Row>
              <Column style={s.scoutIconCol}>
                <Img
                  src={`${BASE_URL}/downloads/scout-v2.png`}
                  alt="Scout AI"
                  width={48}
                  height={48}
                  style={{ display: 'block', borderRadius: '12px' }}
                />
              </Column>
              <Column style={s.scoutTextCol}>
                <Text style={s.scoutTitle}>Ask Scout AI</Text>
                <Text style={s.scoutDesc}>
                  Get instant AI-powered analysis on any Chicago sports question
                </Text>
              </Column>
            </Row>
            <Button
              href={addUtmParams(`${BASE_URL}/ask-ai`, utmParams)}
              style={s.scoutCta}
            >
              Try Scout AI →
            </Button>
          </Section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* APP PROMO                                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {showAppPromo && (
            <Section style={s.appSection}>
              <Text style={s.appTitle}>Get the Edge App</Text>
              <Text style={s.appDesc}>
                Breaking news alerts, live scores, and Scout AI in your pocket.
              </Text>
              <Row>
                <Column align="center" style={{ paddingRight: '6px' }}>
                  <Link href="https://apps.apple.com/app/sportsmockery">
                    <Img
                      src={`${BASE_URL}/app-store-badge.svg`}
                      alt="Download on App Store"
                      width={120}
                      height={40}
                      style={{ display: 'block' }}
                    />
                  </Link>
                </Column>
                <Column align="center" style={{ paddingLeft: '6px' }}>
                  <Link href="https://play.google.com/store/apps/details?id=com.sportsmockery">
                    <Img
                      src={`${BASE_URL}/google-play-badge.svg`}
                      alt="Get on Google Play"
                      width={135}
                      height={40}
                      style={{ display: 'block' }}
                    />
                  </Link>
                </Column>
              </Row>
            </Section>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* YOUTUBE CHANNELS                                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Section style={s.channelsSection}>
            <Text style={s.channelsSectionTitle}>FROM OUR CHANNELS</Text>

            {/* Untold Chicago */}
            <Section style={{ ...s.channelCard, borderLeft: `4px solid ${CHANNELS.untold.borderColor}` }}>
              <Row>
                <Column style={s.channelLogoCol}>
                  <Link href={CHANNELS.untold.url}>
                    <Img
                      src={CHANNELS.untold.logo}
                      alt={CHANNELS.untold.name}
                      width={100}
                      style={s.channelLogo}
                    />
                  </Link>
                </Column>
                <Column style={s.channelInfoCol}>
                  <Link href={CHANNELS.untold.url} style={{ textDecoration: 'none' }}>
                    <Text style={s.channelName}>{CHANNELS.untold.name}</Text>
                  </Link>
                  <Text style={s.channelTagline}>{CHANNELS.untold.tagline}</Text>
                </Column>
                <Column style={s.channelBtnCol}>
                  <Link href={CHANNELS.untold.url} style={{ ...s.channelWatchBtn, color: CHANNELS.untold.color }}>
                    Watch →
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* Pinwheels & Ivy */}
            <Section style={{ ...s.channelCard, borderLeft: `4px solid ${CHANNELS.pinwheels.borderColor}` }}>
              <Row>
                <Column style={s.channelLogoCol}>
                  <Link href={CHANNELS.pinwheels.url}>
                    <Img
                      src={CHANNELS.pinwheels.logo}
                      alt={CHANNELS.pinwheels.name}
                      width={100}
                      style={s.channelLogo}
                    />
                  </Link>
                </Column>
                <Column style={s.channelInfoCol}>
                  <Link href={CHANNELS.pinwheels.url} style={{ textDecoration: 'none' }}>
                    <Text style={s.channelName}>{CHANNELS.pinwheels.name}</Text>
                  </Link>
                  <Text style={s.channelTagline}>{CHANNELS.pinwheels.tagline}</Text>
                </Column>
                <Column style={s.channelBtnCol}>
                  <Link href={CHANNELS.pinwheels.url} style={{ ...s.channelWatchBtn, color: CHANNELS.pinwheels.color }}>
                    Watch →
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* No Strokes Golf */}
            <Section style={{ ...s.channelCard, borderLeft: `4px solid ${CHANNELS.nostrokes.borderColor}` }}>
              <Row>
                <Column style={s.channelLogoCol}>
                  <Link href={CHANNELS.nostrokes.url}>
                    <Img
                      src={CHANNELS.nostrokes.logo}
                      alt={CHANNELS.nostrokes.name}
                      width={100}
                      style={s.channelLogo}
                    />
                  </Link>
                </Column>
                <Column style={s.channelInfoCol}>
                  <Link href={CHANNELS.nostrokes.url} style={{ textDecoration: 'none' }}>
                    <Text style={s.channelName}>{CHANNELS.nostrokes.name}</Text>
                  </Link>
                  <Text style={s.channelTagline}>{CHANNELS.nostrokes.tagline}</Text>
                </Column>
                <Column style={s.channelBtnCol}>
                  <Link href={CHANNELS.nostrokes.url} style={{ ...s.channelWatchBtn, color: CHANNELS.nostrokes.color }}>
                    Watch →
                  </Link>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* EDGE CTA                                                      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Section style={s.edgeCtaSection}>
            <Text style={s.edgeCtaTitle}>Experience Edge</Text>
            <Text style={s.edgeCtaDesc}>
              Live scores, AI analysis, GM trade simulator, mock drafts, and more.
            </Text>
            <Button
              href={addUtmParams(BASE_URL, utmParams)}
              style={s.edgeCtaBtn}
            >
              Visit Edge →
            </Button>
          </Section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FOOTER                                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Section style={s.footer}>
            <Img
              src={`${BASE_URL}/edge-logo-blue.png`}
              alt="Edge"
              width={90}
              style={{ display: 'block', margin: '0 auto 16px' }}
            />

            {/* Social Links */}
            <Row>
              <Column align="center">
                <Link href={SOCIAL_LINKS.twitter} style={s.socialLink}>
                  𝕏
                </Link>
                <Text style={s.socialDot}>·</Text>
                <Link href={SOCIAL_LINKS.youtube} style={s.socialLink}>
                  YouTube
                </Link>
                <Text style={s.socialDot}>·</Text>
                <Link href={SOCIAL_LINKS.instagram} style={s.socialLink}>
                  Instagram
                </Link>
                <Text style={s.socialDot}>·</Text>
                <Link href={SOCIAL_LINKS.facebook} style={s.socialLink}>
                  Facebook
                </Link>
                <Text style={s.socialDot}>·</Text>
                <Link href={SOCIAL_LINKS.tiktok} style={s.socialLink}>
                  TikTok
                </Link>
              </Column>
            </Row>

            <Hr style={s.footerDivider} />

            <Row>
              <Column align="center">
                <Link href={managePrefsUrl} style={s.footerLink}>
                  Manage Preferences
                </Link>
                <Text style={s.socialDot}>·</Text>
                <Link href={unsubscribeUrl} style={s.footerLink}>
                  Unsubscribe
                </Link>
              </Column>
            </Row>

            <Text style={s.footerCopyright}>
              © {new Date().getFullYear()} Edge by SportsMockery · Chicago, IL
            </Text>
            <Text style={s.footerLegal}>
              You received this email because you subscribed to the Chicago
              Sports Daily newsletter.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// =============================================================================
// Styles — Apple-inspired, email-safe inline CSS
// =============================================================================

const s: Record<string, React.CSSProperties> = {
  // Layout
  body: {
    backgroundColor: BODY_BG,
    fontFamily:
      "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: 0,
    WebkitFontSmoothing: 'antialiased' as any,
  },
  wrapper: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: CARD_BG,
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    backgroundColor: EDGE_BLACK,
    padding: '28px 32px 12px',
  },
  headerLogoCol: {
    verticalAlign: 'middle',
    width: '50%',
  },
  headerRight: {
    verticalAlign: 'middle',
    textAlign: 'right' as const,
    width: '50%',
  },
  headerDate: {
    color: TEXT_MUTED,
    fontSize: '13px',
    fontWeight: 500,
    margin: 0,
    letterSpacing: '0.3px',
  },
  headerTagline: {
    color: EDGE_CYAN,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    margin: '8px 0 0',
    paddingBottom: '16px',
  },

  // Cyan accent
  cyanLine: {
    height: '3px',
    backgroundColor: EDGE_CYAN,
    margin: 0,
    padding: 0,
    lineHeight: '0',
    fontSize: '0',
  },

  // ── Game Scores ─────────────────────────────────────────────────────
  scoresSection: {
    padding: '24px 32px 8px',
    backgroundColor: EDGE_BLACK,
  },
  scoresSectionLabel: {
    color: EDGE_CYAN,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    margin: '0 0 16px',
  },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  scoreResultCol: {
    width: '44px',
    verticalAlign: 'middle',
  },
  scoreResultBadge: {
    display: 'inline-block',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.5px',
    padding: '4px 10px',
    borderRadius: '6px',
    margin: 0,
    textAlign: 'center' as const,
  },
  scoreTeamsCol: {
    verticalAlign: 'middle',
    paddingLeft: '12px',
  },
  scoreTeamName: {
    color: EDGE_WHITE,
    fontSize: '15px',
    fontWeight: 700,
    margin: 0,
    lineHeight: '1.3',
  },
  scoreOpponent: {
    color: TEXT_MUTED,
    fontSize: '13px',
    fontWeight: 400,
    margin: '2px 0 0',
    lineHeight: '1.3',
  },
  scoreNumbersCol: {
    verticalAlign: 'middle',
    textAlign: 'right' as const,
    width: '80px',
  },
  scoreFinal: {
    color: EDGE_WHITE,
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '1px',
  },
  scoreLinkCol: {
    verticalAlign: 'middle',
    textAlign: 'right' as const,
    width: '90px',
    paddingLeft: '8px',
  },
  scoreViewLink: {
    color: EDGE_CYAN,
    fontSize: '12px',
    fontWeight: 600,
    textDecoration: 'none',
  },

  // ── Hero Story ──────────────────────────────────────────────────────
  heroSection: {
    padding: '0',
    backgroundColor: CARD_BG,
  },
  heroImage: {
    width: '100%',
    maxWidth: '600px',
    height: 'auto',
    display: 'block',
  },
  heroContent: {
    padding: '24px 32px 32px',
  },
  hotBadgeRow: {
    margin: '0 0 16px',
    lineHeight: '28px',
  },
  hotBadge: {
    display: 'inline',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1.5px',
    padding: '5px 14px',
    borderRadius: '100px',
  },
  heroTeamPillInline: {
    display: 'inline',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    padding: '5px 14px',
    borderRadius: '100px',
  },
  hotViews: {
    display: 'inline',
    color: TEXT_MUTED,
    fontSize: '12px',
    fontWeight: 500,
  },
  heroTeamPill: {
    display: 'inline-block',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    padding: '5px 14px',
    borderRadius: '100px',
    margin: '0 0 14px',
  },
  heroTitle: {
    color: TEXT_PRIMARY,
    fontSize: '26px',
    fontWeight: 700,
    lineHeight: '1.25',
    margin: '0 0 12px',
    letterSpacing: '-0.3px',
  },
  heroSummary: {
    color: TEXT_SECONDARY,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  heroCta: {
    backgroundColor: EDGE_RED,
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 600,
    padding: '14px 32px',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'inline-block',
    letterSpacing: '0.2px',
  },

  // ── Story Cards ─────────────────────────────────────────────────────
  storiesSection: {
    padding: '8px 32px 24px',
    backgroundColor: CARD_BG,
  },
  sectionLabel: {
    color: TEXT_SECONDARY,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    margin: '0 0 20px',
    paddingTop: '8px',
    borderTop: `2px solid ${DIVIDER}`,
  },
  storyCard: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${DIVIDER}`,
  },
  storyImageCol: {
    width: '120px',
    verticalAlign: 'top',
  },
  storyImage: {
    borderRadius: '10px',
    display: 'block',
    objectFit: 'cover' as const,
  },
  storyTextCol: {
    verticalAlign: 'top',
    paddingLeft: '20px',
  },
  storyTextColFull: {
    verticalAlign: 'top',
  },
  storyTeamLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    margin: '0 0 6px',
  },
  storyTitle: {
    color: TEXT_PRIMARY,
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: '1.35',
    margin: '0 0 6px',
  },
  storySummary: {
    color: TEXT_SECONDARY,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },

  // ── More Stories ────────────────────────────────────────────────────
  moreSection: {
    padding: '8px 32px 24px',
    backgroundColor: BODY_BG,
  },
  moreStoryRow: {
    marginBottom: '12px',
  },
  moreDotCol: {
    width: '16px',
    verticalAlign: 'top',
    paddingTop: '6px',
  },
  moreDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    margin: 0,
    fontSize: '0',
    lineHeight: '0',
  },
  moreTextCol: {
    verticalAlign: 'top',
    paddingLeft: '10px',
  },
  moreLink: {
    color: TEXT_PRIMARY,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '1.4',
    textDecoration: 'none',
    display: 'block',
  },
  moreTeam: {
    color: TEXT_MUTED,
    fontSize: '12px',
    margin: '2px 0 0',
  },

  // ── Scout AI ────────────────────────────────────────────────────────
  scoutSection: {
    padding: '28px 32px',
    backgroundColor: CARD_BG,
    borderTop: `3px solid ${EDGE_CYAN}`,
  },
  scoutIconCol: {
    width: '60px',
    verticalAlign: 'top',
  },
  scoutTextCol: {
    verticalAlign: 'top',
    paddingLeft: '16px',
  },
  scoutTitle: {
    color: TEXT_PRIMARY,
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 4px',
  },
  scoutDesc: {
    color: TEXT_SECONDARY,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  scoutCta: {
    backgroundColor: EDGE_CYAN,
    color: EDGE_BLACK,
    fontSize: '14px',
    fontWeight: 700,
    padding: '12px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '16px',
  },

  // ── App Promo ───────────────────────────────────────────────────────
  appSection: {
    padding: '32px',
    backgroundColor: BODY_BG,
    textAlign: 'center' as const,
  },
  appTitle: {
    color: TEXT_PRIMARY,
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 8px',
  },
  appDesc: {
    color: TEXT_SECONDARY,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 20px',
  },

  // ── YouTube Channels ───────────────────────────────────────────────
  channelsSection: {
    padding: '28px 32px',
    backgroundColor: BODY_BG,
  },
  channelsSectionTitle: {
    color: TEXT_SECONDARY,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    margin: '0 0 20px',
    textTransform: 'uppercase' as const,
  },
  channelCard: {
    backgroundColor: CARD_BG,
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '12px',
    border: `1px solid ${DIVIDER}`,
  },
  channelLogoCol: {
    width: '110px',
    verticalAlign: 'middle',
  },
  channelLogo: {
    display: 'block',
    height: 'auto',
  },
  channelInfoCol: {
    verticalAlign: 'middle',
    paddingLeft: '16px',
  },
  channelName: {
    color: TEXT_PRIMARY,
    fontSize: '15px',
    fontWeight: 700,
    margin: '0 0 2px',
    lineHeight: '1.3',
  },
  channelTagline: {
    color: TEXT_SECONDARY,
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.4',
  },
  channelBtnCol: {
    width: '80px',
    verticalAlign: 'middle',
    textAlign: 'right' as const,
  },
  channelWatchBtn: {
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
  },

  // ── Edge CTA ────────────────────────────────────────────────────────
  edgeCtaSection: {
    padding: '36px 32px',
    backgroundColor: EDGE_BLACK,
    textAlign: 'center' as const,
    borderTop: `1px solid rgba(255,255,255,0.08)`,
  },
  edgeCtaTitle: {
    color: EDGE_WHITE,
    fontSize: '22px',
    fontWeight: 700,
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  },
  edgeCtaDesc: {
    color: TEXT_MUTED,
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 24px',
  },
  edgeCtaBtn: {
    backgroundColor: EDGE_RED,
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 700,
    padding: '14px 36px',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'inline-block',
  },

  // ── Footer ──────────────────────────────────────────────────────────
  footer: {
    backgroundColor: EDGE_BLACK,
    padding: '32px',
    textAlign: 'center' as const,
    borderTop: `1px solid rgba(255,255,255,0.06)`,
  },
  socialLink: {
    color: TEXT_MUTED,
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'none',
  },
  socialDot: {
    color: 'rgba(255,255,255,0.2)',
    display: 'inline',
    margin: '0 10px',
    fontSize: '13px',
  },
  footerDivider: {
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: '1px 0 0 0',
    margin: '20px 0',
  },
  footerLink: {
    color: TEXT_MUTED,
    fontSize: '12px',
    textDecoration: 'underline',
  },
  footerCopyright: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    marginTop: '20px',
    marginBottom: '4px',
  },
  footerLegal: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '11px',
    margin: 0,
    lineHeight: '1.5',
  },
};

export default ChicagoDailyEmail;

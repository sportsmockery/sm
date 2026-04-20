import {
  Html, Head, Preview, Body, Container, Section, Img, Text, Link, Hr,
} from '@react-email/components';
import type { DailyEdgeEmailVariables } from '@/types/daily-email';

export type { DailyEdgeEmailVariables };
export type Story = DailyEdgeEmailVariables['hero_story'];
export type GameResult = DailyEdgeEmailVariables['scoreboard_games'][number];
export type ChicagoDailyEmailProps = DailyEdgeEmailVariables;

// ─── Design tokens ───────────────────────────────────────────────────────────
const BG = '#0B0B0F';
const CARD = '#16161A';
const BORDER = 'rgba(255,255,255,0.07)';
const W = '#FFFFFF';
const W90 = '#FFFFFFE6';
const W60 = '#FFFFFF99';
const W40 = '#FFFFFF66';
const W20 = '#FFFFFF33';
const W10 = '#FFFFFF1A';
const CYAN = '#00D4FF';
const RED = '#FF3B30';
const GREEN = '#30D158';
const GOLD = '#D6B05E';
const BASE = 'https://test.sportsmockery.com';
const F = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";

// Network logos: use white versions for Untold & P&I on dark bg,
// No Strokes gets a mini card bg since it has white in the logo
const NET = [
  { name: 'Untold Chicago Stories', desc: 'Raw Chicago documentary series', logo: `${BASE}/downloads/untold-logo-white.png`, url: 'https://www.youtube.com/@untoldchicago', accent: '#BC0000' },
  { name: 'Pinwheels & Ivy', desc: 'Your daily Cubs podcast', logo: `${BASE}/downloads/pinwheels-ivy-logo-white.png`, url: 'https://www.youtube.com/c/PinwheelsandIvyPodcast', accent: '#2D8B2D' },
  { name: 'No Strokes Golf', desc: 'Golf without the handicap', logo: `${BASE}/downloads/nostrokes-logo.png`, url: 'https://www.youtube.com/@nostrokes', accent: '#1B5E3B', needsBg: true },
];

// ─── Responsive CSS ──────────────────────────────────────────────────────────
const CSS = `
@media only screen and (max-width:600px){
  .outer{width:100%!important;}
  .px{padding-left:16px!important;padding-right:16px!important;}
  .h1{font-size:22px!important;line-height:1.22!important;}
  .lede{font-size:14px!important;}
  .stack td{display:block!important;width:100%!important;padding:0!important;}
  .stack .si{padding-bottom:12px!important;}
  .stack .si img{width:100%!important;height:auto!important;max-height:180px!important;object-fit:cover!important;}
  .cta-full{width:100%!important;text-align:center!important;}
  .cta-full a{display:block!important;width:100%!important;text-align:center!important;}
  .score-n{font-size:20px!important;}
  .net-logo{width:40px!important;}
  .net-logo img{width:40px!important;}
  .badges td{display:inline-block!important;}
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ok(url?: string) { return !!url && url.startsWith('http') && !url.includes('placeholder'); }

// =============================================================================
// Component
// =============================================================================

export function ChicagoDailyEmail(v: DailyEdgeEmailVariables) {
  const hero = v.hero_story;
  const stories = v.more_stories;
  const games = v.scoreboard_games;

  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <Preview>{v.intro_blurb}</Preview>

      <Body style={{ margin: 0, padding: 0, backgroundColor: '#000', fontFamily: F, WebkitTextSizeAdjust: '100%' as any }}>
        <Container style={{ maxWidth: '620px', margin: '0 auto', backgroundColor: BG }} className="outer">

          {/* ═══════ HEADER ═══════ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '14px 36px 10px' }} className="px">
            <tr>
              <td style={{ verticalAlign: 'middle' }}>
                <Link href={v.all_stories_url}>
                  <Img src={`${BASE}/edge-logo-blue.png`} alt="Edge" width={84} style={{ display: 'block' }} />
                </Link>
                <div style={{ fontSize: '11px', color: W40, fontFamily: F, marginTop: '3px', letterSpacing: '0.2px' }}>
                  Your Chicago sports briefing · 6am edition
                </div>
              </td>
              <td align="right" style={{ verticalAlign: 'top' }}>
                <span style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: '999px',
                  backgroundColor: BG, border: `1px solid ${W20}`,
                  fontSize: '11px', color: W60, fontFamily: F, whiteSpace: 'nowrap' as const,
                }}>
                  {v.date_label}
                </span>
                <div style={{ marginTop: '4px' }}>
                  <Link href={v.view_in_browser_url} style={{ fontSize: '10px', color: W20, textDecoration: 'underline', fontFamily: F }}>
                    View in browser
                  </Link>
                </div>
              </td>
            </tr>
          </table>
          <div style={{ height: '1px', background: `linear-gradient(90deg,${CYAN},${CYAN}33)` }} />

          {/* ═══════ INTRO ═══════ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '18px 36px 14px' }} className="px">
            <tr><td>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: W60, fontFamily: F, maxWidth: '520px' }}>
                {v.intro_blurb}
              </div>
            </td></tr>
          </table>

          {/* ═══════ SCOREBOARD ═══════ */}
          {games.length > 0 && (
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '0 36px 20px' }} className="px">
              <tr><td>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: W40, marginBottom: '8px', fontFamily: F, fontWeight: 700 }}>
                  Scores
                </div>
                <table width="100%" cellPadding={0} cellSpacing={0} style={{
                  backgroundColor: CARD, borderRadius: '10px', border: `1px solid ${BORDER}`, overflow: 'hidden',
                }}>
                  {games.map((g, i) => (
                    <tr key={i}><td style={{ padding: 0 }}>
                      <Link href={g.url} style={{ textDecoration: 'none', display: 'block' }}>
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{
                          padding: '12px 16px',
                          ...(i < games.length - 1 ? { borderBottom: `1px solid ${BORDER}` } : {}),
                        }}>
                          {/* Home */}
                          <tr>
                            <td style={{ verticalAlign: 'middle', paddingBottom: '2px' }}>
                              <span style={{ color: g.winner === 'home' ? W : W40, fontSize: '14px', fontWeight: g.winner === 'home' ? 700 : 400, fontFamily: F }}>{g.team_home}</span>
                            </td>
                            <td align="right" style={{ verticalAlign: 'middle', paddingBottom: '2px' }}>
                              <span className="score-n" style={{ color: g.winner === 'home' ? W : W40, fontSize: '22px', fontWeight: 700, fontFamily: F }}>{g.score_home}</span>
                            </td>
                          </tr>
                          {/* Away */}
                          <tr>
                            <td style={{ verticalAlign: 'middle' }}>
                              <span style={{ color: g.winner === 'away' ? W : W40, fontSize: '14px', fontWeight: g.winner === 'away' ? 700 : 400, fontFamily: F }}>{g.team_away}</span>
                            </td>
                            <td align="right" style={{ verticalAlign: 'middle' }}>
                              <span className="score-n" style={{ color: g.winner === 'away' ? W : W40, fontSize: '22px', fontWeight: 700, fontFamily: F }}>{g.score_away}</span>
                            </td>
                          </tr>
                        </table>
                      </Link>
                    </td></tr>
                  ))}
                </table>
                <div style={{ fontSize: '11px', color: W20, fontFamily: F, marginTop: '6px' }}>Yesterday's final scores</div>
              </td></tr>
            </table>
          )}

          {/* ═══════ HERO / TOP STORY ═══════ */}
          {hero && (
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '0 36px 28px' }} className="px">
              <tr><td>
                {/* Label row */}
                <table cellPadding={0} cellSpacing={0} style={{ marginBottom: '8px' }}><tr>
                  <td>
                    <span style={{ display: 'inline-block', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: RED, fontWeight: 700, fontFamily: F }}>
                      Top Story
                    </span>
                  </td>
                  <td style={{ paddingLeft: '12px' }}>
                    <span style={{ fontSize: '11px', color: W40, fontFamily: F }}>{hero.tagline} · {hero.minutes_read} min read</span>
                  </td>
                </tr></table>

                {/* Image */}
                {ok(hero.image_url) && (
                  <Link href={hero.url} style={{ display: 'block', marginBottom: '14px' }}>
                    <Img src={hero.image_url} alt="" width={548} style={{ width: '100%', display: 'block', borderRadius: '8px', maxHeight: '260px', objectFit: 'cover' as const }} />
                  </Link>
                )}

                {/* Headline */}
                <Link href={hero.url} style={{ textDecoration: 'none' }}>
                  <h1 className="h1" style={{ fontSize: '24px', lineHeight: '1.2', margin: '0 0 8px', color: W, fontWeight: 700, fontFamily: F, letterSpacing: '-0.3px' }}>
                    {hero.title}
                  </h1>
                </Link>

                {/* Summary */}
                <p className="lede" style={{ fontSize: '14px', lineHeight: '1.55', color: W60, margin: '0 0 10px', fontFamily: F }}>
                  {hero.summary}
                </p>

                {/* Meta */}
                {hero.views > 0 && (
                  <p style={{ fontSize: '11px', color: W20, margin: '0 0 16px', fontFamily: F }}>
                    {hero.views > 1000 ? `${(hero.views/1000).toFixed(1)}K` : hero.views} reads · {hero.relative_time}
                  </p>
                )}

                {/* CTA */}
                <table cellPadding={0} cellSpacing={0} className="cta-full"><tr>
                  <td style={{ backgroundColor: RED, borderRadius: '999px', padding: '11px 24px' }}>
                    <Link href={hero.url} style={{ color: W, fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: F }}>
                      Break down the story →
                    </Link>
                  </td>
                </tr></table>
              </td></tr>
            </table>
          )}

          <div style={{ height: '1px', backgroundColor: BORDER, margin: '0 36px' }} />

          {/* ═══════ MORE STORIES ═══════ */}
          {stories.length > 0 && (
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '24px 36px 8px' }} className="px">
              <tr><td>
                <h2 style={{ fontSize: '16px', margin: '0 0 2px', color: W, fontWeight: 700, fontFamily: F }}>More from last night</h2>
                <p style={{ fontSize: '12px', color: W40, margin: '0 0 16px', fontFamily: F }}>
                  {v.stories_count} new stories from the {v.stories_window_label}
                </p>
              </td></tr>

              {stories.map((s, i) => (
                <tr key={i}><td style={{ padding: '12px 0', borderTop: `1px solid ${BORDER}` }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} className="stack"><tr>
                    {ok(s.image_url) && (
                      <td width="30%" valign="top" style={{ paddingRight: '14px' }} className="si">
                        <Link href={s.url}>
                          <Img src={s.image_url} alt="" width="100%" style={{ display: 'block', borderRadius: '6px', maxHeight: '80px', objectFit: 'cover' as const }} />
                        </Link>
                      </td>
                    )}
                    <td valign="top">
                      <div style={{ fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: W40, marginBottom: '4px', fontFamily: F }}>
                        {s.tagline}
                      </div>
                      <Link href={s.url} style={{ textDecoration: 'none', color: W }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.3', marginBottom: '4px', fontFamily: F }}>{s.title}</div>
                      </Link>
                      <div style={{ fontSize: '13px', lineHeight: '1.5', color: W60, marginBottom: '4px', fontFamily: F }}>{s.summary}</div>
                      <div style={{ fontSize: '11px', color: W20, fontFamily: F }}>{s.minutes_read} min read · {s.relative_time}</div>
                    </td>
                  </tr></table>
                </td></tr>
              ))}

              {/* Browse all */}
              <tr><td style={{ paddingTop: '16px', paddingBottom: '8px' }}>
                <table cellPadding={0} cellSpacing={0}><tr>
                  <td style={{ padding: '8px 14px', borderRadius: '999px', border: `1px solid ${W20}` }}>
                    <Link href={v.all_stories_url} style={{ color: W60, fontSize: '12px', textDecoration: 'none', fontFamily: F, fontWeight: 500 }}>
                      Browse all stories
                    </Link>
                  </td>
                </tr></table>
              </td></tr>
            </table>
          )}

          <div style={{ height: '1px', backgroundColor: BORDER, margin: '0 36px' }} />

          {/* ═══════ SCOUT AI ═══════ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '24px 36px' }} className="px">
            <tr><td>
              <table width="100%" cellPadding={0} cellSpacing={0} style={{
                backgroundColor: CARD, borderRadius: '10px', border: `1px solid ${BORDER}`, padding: '18px 20px',
              }}>
                <tr>
                  <td width="50" valign="top">
                    <Img src={`${BASE}/downloads/scout-v2.png`} alt="Scout" width={40} height={40} style={{ borderRadius: '10px', display: 'block' }} />
                  </td>
                  <td valign="top" style={{ paddingLeft: '14px' }}>
                    <div style={{ color: W, fontSize: '15px', fontWeight: 700, fontFamily: F, marginBottom: '3px' }}>{v.scout_title}</div>
                    <div style={{ color: W60, fontSize: '13px', fontFamily: F, lineHeight: '1.45', marginBottom: '8px' }}>{v.scout_description}</div>
                    {v.scout_examples.map((q, i) => (
                      <div key={i} style={{ fontSize: '13px', color: W60, fontFamily: F, lineHeight: '1.5', marginBottom: '1px' }}>
                        <span style={{ color: CYAN, marginRight: '6px' }}>›</span>{q}
                      </div>
                    ))}
                    <div style={{ marginTop: '12px' }}>
                      <table cellPadding={0} cellSpacing={0}><tr>
                        <td style={{ backgroundColor: '#1C1C26', borderRadius: '999px', padding: '8px 14px' }}>
                          <Link href={v.scout_url} style={{ color: W, fontSize: '12px', fontWeight: 600, textDecoration: 'none', fontFamily: F }}>
                            Try Scout now →
                          </Link>
                        </td>
                      </tr></table>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <div style={{ height: '1px', backgroundColor: BORDER, margin: '0 36px' }} />

          {/* ═══════ NETWORK ═══════ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '24px 36px 20px' }} className="px">
            <tr><td>
              <h2 style={{ fontSize: '15px', margin: '0 0 3px', color: W, fontWeight: 700, fontFamily: F }}>Also from the Edge network</h2>
              <p style={{ fontSize: '12px', color: W40, margin: '0 0 14px', fontFamily: F }}>Podcasts, newsletters, and communities for Chicago fans.</p>

              {NET.map((ch, i) => (
                <Link key={i} href={ch.url} style={{ textDecoration: 'none', display: 'block', marginBottom: i < NET.length - 1 ? '6px' : '0' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} style={{
                    backgroundColor: CARD, borderRadius: '8px', border: `1px solid ${BORDER}`, padding: '12px 14px',
                  }}>
                    <tr>
                      <td width="48" valign="middle" className="net-logo">
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '8px',
                          backgroundColor: ch.needsBg ? '#FFFFFF' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          <Img src={ch.logo} alt={ch.name} width={ch.needsBg ? 36 : 40}
                            style={{ display: 'block', height: 'auto', borderRadius: ch.needsBg ? '4px' : '0' }}
                          />
                        </div>
                      </td>
                      <td valign="middle" style={{ paddingLeft: '12px' }}>
                        <div style={{ color: W90, fontSize: '13px', fontWeight: 600, fontFamily: F, lineHeight: '1.3' }}>{ch.name}</div>
                        <div style={{ color: W40, fontSize: '11px', fontFamily: F, marginTop: '1px' }}>{ch.desc}</div>
                      </td>
                      <td width="36" align="right" valign="middle">
                        <span style={{ color: W40, fontSize: '14px' }}>›</span>
                      </td>
                    </tr>
                  </table>
                </Link>
              ))}
            </td></tr>
          </table>

          <div style={{ height: '1px', backgroundColor: BORDER, margin: '0 36px' }} />

          {/* ═══════ APP ═══════ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '24px 36px' }} className="px">
            <tr><td>
              <h2 style={{ fontSize: '15px', margin: '0 0 3px', color: W, fontWeight: 700, fontFamily: F }}>Get the Edge App</h2>
              <p style={{ fontSize: '13px', color: W60, margin: '0 0 8px', lineHeight: '1.45', fontFamily: F }}>
                Real-time scores, alerts, and live win-probability on your phone.
              </p>
              <div style={{ marginBottom: '14px' }}>
                {v.app_bullets.map((b, i) => (
                  <div key={i} style={{ fontSize: '13px', color: W60, fontFamily: F, lineHeight: '1.5' }}>
                    <span style={{ color: GREEN, marginRight: '6px' }}>·</span>{b}
                  </div>
                ))}
              </div>
              <table cellPadding={0} cellSpacing={0} className="badges"><tr>
                <td style={{ paddingRight: '6px' }}>
                  <Link href={v.ios_url}><Img src={`${BASE}/app-store-badge.svg`} alt="App Store" width={120} height={44} style={{ display: 'block' }} /></Link>
                </td>
                <td style={{ paddingLeft: '6px' }}>
                  <Link href={v.android_url}><Img src={`${BASE}/google-play-badge.svg`} alt="Google Play" width={135} height={44} style={{ display: 'block' }} /></Link>
                </td>
              </tr></table>
            </td></tr>
          </table>

          {/* ═══════ FOOTER ═══════ */}
          <div style={{ height: '1px', backgroundColor: BORDER, margin: '0 36px' }} />
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '28px 36px', textAlign: 'center' as const }} className="px">
            <tr><td align="center">
              <div style={{ marginBottom: '16px', lineHeight: '24px' }}>
                {[
                  { l: '𝕏', h: 'https://twitter.com/sportsmockery' },
                  { l: 'YouTube', h: 'https://youtube.com/@sportsmockery' },
                  { l: 'Instagram', h: 'https://instagram.com/sportsmockery' },
                  { l: 'Facebook', h: 'https://facebook.com/sportsmockery' },
                  { l: 'TikTok', h: 'https://tiktok.com/@sportsmockery' },
                ].map((s, i) => (
                  <span key={s.l}>
                    {i > 0 && <span style={{ color: W10, margin: '0 8px', fontSize: '11px' }}>·</span>}
                    <Link href={s.h} style={{ color: W40, fontSize: '11px', textDecoration: 'none', fontFamily: F }}>{s.l}</Link>
                  </span>
                ))}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <Link href={v.preferences_url} style={{ color: W20, fontSize: '11px', textDecoration: 'underline', fontFamily: F }}>Manage preferences</Link>
                <span style={{ color: W10, margin: '0 8px', fontSize: '11px' }}>·</span>
                <Link href={v.unsubscribe_url} style={{ color: W20, fontSize: '11px', textDecoration: 'underline', fontFamily: F }}>Unsubscribe</Link>
              </div>
              <div style={{ color: W10, fontSize: '10px', fontFamily: F, lineHeight: '1.5' }}>
                © {new Date().getFullYear()} Edge by SportsMockery · Chicago, IL<br />
                You received this because you subscribed to Chicago Sports Daily.
              </div>
            </td></tr>
          </table>

        </Container>
      </Body>
    </Html>
  );
}

export default ChicagoDailyEmail;

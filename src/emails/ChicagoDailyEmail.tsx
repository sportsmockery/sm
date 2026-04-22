import {
  Html, Head, Preview, Body, Container, Img, Link,
} from '@react-email/components';
import type { DailyEdgeEmailVariables } from '@/types/daily-email';

export type { DailyEdgeEmailVariables };
export type Story = DailyEdgeEmailVariables['hero_story'];
export type GameResult = DailyEdgeEmailVariables['scoreboard_games'][number];
export type ChicagoDailyEmailProps = DailyEdgeEmailVariables;

/* ═══════ TOKENS ═══════ */
const BG   = '#0B0B0F';
const CARD = '#16161A';
const BD   = 'rgba(255,255,255,0.07)';
const W    = '#FFFFFF';
const W90  = 'rgba(255,255,255,0.9)';
const W70  = 'rgba(255,255,255,0.7)';
const W50  = 'rgba(255,255,255,0.5)';
const W30  = 'rgba(255,255,255,0.3)';
const W15  = 'rgba(255,255,255,0.15)';
const W08  = 'rgba(255,255,255,0.08)';
const CYAN = '#00D4FF';
const RED  = '#FF3B30';
const GRN  = '#30D158';
const B    = 'https://test.sportsmockery.com';
const F    = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";

const NET = [
  { n: 'Untold Chicago Stories', d: 'Raw documentaries from across the city', l: `${B}/downloads/untold-logo-white.png`, u: 'https://www.youtube.com/@untoldchicago', w: 64, bg: false },
  { n: 'Pinwheels & Ivy', d: 'Your daily Cubs podcast', l: `${B}/downloads/pinwheels-ivy-logo-white.png`, u: 'https://www.youtube.com/c/PinwheelsandIvyPodcast', w: 80, bg: false },
  { n: 'No Strokes Golf', d: 'Golf without the handicap', l: `${B}/downloads/nostrokes-logo.png`, u: 'https://www.youtube.com/@nostrokes', w: 80, bg: false },
];

/* ═══════ RESPONSIVE ═══════ */
const CSS = `
@media only screen and (max-width:600px){
.outer{width:100%!important;}
.px{padding-left:16px!important;padding-right:16px!important;}
.h1{font-size:21px!important;line-height:1.22!important;}
.lede{font-size:14px!important;}
.stack td{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important;}
.stack .si{padding-bottom:10px!important;}
.stack .si img{width:100%!important;height:auto!important;max-height:180px!important;}
.mob-full{width:100%!important;}
.mob-full td{width:100%!important;display:block!important;text-align:center!important;}
.mob-full td a{display:block!important;width:100%!important;text-align:center!important;padding:13px 0!important;}
.sn{font-size:20px!important;}
.nl{width:56px!important;}
.nl img{width:48px!important;}
.bb td{display:inline-block!important;}
}`;

/* ═══════ HELPERS ═══════ */
const ok = (u?: string) => !!u && u.startsWith('http') && !u.includes('placeholder');
const kf = (n: number) => n >= 10000 ? (n/1000).toFixed(0)+'K' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);

/* ═══════ SHARED INLINE SNIPPETS ═══════ */
const label10 = { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 700, fontFamily: F } as const;
const meta11 = { fontSize: '11px', color: W30, fontFamily: F } as const;
const body13 = { fontSize: '13px', lineHeight: '1.45', color: W70, fontFamily: F } as const;
const heading16 = { fontSize: '16px', fontWeight: 700, color: W, fontFamily: F } as const;

// ═══════════════════════════════════════════════════════════════════════════════
export function ChicagoDailyEmail(v: DailyEdgeEmailVariables) {
  const hero = v.hero_story;
  const stories = v.more_stories;
  const games = v.scoreboard_games;

  /* Sport-specific CTA copy */
  const ctaCopy = (() => {
    const t = hero.title.toLowerCase();
    if (t.includes('trade')) return `Break down the ${hero.category} trade →`;
    if (t.includes('draft')) return `See the full ${hero.category} draft breakdown →`;
    if (t.includes('sign') || t.includes('deal')) return `Get the ${hero.category} deal details →`;
    return `See the full ${hero.category} breakdown →`;
  })();

  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <Preview>{v.intro_blurb}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: '#000', fontFamily: F }}>
        <Container style={{ maxWidth: '620px', margin: '0 auto', backgroundColor: BG }} className="outer">

{/* ─── 1. HEADER ─────────────────────────────────────────────────────────── */}
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '10px 36px 6px' }} className="px">
  <tr>
    <td style={{ verticalAlign: 'middle' }}>
      <Link href={v.all_stories_url}>
        <Img src={`${B}/edge-logo-blue.png`} alt="Edge" width={78} style={{ display: 'block' }} />
      </Link>
      <span style={{ display: 'block', fontSize: '10px', color: W30, fontFamily: F, marginTop: '2px' }}>
        Your Chicago sports briefing · 6am edition
      </span>
    </td>
    <td align="right" style={{ verticalAlign: 'top' }}>
      <span style={{
        display: 'inline-block', padding: '3px 9px', borderRadius: '999px',
        border: `1px solid ${W15}`, fontSize: '10px', color: W50, fontFamily: F,
        whiteSpace: 'nowrap' as const,
      }}>
        {v.date_label}
      </span>
      <span style={{ display: 'block', marginTop: '3px' }}>
        <Link href={v.view_in_browser_url} style={{ fontSize: '9px', color: W08, textDecoration: 'underline', fontFamily: F }}>
          View in browser
        </Link>
      </span>
    </td>
  </tr>
</table>
<div style={{ height: '1px', background: `linear-gradient(90deg,${CYAN},${CYAN}33)` }} />

{/* ─── INTRO ─────────────────────────────────────────────────────────────── */}
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '14px 36px 12px' }} className="px">
  <tr><td>
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{
      backgroundColor: CARD, borderRadius: '8px', border: `1px solid ${BD}`, padding: '12px 16px',
    }}>
      <tr>
        <td width="3" style={{ backgroundColor: CYAN, borderRadius: '2px' }}></td>
        <td style={{ paddingLeft: '12px' }}>
          <div style={{ ...label10, color: CYAN, marginBottom: '4px' }}>Today's Briefing</div>
          <div style={{ fontSize: '14px', lineHeight: '1.45', color: W90, fontFamily: F }}>{v.intro_blurb}</div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>

{/* ─── 2. SCOREBOARD ─────────────────────────────────────────────────────── */}
{games.length > 0 && (
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '0 36px 14px' }} className="px">
  <tr><td>
    <div style={{ ...label10, color: W30, marginBottom: '5px' }}>Scores</div>
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{
      backgroundColor: CARD, borderRadius: '10px', border: `1px solid ${BD}`,
    }}>
      {games.map((g, i) => (
        <tr key={i}><td style={{
          padding: 0,
          ...(i < games.length - 1 ? { borderBottom: `1px solid ${BD}` } : {}),
        }}>
          <Link href={g.url} style={{ textDecoration: 'none', display: 'block', padding: '8px 14px' }}>
            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
              <tr>
                <td style={{ color: g.winner === 'home' ? W : W50, fontSize: '13px', fontWeight: g.winner === 'home' ? 700 : 400, fontFamily: F, paddingBottom: '1px', lineHeight: '1.3' }}>
                  {g.team_home}
                </td>
                <td align="right" style={{ paddingBottom: '1px' }}>
                  <span className="sn" style={{ color: g.winner === 'home' ? W : W50, fontSize: '20px', fontWeight: 700, fontFamily: F }}>{g.score_home}</span>
                </td>
              </tr>
              <tr>
                <td style={{ color: g.winner === 'away' ? W : W50, fontSize: '13px', fontWeight: g.winner === 'away' ? 700 : 400, fontFamily: F, lineHeight: '1.3' }}>
                  {g.team_away}
                </td>
                <td align="right">
                  <span className="sn" style={{ color: g.winner === 'away' ? W : W50, fontSize: '20px', fontWeight: 700, fontFamily: F }}>{g.score_away}</span>
                </td>
              </tr>
            </table>
          </Link>
        </td></tr>
      ))}
    </table>
    <div style={{ ...meta11, color: W30, marginTop: '4px' }}>Yesterday's final scores</div>
  </td></tr>
</table>
)}

{/* ─── 3. HERO ───────────────────────────────────────────────────────────── */}
{hero && (
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '2px 36px 28px' }} className="px">
  <tr><td>
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{
      backgroundColor: CARD, borderRadius: '10px', border: `1px solid ${CYAN}44`, padding: '16px',
      boxShadow: `0 0 24px ${CYAN}18, 0 0 48px ${CYAN}0A`,
    }}>
      <tr><td>

    {/* Label row */}
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '6px' }}>
      <tr>
        <td><span style={{ ...label10, color: RED }}>Top Story</span></td>
        <td align="right"><span style={{ ...meta11, color: W15 }}>{hero.tagline}</span></td>
      </tr>
    </table>

    {/* Image */}
    {ok(hero.image_url) && (
      <Link href={hero.url} style={{ display: 'block', marginBottom: '12px' }}>
        <Img src={hero.image_url} alt="" width={516}
          style={{ width: '100%', display: 'block', borderRadius: '8px', maxHeight: '230px', objectFit: 'cover' as const }} />
      </Link>
    )}

    {/* Headline */}
    <Link href={hero.url} style={{ textDecoration: 'none' }}>
      <div className="h1" style={{ fontSize: '23px', lineHeight: '1.2', margin: '0 0 8px', color: W, fontWeight: 700, fontFamily: F, letterSpacing: '-0.3px' }}>
        {hero.title}
      </div>
    </Link>

    {/* Deck */}
    <div className="lede" style={{ fontSize: '14px', lineHeight: '1.5', color: W70, margin: '0 0 6px', fontFamily: F }}>
      {hero.summary}
    </div>

    {/* Meta */}
    <div style={{ ...meta11, margin: '0 0 14px' }}>
      {hero.minutes_read} min read{hero.views > 0 ? ` · ${kf(hero.views)} reads` : ''} · {hero.relative_time}
    </div>

    {/* CTA */}
    <table role="presentation" cellPadding={0} cellSpacing={0} className="mob-full"><tr>
      <td style={{ backgroundColor: '#BC0000', borderRadius: '999px', padding: '11px 24px', lineHeight: '1' }}>
        <Link href={hero.url} style={{ color: W, fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: F, whiteSpace: 'nowrap' as const }}>
          {ctaCopy}
        </Link>
      </td>
    </tr></table>

      </td></tr>
    </table>
  </td></tr>
</table>
)}

{/* ─── 4. MORE FROM LAST NIGHT ───────────────────────────────────────────── */}
{stories.length > 0 && (
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '20px 36px 6px' }} className="px">


  {stories.map((s, i) => (
    <tr key={i}><td style={{ padding: '11px 0', borderTop: `1px solid ${BD}` }}>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} className="stack">
        <tr>
          {ok(s.image_url) && (
            <td width="28%" valign="middle" style={{ paddingRight: '12px' }} className="si">
              <Link href={s.url}>
                <Img src={s.image_url} alt="" width="100%"
                  style={{ display: 'block', borderRadius: '6px', maxHeight: '78px', objectFit: 'cover' as const }} />
              </Link>
            </td>
          )}
          <td valign="top">
            <div style={{ ...label10, color: W30, marginBottom: '2px' }}>{s.tagline}</div>
            <Link href={s.url} style={{ textDecoration: 'none', color: W }}>
              <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.28', marginBottom: '3px', fontFamily: F }}>{s.title}</div>
            </Link>
            <div style={{ ...body13, marginBottom: '2px' }}>{s.summary}</div>
            <div style={meta11}>{s.minutes_read} min read · {s.relative_time}</div>
          </td>
        </tr>
      </table>
    </td></tr>
  ))}

  {/* Browse all */}
  <tr><td style={{ paddingTop: '14px', paddingBottom: '4px' }}>
    <table role="presentation" cellPadding={0} cellSpacing={0}><tr>
      <td style={{ backgroundColor: '#BC0000', borderRadius: '999px', padding: '9px 20px', lineHeight: '1' }}>
        <Link href={v.all_stories_url} style={{ color: W, fontSize: '12px', fontWeight: 600, textDecoration: 'none', fontFamily: F, whiteSpace: 'nowrap' as const }}>
          Browse all stories →
        </Link>
      </td>
    </tr></table>
  </td></tr>
</table>
)}

<div style={{ height: '1px', backgroundColor: BD, margin: '0 36px' }} />

{/* ─── 5. SCOUT ──────────────────────────────────────────────────────────── */}
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '20px 36px' }} className="px">
  <tr><td>
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{
      backgroundColor: CARD, borderRadius: '10px', border: `1px solid ${CYAN}44`, padding: '16px 16px',
    }}>
      <tr>
        <td width="56" valign="middle">
          <Img src={`${B}/downloads/scout-v2.png`} alt="" width={48} height={48} style={{ borderRadius: '12px', display: 'block' }} />
        </td>
        <td valign="middle" style={{ paddingLeft: '14px' }}>
          <div style={{ ...heading16, fontSize: '15px', marginBottom: '2px' }}>{v.scout_title}</div>
          <div style={{ ...body13, marginBottom: '10px' }}>{v.scout_description}</div>
          <div>
            <table role="presentation" cellPadding={0} cellSpacing={0}><tr>
              <td style={{ backgroundColor: '#BC0000', borderRadius: '999px', padding: '9px 20px', lineHeight: '1' }}>
                <Link href={v.scout_url} style={{ color: W, fontSize: '12px', fontWeight: 600, textDecoration: 'none', fontFamily: F, whiteSpace: 'nowrap' as const }}>
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

<div style={{ height: '1px', backgroundColor: BD, margin: '0 36px' }} />

{/* ─── 6. NETWORK ────────────────────────────────────────────────────────── */}
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '20px 36px 16px' }} className="px">
  <tr><td>
    <div style={{ ...heading16, fontSize: '15px', marginBottom: '1px' }}>Also from the Edge network</div>
    <div style={{ ...meta11, color: W30, marginBottom: '12px' }}>Podcasts and shows for Chicago fans</div>

    {NET.map((ch, i) => (
      <Link key={i} href={ch.u} style={{ textDecoration: 'none', display: 'block' }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{
          padding: '9px 0',
          ...(i < NET.length - 1 ? { borderBottom: `1px solid ${BD}` } : {}),
        }}>
          <tr>
            <td width="88" valign="middle" className="nl">
              {ch.bg ? (
                <span style={{ display: 'inline-block', backgroundColor: W, borderRadius: '6px', padding: '3px 5px' }}>
                  <Img src={ch.l} alt={ch.n} width={ch.w} style={{ display: 'block', height: 'auto' }} />
                </span>
              ) : (
                <Img src={ch.l} alt={ch.n} width={ch.w} style={{ display: 'block', height: 'auto' }} />
              )}
            </td>
            <td valign="middle" style={{ paddingLeft: '10px' }}>
              <div style={{ color: W90, fontSize: '13px', fontWeight: 600, fontFamily: F, lineHeight: '1.3' }}>{ch.n}</div>
              <div style={{ color: W30, fontSize: '11px', fontFamily: F, marginTop: '1px' }}>{ch.d}</div>
            </td>
            <td width="24" align="right" valign="middle">
              <span style={{ color: W15, fontSize: '16px' }}>›</span>
            </td>
          </tr>
        </table>
      </Link>
    ))}
  </td></tr>
</table>

{/* ─── 6b. RECENT VIDEOS ──────────────────────────────────────────────── */}
{v.channel_videos.length > 0 && (
<>
<div style={{ height: '1px', backgroundColor: BD, margin: '0 36px' }} />
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '20px 36px 16px' }} className="px">
  <tr><td>
    <div style={{ ...heading16, fontSize: '15px', marginBottom: '1px' }}>New from our channels</div>
    <div style={{ ...meta11, color: W30, marginBottom: '12px' }}>Latest videos uploaded yesterday</div>

    {v.channel_videos.map((vid, i) => (
      <Link key={i} href={vid.url} style={{ textDecoration: 'none', display: 'block', marginBottom: i < v.channel_videos.length - 1 ? '10px' : '0' }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} className="stack">
          <tr>
            <td width="35%" valign="top" style={{ paddingRight: '12px' }} className="si">
              {/* YouTube thumbnail with play overlay */}
              <div style={{ position: 'relative' as const }}>
                <Img src={vid.thumbnail_url} alt="" width="100%"
                  style={{ display: 'block', borderRadius: '6px', maxHeight: '80px', objectFit: 'cover' as const }} />
              </div>
            </td>
            <td valign="top">
              <div style={{ ...label10, color: W30, marginBottom: '2px' }}>{vid.channel_name}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '1.3', color: W, fontFamily: F, marginBottom: '2px' }}>
                {vid.title}
              </div>
              <div style={meta11}>{vid.relative_time}</div>
            </td>
          </tr>
        </table>
      </Link>
    ))}
  </td></tr>
</table>
</>
)}

<div style={{ height: '1px', backgroundColor: BD, margin: '0 36px' }} />

{/* ─── 7. APP ────────────────────────────────────────────────────────────── */}
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '20px 36px' }} className="px">
  <tr><td>
    <div style={{ ...heading16, fontSize: '15px', marginBottom: '2px' }}>Get the Edge App</div>
    <div style={{ ...body13, marginBottom: '7px' }}>Real-time scores, alerts, and live win-probability on your phone.</div>
    <div style={{ marginBottom: '12px' }}>
      {v.app_bullets.map((b, i) => (
        <div key={i} style={{ ...body13, lineHeight: '1.5' }}>
          <span style={{ color: GRN, marginRight: '5px' }}>·</span>{b}
        </div>
      ))}
    </div>
    <table role="presentation" cellPadding={0} cellSpacing={0} className="bb"><tr>
      <td style={{ paddingRight: '6px' }}>
        <Link href={v.ios_url}><Img src={`${B}/app-store-badge.svg`} alt="App Store" width={120} height={44} style={{ display: 'block' }} /></Link>
      </td>
      <td style={{ paddingLeft: '6px' }}>
        <Link href={v.android_url}><Img src={`${B}/google-play-badge.svg`} alt="Google Play" width={135} height={44} style={{ display: 'block' }} /></Link>
      </td>
    </tr></table>
  </td></tr>
</table>

{/* ─── 8. FOOTER ─────────────────────────────────────────────────────────── */}
<div style={{ height: '1px', backgroundColor: BD, margin: '0 36px' }} />
<table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ padding: '24px 36px', textAlign: 'center' as const }} className="px">
  <tr><td align="center">
    <div style={{ marginBottom: '16px', lineHeight: '22px' }}>
      {[
        { l: '𝕏', h: 'https://twitter.com/sportsmockery' },
        { l: 'Facebook', h: 'https://facebook.com/sportsmockery' },
        { l: 'TikTok', h: 'https://www.tiktok.com/@sportsmockerychi' },
      ].map((s, i) => (
        <span key={s.l}>
          {i > 0 && <span style={{ color: W30, margin: '0 7px', fontSize: '10px' }}>·</span>}
          <Link href={s.h} style={{ color: W50, fontSize: '11px', fontWeight: 500, textDecoration: 'none', fontFamily: F }}>{s.l}</Link>
        </span>
      ))}
    </div>
    <div style={{ marginBottom: '14px' }}>
      <Link href={v.preferences_url} style={{ color: W50, fontSize: '11px', textDecoration: 'underline', fontFamily: F }}>Manage preferences</Link>
      <span style={{ color: W30, margin: '0 8px', fontSize: '10px' }}>·</span>
      <Link href={v.unsubscribe_url} style={{ color: W50, fontSize: '11px', textDecoration: 'underline', fontFamily: F }}>Unsubscribe</Link>
    </div>
    <div style={{ color: W30, fontSize: '10px', fontFamily: F, lineHeight: '1.5' }}>
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

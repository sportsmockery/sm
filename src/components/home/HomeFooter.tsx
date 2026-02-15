import Link from 'next/link'
import Image from 'next/image'

const TEAMS = [
  { name: 'Chicago Bears', href: '/chicago-bears' },
  { name: 'Chicago Bulls', href: '/chicago-bulls' },
  { name: 'Chicago Cubs', href: '/chicago-cubs' },
  { name: 'Chicago White Sox', href: '/chicago-white-sox' },
  { name: 'Chicago Blackhawks', href: '/chicago-blackhawks' },
]

export default function HomeFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 0 40px', background: '#0c0c12' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 48,
          }}
          className="hm-footer-grid-resp"
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <Link href="/home">
                <Image src="/logos/v2_header_dark.png" alt="Sports Mockery" width={160} height={46} style={{ height: 'auto' }} />
              </Link>
            </div>
            <p style={{ color: '#55556a', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
              The future of Chicago sports. AI-powered, fan-driven, unmatched.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#8a8a9a', marginBottom: 16 }}>Platform</h4>
            <FooterLink href="/scout-ai">Scout AI</FooterLink>
            <FooterLink href="/gm">Trade Simulator</FooterLink>
            <FooterLink href="/mock-draft">Mock Draft</FooterLink>
            <FooterLink href="/datahub">Data Hub</FooterLink>
            <FooterLink href="/fan-chat">Fan Hub</FooterLink>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#8a8a9a', marginBottom: 16 }}>Teams</h4>
            {TEAMS.map((t) => (
              <FooterLink key={t.name} href={t.href}>{t.name}</FooterLink>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#8a8a9a', marginBottom: 16 }}>Company</h4>
            <FooterLink href="/pricing">SM+ Premium</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#55556a', fontSize: 13 }}>&copy; {new Date().getFullYear()} Sports Mockery. All rights reserved.</span>
          <span style={{ color: '#55556a', fontSize: 12 }}>Designed for the future of fandom.</span>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hm-footer-grid-resp { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ display: 'block', color: '#55556a', fontSize: 14, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
    >
      {children}
    </Link>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const platformLinks = [
  { name: 'Scout AI', href: '/scout-ai' },
  { name: 'Trade Simulator', href: '/gm' },
  { name: 'Mock Draft', href: '/mock-draft' },
  { name: 'Data Cosmos', href: '/datahub' },
  { name: 'Fan Hub', href: '/fan-zone' },
]

const teamLinks = [
  { name: 'Chicago Bears', href: '/chicago-bears' },
  { name: 'Chicago Bulls', href: '/chicago-bulls' },
  { name: 'Chicago Cubs', href: '/chicago-cubs' },
  { name: 'Chicago White Sox', href: '/chicago-white-sox' },
  { name: 'Chicago Blackhawks', href: '/chicago-blackhawks' },
]

const companyLinks = [
  { name: 'SM+ Premium', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Governance', href: '/governance' },
]

export default function Footer() {
  const pathname = usePathname()

  // Don't render footer on admin, studio, or standalone landing pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio') || pathname?.startsWith('/home')) {
    return null
  }

  return (
    <footer className="sm-footer">
      <div className="sm-container">
        {/* 4-column grid */}
        <div className="footer-grid">
          {/* Brand column (2fr) */}
          <div className="footer-col">
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
              <span>Sports </span>
              <span style={{ color: '#bc0000' }}>Mockery</span>
            </div>
            <p className="footer-brand-text">
              The future of Chicago sports. AI-powered, fan-driven, unmatched.
            </p>
          </div>

          {/* Platform column (1fr) */}
          <div className="footer-col">
            <h4>Platform</h4>
            {platformLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Teams column (1fr) */}
          <div className="footer-col">
            <h4>Teams</h4>
            {teamLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Company column (1fr) */}
          <div className="footer-col">
            <h4>Company</h4>
            {companyLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>&copy; 2026 Sports Mockery. All rights reserved.</span>
          <span>Chicago&apos;s #1 AI Sports Platform</span>
        </div>
      </div>
    </footer>
  )
}

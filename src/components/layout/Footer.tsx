'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Footer links organized by column per design spec
const footerColumns = [
  {
    title: 'ABOUT',
    description: 'Your source for Chicago sports news, analysis, and commentary. Covering Bears, Bulls, Cubs, White Sox, and Blackhawks with passion.',
    hasSocial: true,
  },
  {
    title: 'CATEGORIES',
    links: [
      { name: 'Chicago Bears', href: '/chicago-bears' },
      { name: 'Chicago Bulls', href: '/chicago-bulls' },
      { name: 'Chicago Cubs', href: '/chicago-cubs' },
      { name: 'Chicago White Sox', href: '/chicago-white-sox' },
      { name: 'Chicago Blackhawks', href: '/chicago-blackhawks' },
      { name: 'Podcasts', href: '/podcasts' },
    ],
  },
  {
    title: 'CONNECT',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Advertise', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/privacy' },
    ],
  },
]

// Social links
const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/sportsmockery', icon: 'facebook' },
  { name: 'Twitter', href: 'https://twitter.com/sportsmockery', icon: 'twitter' },
  { name: 'Instagram', href: 'https://instagram.com/sportsmockery', icon: 'instagram' },
  { name: 'YouTube', href: 'https://youtube.com/sportsmockery', icon: 'youtube' },
]

// Social icons
function SocialIcon({ icon, className = '' }: { icon: string; className?: string }) {
  if (icon === 'facebook') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 320 512">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
      </svg>
    )
  }
  if (icon === 'twitter') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 512 512">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
      </svg>
    )
  }
  if (icon === 'instagram') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 448 512">
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
      </svg>
    )
  }
  if (icon === 'youtube') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 576 512">
        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
      </svg>
    )
  }
  return null
}

export default function Footer() {
  const pathname = usePathname()

  // Don't render footer on admin and studio pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) {
    return null
  }

  return (
    <footer className="mt-auto">
      {/* Footer Top Section - Dark Background per spec */}
      <div className="py-8 md:py-12" style={{ backgroundColor: 'var(--bg-footer)' }}>
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* About Column */}
            <div className="text-center md:text-left">
              <h3
                className="text-[14px] font-bold uppercase mb-4 md:mb-5"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-inverse)' }}
              >
                ABOUT
              </h3>
              <p
                className="text-[13px] md:text-[14px] leading-relaxed mb-4 md:mb-5"
                style={{ color: 'var(--footer-text-muted, #999)' }}
              >
                Your source for Chicago sports news, analysis, and commentary. Covering Bears, Bulls, Cubs, White Sox, and Blackhawks with passion.
              </p>
              {/* Social icons */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:opacity-100"
                    style={{ color: 'var(--footer-text-muted, #999)' }}
                    aria-label={social.name}
                  >
                    <SocialIcon icon={social.icon} className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                ))}
              </div>
            </div>

            {/* Categories and Connect - side by side on mobile */}
            <div className="grid grid-cols-2 gap-6 md:contents">
              {/* Categories Column */}
              <div>
                <h3
                  className="text-[13px] md:text-[14px] font-bold uppercase mb-3 md:mb-5"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-inverse)' }}
                >
                  CATEGORIES
                </h3>
                <ul className="space-y-1.5 md:space-y-2">
                  {footerColumns[1].links?.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[13px] md:text-[14px] transition-colors hover:opacity-100"
                        style={{ color: 'var(--footer-text-muted, #999)' }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect Column */}
              <div>
                <h3
                  className="text-[13px] md:text-[14px] font-bold uppercase mb-3 md:mb-5"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-inverse)' }}
                >
                  CONNECT
                </h3>
                <ul className="space-y-1.5 md:space-y-2">
                  {footerColumns[2].links?.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[13px] md:text-[14px] transition-colors hover:opacity-100"
                        style={{ color: 'var(--footer-text-muted, #999)' }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section - Darker per spec */}
      <div className="py-4 md:py-5" style={{ backgroundColor: 'var(--footer-bottom-bg, #111111)' }}>
        <div className="max-w-[1110px] mx-auto px-4">
          <p
            className="text-[11px] md:text-[12px] text-center"
            style={{ color: 'var(--footer-text-muted, #666)' }}
          >
            &copy; {new Date().getFullYear()} Sports Mockery. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

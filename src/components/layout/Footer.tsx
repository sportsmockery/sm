'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

// Social icon component
function SocialIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    facebook: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    youtube: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  }
  return icons[icon] || null
}

// Footer link sections
const footerSections = [
  {
    title: 'Teams',
    links: [
      { name: 'Bears', href: '/bears' },
      { name: 'Bulls', href: '/bulls' },
      { name: 'Blackhawks', href: '/blackhawks' },
      { name: 'White Sox', href: '/white-sox' },
      { name: 'Cubs', href: '/cubs' },
    ],
  },
  {
    title: 'Podcasts',
    links: [
      { name: 'Bears Film Room', href: '/podcasts/bears-film-room' },
      { name: 'Pinwheels and Ivy', href: '/podcasts/pinwheels-and-ivy' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Advertise', href: '/advertise' },
      { name: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
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

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0b] border-t border-gray-200 dark:border-[#27272a]">
      {/* Main footer content */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo and social */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-black tracking-tight">
                <span className="text-[#bc0000]">SPORTS</span>
                <span className="text-gray-900 dark:text-white">MOCKERY</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
              Chicago&apos;s premier source for sports news, rumors, and analysis covering the Bears, Bulls, Blackhawks, Cubs, and White Sox.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-[#bc0000] transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#bc0000] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-[#27272a]">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Sports Mockery. All rights reserved.
            </p>
            <p>
              Chicago Sports News and Rumors
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

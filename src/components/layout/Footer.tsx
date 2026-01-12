'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

// Social icon component
function SocialIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    facebook: (
      <svg className={className} fill="currentColor" viewBox="0 0 320 512">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
      </svg>
    ),
    instagram: (
      <svg className={className} fill="currentColor" viewBox="0 0 448 512">
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S Salt 339 288.7 288.7 224.1 314.8 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 512 512">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
      </svg>
    ),
    youtube: (
      <svg className={className} fill="currentColor" viewBox="0 0 576 512">
        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
      </svg>
    ),
  }
  return icons[icon] || null
}

// Social links
const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/sportsmockery', icon: 'facebook' },
  { name: 'Instagram', href: 'https://instagram.com/sportsmockery', icon: 'instagram' },
  { name: 'Twitter', href: 'https://twitter.com/sportsmockery', icon: 'twitter' },
  { name: 'YouTube', href: 'https://youtube.com/sportsmockery', icon: 'youtube' },
]

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a]">
      {/* Main footer - centered social icons */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1110px] mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Social icons */}
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              &copy; Sports Mockery, Inc. {new Date().getFullYear()} | All rights reserved
            </p>
          </div>
        </div>
      </div>

      {/* Sub-footer with brand color */}
      <div className="bg-[#bc0000]">
        <div className="max-w-[1110px] mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-black transition-colors"
                aria-label={social.name}
              >
                <SocialIcon icon={social.icon} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('sm-cookies-accepted')
    if (!hasAccepted) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('sm-cookies-accepted', 'true')
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem('sm-cookies-accepted', 'false')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1c1c1f] border-t border-gray-200 dark:border-[#27272a] shadow-lg">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-300 text-center md:text-left">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
            <a href="/privacy" className="text-[#bc0000] hover:underline">
              Learn more
            </a>
          </p>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <button
              onClick={declineCookies}
              className="min-w-[100px] min-h-[44px] px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="min-w-[100px] min-h-[44px] px-4 py-2.5 text-sm font-medium bg-[#bc0000] hover:bg-[#a00000] text-white rounded-lg transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

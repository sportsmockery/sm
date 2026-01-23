'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NewPostButton() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      href="/admin/posts/new"
      className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium"
      style={{
        backgroundColor: isDark ? '#ffffff' : '#bc0000',
        color: isDark ? '#bc0000' : '#ffffff',
        border: 'none',
        outline: 'none',
      }}
    >
      New Post
    </Link>
  )
}

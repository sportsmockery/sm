'use client'

import { useEffect, useCallback } from 'react'

type KeyCombo = {
  key: string
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
}

export function useKeyboardShortcut(
  combo: KeyCombo | string,
  callback: () => void,
  deps: unknown[] = []
) {
  const memoizedCallback = useCallback(callback, [callback, ...deps])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Parse combo if it's a string (e.g., "cmd+k" or "ctrl+shift+p")
      let keyCombo: KeyCombo
      if (typeof combo === 'string') {
        const parts = combo.toLowerCase().split('+')
        const key = parts.pop() || ''
        keyCombo = {
          key,
          ctrl: parts.includes('ctrl'),
          meta: parts.includes('cmd') || parts.includes('meta'),
          alt: parts.includes('alt') || parts.includes('option'),
          shift: parts.includes('shift'),
        }
      } else {
        keyCombo = combo
      }

      // Check if the pressed key matches
      const keyMatches = event.key.toLowerCase() === keyCombo.key.toLowerCase()
      const ctrlMatches = keyCombo.ctrl ? event.ctrlKey : !event.ctrlKey
      const metaMatches = keyCombo.meta ? event.metaKey : !event.metaKey
      const altMatches = keyCombo.alt ? event.altKey : !event.altKey
      const shiftMatches = keyCombo.shift ? event.shiftKey : !event.shiftKey

      // Handle cmd/ctrl interchangeably on Mac/Windows
      const metaOrCtrl = keyCombo.meta || keyCombo.ctrl
      const metaOrCtrlPressed = event.metaKey || event.ctrlKey

      if (keyMatches) {
        if (metaOrCtrl) {
          // If either meta or ctrl was specified, check if either is pressed
          if (metaOrCtrlPressed && altMatches && shiftMatches) {
            event.preventDefault()
            memoizedCallback()
          }
        } else if (ctrlMatches && metaMatches && altMatches && shiftMatches) {
          event.preventDefault()
          memoizedCallback()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [combo, memoizedCallback])
}

// Convenience hook for common shortcuts
export function useEscapeKey(callback: () => void, deps: unknown[] = []) {
  useKeyboardShortcut('escape', callback, deps)
}

export function useSearchShortcut(callback: () => void, deps: unknown[] = []) {
  useKeyboardShortcut('cmd+k', callback, deps)
}

export default useKeyboardShortcut

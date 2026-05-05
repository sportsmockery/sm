'use client'

import { useSyncExternalStore } from 'react'

/**
 * Tiny client-only store for the currently-visible article in a streamed
 * reading session. NextArticleStream publishes the active article as the
 * reader scrolls; ArticleProgressHeader subscribes so the sticky title
 * tracks what's actually on screen.
 *
 * `null` means "the original article" — consumers fall back to their own prop.
 */
export interface ActiveArticleState {
  title: string
  url: string
}

let current: ActiveArticleState | null = null
const listeners = new Set<() => void>()

export function setActiveArticle(next: ActiveArticleState | null): void {
  if (
    current === next ||
    (current && next && current.title === next.title && current.url === next.url)
  ) {
    return
  }
  current = next
  for (const l of listeners) l()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot(): ActiveArticleState | null {
  return current
}

function getServerSnapshot(): ActiveArticleState | null {
  return null
}

export function useActiveArticle(): ActiveArticleState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

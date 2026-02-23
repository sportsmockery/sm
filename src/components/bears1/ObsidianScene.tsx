'use client'

import dynamic from 'next/dynamic'

const ObsidianSceneInner = dynamic(() => import('./ObsidianSceneInner'), {
  ssr: false,
  loading: () => null,
})

interface ObsidianSceneProps {
  hasActivePlayer: boolean
  isDark: boolean
}

export default function ObsidianScene({ hasActivePlayer, isDark }: ObsidianSceneProps) {
  return <ObsidianSceneInner hasActivePlayer={hasActivePlayer} isDark={isDark} />
}

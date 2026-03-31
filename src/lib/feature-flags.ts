// src/lib/feature-flags.ts

export const FEATURE_FLAGS = {
  // Controls /mock-draft API migration to new Mock model endpoints
  // Set NEXT_PUBLIC_USE_MOCK_MODEL=true in environment to enable
  USE_MOCK_MODEL: process.env.NEXT_PUBLIC_USE_MOCK_MODEL === 'true',

  // Controls Season Impact panel on /gm page
  // Set NEXT_PUBLIC_SHOW_SEASON_IMPACT=true in environment to enable
  SHOW_SEASON_IMPACT: process.env.NEXT_PUBLIC_SHOW_SEASON_IMPACT === 'true',
} as const

export type FeatureFlags = typeof FEATURE_FLAGS

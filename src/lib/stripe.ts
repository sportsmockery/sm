import Stripe from 'stripe'

// Lazy-initialized Stripe client to avoid build-time errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return _stripe
}

// Legacy export for compatibility - lazy getter
export const stripe = {
  get customers() { return getStripe().customers },
  get subscriptions() { return getStripe().subscriptions },
  get checkout() { return getStripe().checkout },
  get billingPortal() { return getStripe().billingPortal },
  get webhooks() { return getStripe().webhooks },
}

// Price IDs from environment
export const PRICE_IDS = {
  sm_plus_monthly: process.env.STRIPE_PRICE_SM_PLUS_MONTHLY!,
  sm_plus_annual: process.env.STRIPE_PRICE_SM_PLUS_ANNUAL!,
} as const

export type PriceTier = keyof typeof PRICE_IDS

// Helper to determine tier from price ID
export function getTierFromPriceId(priceId: string): string {
  if (priceId === PRICE_IDS.sm_plus_monthly) return 'sm_plus_monthly'
  if (priceId === PRICE_IDS.sm_plus_annual) return 'sm_plus_annual'
  return 'free'
}

// Check if a tier is a pro tier
export function isProTier(tier: string): boolean {
  return tier === 'sm_plus_monthly' || tier === 'sm_plus_annual'
}

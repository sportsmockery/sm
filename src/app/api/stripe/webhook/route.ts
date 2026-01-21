import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getTierFromPriceId } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string
  const customerId = session.customer as string
  const userId =
    session.metadata?.supabase_user_id ||
    (await getSupabaseUserIdFromCustomer(customerId))

  if (!userId) {
    console.error('No user ID found for customer:', customerId)
    return
  }

  const stripe = getStripe()
  const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
  const subscriptionItem = subscriptionData.items.data[0]
  const priceId = subscriptionItem.price.id
  const tier =
    (subscriptionData.metadata.tier as string) || getTierFromPriceId(priceId)

  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      tier,
      status: 'active',
      current_period_start: new Date(
        subscriptionItem.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscriptionItem.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscriptionData.cancel_at_period_end,
    },
    { onConflict: 'user_id' }
  )
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionItem = subscription.items.data[0]
  const priceId = subscriptionItem.price.id
  const tier =
    (subscription.metadata.tier as string) || getTierFromPriceId(priceId)

  // Map Stripe status to our status
  let dbStatus: string = subscription.status
  if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
    dbStatus = 'inactive'
  }

  await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      tier,
      status: dbStatus,
      current_period_start: new Date(
        subscriptionItem.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscriptionItem.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      tier: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID from parent.subscription_details in Stripe v20+
  const subscriptionDetails = invoice.parent?.subscription_details
  const subscriptionId = subscriptionDetails?.subscription

  if (subscriptionId) {
    const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subId)
  }
}

async function getSupabaseUserIdFromCustomer(
  customerId: string
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.user_id || null
}

'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  tier: 'free' | 'sm_plus_monthly' | 'sm_plus_annual'
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'unpaid'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  user?: {
    id: string
    email: string
    raw_user_meta_data?: {
      name?: string
    }
  }
}

interface Summary {
  total: number
  active: number
  monthly: number
  annual: number
  canceled: number
  pastDue: number
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#6b7280' },
  sm_plus_monthly: { label: 'SM+ Monthly', color: '#f59e0b' },
  sm_plus_annual: { label: 'SM+ Annual', color: '#10b981' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#10b981' },
  inactive: { label: 'Inactive', color: '#6b7280' },
  canceled: { label: 'Canceled', color: '#ef4444' },
  past_due: { label: 'Past Due', color: '#f59e0b' },
  trialing: { label: 'Trial', color: '#3b82f6' },
  unpaid: { label: 'Unpaid', color: '#ef4444' },
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<{ status: string; tier: string }>({
    status: '',
    tier: '',
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [filter])

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.set('status', filter.status)
      if (filter.tier) params.set('tier', filter.tier)

      const res = await fetch(`/api/admin/subscriptions?${params}`)
      const data = await res.json()

      if (res.ok) {
        setSubscriptions(data.subscriptions || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openStripeCustomer = (customerId: string) => {
    window.open(`https://dashboard.stripe.com/customers/${customerId}`, '_blank')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Barlow, sans-serif" }}>
          Subscriptions
        </h1>
        <p className="text-zinc-500">Manage SM+ subscribers and view subscription analytics</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Total Users</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Active SM+</p>
            <p className="text-2xl font-bold text-green-500">{summary.active}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Monthly</p>
            <p className="text-2xl font-bold text-amber-500">{summary.monthly}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Annual</p>
            <p className="text-2xl font-bold text-emerald-500">{summary.annual}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Canceled</p>
            <p className="text-2xl font-bold text-red-500">{summary.canceled}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Past Due</p>
            <p className="text-2xl font-bold text-amber-500">{summary.pastDue}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
          <option value="past_due">Past Due</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filter.tier}
          onChange={(e) => setFilter({ ...filter, tier: e.target.value })}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
        >
          <option value="">All Tiers</option>
          <option value="sm_plus_monthly">SM+ Monthly</option>
          <option value="sm_plus_annual">SM+ Annual</option>
          <option value="free">Free</option>
        </select>

        <button
          onClick={fetchSubscriptions}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Period End
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const tierInfo = TIER_LABELS[sub.tier] || TIER_LABELS.free
                  const statusInfo = STATUS_LABELS[sub.status] || STATUS_LABELS.inactive

                  return (
                    <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {sub.user?.raw_user_meta_data?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-zinc-500">{sub.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: `${tierInfo.color}20`,
                            color: tierInfo.color,
                          }}
                        >
                          {tierInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: `${statusInfo.color}20`,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                        {sub.cancel_at_period_end && (
                          <span className="ml-2 text-xs text-amber-500">(Canceling)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        {sub.stripe_customer_id && (
                          <button
                            onClick={() => openStripeCustomer(sub.stripe_customer_id)}
                            className="text-sm text-blue-500 hover:text-blue-600"
                          >
                            View in Stripe
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

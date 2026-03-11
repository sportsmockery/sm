'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncWritersButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/sync-writers', { method: 'POST' })
      const data = await res.json()

      if (data.error) {
        setMessage(`Error: ${data.error}`)
      } else {
        setMessage(data.message)
        router.refresh()
      }

      setTimeout(() => setMessage(''), 5000)
    } catch {
      setMessage('Failed to sync writers')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-[#BC0000]' : 'text-[#00D4FF]'}`}>
          {message}
        </p>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#bc0000' }}
      >
        <svg className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        {syncing ? 'Syncing...' : 'Sync from WordPress'}
      </button>
    </div>
  )
}

'use client'

import { Mail } from 'lucide-react'
import { useState } from 'react'

export default function DashboardActions() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const sendSequences = async () => {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/cron/send-sequences', { method: 'POST' })
      const json = await res.json()
      setMsg(json.message || 'Séquences lancées !')
    } catch {
      setMsg('Erreur')
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {msg && (
        <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
          {msg}
        </span>
      )}
      <button
        onClick={sendSequences}
        disabled={loading}
        className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Mail className="w-4 h-4" />
        {loading ? 'Envoi…' : 'Envoyer séquences'}
      </button>
    </div>
  )
}

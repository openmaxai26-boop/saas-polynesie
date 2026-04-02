'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACTIONS = [
  { label: '🔍 Lancer scraping', href: '/api/scrape', method: 'POST', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
  { label: '📊 Générer rapport', href: '/api/cron/daily-report', method: 'POST', color: 'bg-teal-50 hover:bg-teal-100 text-teal-700' },
  { label: '👁 Voir portfolio', href: '/portfolio', method: 'GET', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
]

export default function QuickActions() {
  const [loadingHref, setLoadingHref] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})

  const handlePost = async (href: string) => {
    setLoadingHref(href)
    try {
      const res = await fetch(href, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      setMessages(m => ({ ...m, [href]: json.message || '✅ Lancé !' }))
    } catch {
      setMessages(m => ({ ...m, [href]: '❌ Erreur' }))
    } finally {
      setLoadingHref(null)
      setTimeout(() => setMessages(m => { const n = { ...m }; delete n[href]; return n }), 4000)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
      <div className="space-y-2">
        {ACTIONS.map(action =>
          action.method === 'GET' ? (
            <Link
              key={action.label}
              href={action.href}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color}`}
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              onClick={() => handlePost(action.href)}
              disabled={loadingHref === action.href}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color} disabled:opacity-60`}
            >
              {loadingHref === action.href ? '⏳ En cours…' : (messages[action.href] || action.label)}
            </button>
          )
        )}
      </div>
    </div>
  )
}

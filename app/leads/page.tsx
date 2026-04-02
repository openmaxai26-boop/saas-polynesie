'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Send, ExternalLink, Star, RefreshCw } from 'lucide-react'

type Lead = {
  id: string
  name: string
  business_type: string
  email: string | null
  phone: string | null
  city: string
  island: string
  score: number
  status: string
  created_at: string
  email_sequence_step: number
  portfolio_sent_at: string | null
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-600',
  enriched: 'bg-blue-100 text-blue-700',
  emailed: 'bg-indigo-100 text-indigo-700',
  replied: 'bg-yellow-100 text-yellow-700',
  interested: 'bg-orange-100 text-orange-700',
  proposal_sent: 'bg-purple-100 text-purple-700',
  signed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-600',
  unsubscribed: 'bg-gray-100 text-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  enriched: 'Enrichi',
  emailed: 'Contacté',
  replied: 'A répondu',
  interested: 'Intéressé',
  proposal_sent: 'Devis envoyé',
  signed: '✅ Signé',
  lost: 'Perdu',
  unsubscribed: 'Désinscrit',
}

const SCORE_COLOR = (score: number) =>
  score >= 70 ? 'text-green-600 bg-green-50' :
  score >= 50 ? 'text-yellow-600 bg-yellow-50' :
  'text-red-600 bg-red-50'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sending, setSending] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    const res = await fetch(`/api/leads?${params}`)
    const data = await res.json()
    setLeads(data.leads || [])
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const sendPortfolio = async (leadId: string, email: string) => {
    if (!email) { alert('Ce lead n\'a pas d\'email') ; return }
    setSending(leadId)
    await fetch('/api/send-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    })
    setSending(null)
    fetchLeads()
  }

  const runScraping = async () => {
    const res = await fetch('/api/scrape', { method: 'POST' })
    const data = await res.json()
    alert(`Scraping terminé: ${data.saved} nouveaux leads sauvegardés`)
    fetchLeads()
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{leads.length} leads affichés</p>
        </div>
        <div className="flex gap-3">
          <button onClick={runScraping}
            className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Lancer scraping
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un lead..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'emailed', 'replied', 'interested', 'signed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Entreprise', 'Contact', 'Secteur / Île', 'Score', 'Statut', 'Séquence', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Chargement...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                Aucun lead — lancez le scraping ou ajoutez des leads manuellement
              </td></tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{lead.name}</div>
                    <div className="text-gray-400 text-xs">{lead.city}</div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.email ? (
                      <div className="text-xs text-blue-600">{lead.email}</div>
                    ) : (
                      <span className="text-xs text-gray-300">Pas d'email</span>
                    )}
                    {lead.phone && <div className="text-xs text-gray-400">{lead.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <div className="capitalize">{lead.business_type || '—'}</div>
                    <div>{lead.island}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${SCORE_COLOR(lead.score)}`}>
                      <Star className="w-3 h-3" /> {lead.score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {lead.portfolio_sent_at ? (
                      <span className="text-green-600">Portfolio envoyé ✓</span>
                    ) : (
                      <span>Email {lead.email_sequence_step}/4</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {lead.email && !lead.portfolio_sent_at && (
                        <button
                          onClick={() => sendPortfolio(lead.id, lead.email!)}
                          disabled={sending === lead.id}
                          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Envoyer le portfolio"
                        >
                          <Send className="w-3 h-3" />
                          {sending === lead.id ? '...' : 'Portfolio'}
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`/leads/${lead.id}`, '_blank')}
                        className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 font-semibold px-2 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Détail
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

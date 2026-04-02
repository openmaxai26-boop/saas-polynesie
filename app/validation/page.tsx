'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, Mail, Globe } from 'lucide-react'

type ValidationItem = {
  id: string
  created_at: string
  type: 'email_sequence' | 'portfolio' | 'site_delivery'
  title: string
  description: string | null
  preview_url: string | null
  preview_data: Record<string, unknown> | null
  status: 'pending' | 'approved' | 'rejected' | 'modified'
  client_id: string | null
  lead_id: string | null
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  email_sequence: Mail,
  portfolio: Globe,
  site_delivery: Globe,
}

const TYPE_LABELS: Record<string, string> = {
  email_sequence: 'Séquence email',
  portfolio: 'Portfolio à envoyer',
  site_delivery: '🚀 Livraison de site',
}

const TYPE_COLORS: Record<string, string> = {
  email_sequence: 'bg-blue-100 text-blue-700',
  portfolio: 'bg-purple-100 text-purple-700',
  site_delivery: 'bg-orange-100 text-orange-700',
}

export default function ValidationPage() {
  const [items, setItems] = useState<ValidationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activePreview, setActivePreview] = useState<ValidationItem | null>(null)
  const [notes, setNotes] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch('/api/validate?status=pending')
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(id)
    await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, notes }),
    })
    setProcessing(null)
    setActivePreview(null)
    setNotes('')
    fetchItems()
  }

  const pending = items.filter(i => i.status === 'pending')

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Queue de validation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Vérifiez et approuvez avant tout envoi client
          </p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl font-semibold text-sm">
            <AlertTriangle className="w-5 h-5" />
            {pending.length} en attente
          </div>
        )}
      </div>

      {/* Rule reminder */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-8 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-800 text-sm">Règle absolue du système</div>
          <div className="text-amber-700 text-sm mt-1">
            Aucun email ni site n&apos;est envoyé au client sans votre approbation explicite.
            Chaque élément doit être reviewé ici avant d&apos;être déclenché automatiquement.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : pending.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">Tout est approuvé ✅</h2>
          <p className="text-green-600">Aucune validation en attente. Le système tourne parfaitement.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(item => {
            const Icon = TYPE_ICONS[item.type] || Mail
            return (
              <div key={item.id}
                className="bg-white rounded-xl border-2 border-orange-200 shadow-sm overflow-hidden hover:border-orange-300 transition-colors">
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <span className={`badge ${TYPE_COLORS[item.type]}`}>
                          {TYPE_LABELS[item.type]}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-gray-500 text-sm mb-3">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        Créé {new Date(item.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {/* Preview data */}
                  {item.preview_data && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 text-xs text-gray-600 font-mono max-h-40 overflow-y-auto">
                      {item.type === 'email_sequence' && (
                        <div>
                          <div className="font-bold text-gray-700 mb-1">
                            Objet: {(item.preview_data as any).subject}
                          </div>
                          <div className="whitespace-pre-wrap text-gray-500">
                            {(item.preview_data as any).preview}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center gap-3">
                    {item.preview_url && (
                      <a
                        href={item.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" /> Prévisualiser
                      </a>
                    )}
                    <div className="ml-auto flex items-center gap-3">
                      <button
                        onClick={() => {
                          const reason = prompt('Raison du rejet (optionnel):')
                          handleAction(item.id, 'reject', reason || undefined)
                        }}
                        disabled={processing === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'approve')}
                        disabled={processing === item.id}
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white hover:bg-green-700 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processing === item.id ? 'En cours...' : '✅ Approuver & Envoyer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { supabaseAdmin } from '@/lib/supabase'
import { Users, Mail, TrendingUp, DollarSign, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

async function getMetrics() {
  const [
    { count: totalLeads },
    { count: emailedToday },
    { data: recentLeads },
    { data: signedClients },
    { data: pendingValidations },
    { data: todayStats },
  ] = await Promise.all([
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('email_logs')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabaseAdmin.from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin.from('clients')
      .select('amount_xpf, created_at')
      .not('paid_at', 'is', null),
    supabaseAdmin.from('validation_queue')
      .select('*')
      .eq('status', 'pending'),
    supabaseAdmin.from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(7),
  ])

  const totalRevenue = signedClients?.reduce((sum, c) => sum + (c.amount_xpf || 0), 0) || 0
  const mthClients = signedClients?.filter(c => {
    const d = new Date(c.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length || 0

  return {
    totalLeads: totalLeads || 0,
    emailedToday: emailedToday || 0,
    totalRevenue,
    mthClients,
    recentLeads: recentLeads || [],
    pendingValidations: pendingValidations || [],
    todayStats: todayStats || [],
  }
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
}

export default async function DashboardPage() {
  const metrics = await getMetrics()

  const kpis = [
    {
      label: 'Leads totaux',
      value: metrics.totalLeads.toLocaleString('fr-FR'),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      delta: '+12 aujourd\'hui',
      deltaColor: 'text-green-600',
    },
    {
      label: 'Emails envoyés (auj.)',
      value: metrics.emailedToday.toLocaleString('fr-FR'),
      icon: Mail,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      delta: 'Cron actif 8h & 20h',
      deltaColor: 'text-green-600',
    },
    {
      label: 'Clients ce mois',
      value: metrics.mthClients.toString(),
      icon: CheckCircle,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      delta: 'Objectif: 5',
      deltaColor: 'text-orange-500',
    },
    {
      label: 'CA total (XPF)',
      value: metrics.totalRevenue > 0
        ? metrics.totalRevenue.toLocaleString('fr-FR')
        : '—',
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      delta: 'Objectif: 400k/mois',
      deltaColor: 'text-gray-500',
    },
  ]

  return (
    <div className="p-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetch('/api/cron/send-sequences', { method: 'POST' })}
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Envoyer séquences
          </button>
          <Link
            href="/validation"
            className="relative bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Validations
            {metrics.pendingValidations.length > 0 && (
              <span className="bg-white text-orange-600 text-xs font-black px-1.5 py-0.5 rounded-full">
                {metrics.pendingValidations.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Alert validations */}
      {metrics.pendingValidations.length > 0 && (
        <Link href="/validation" className="block mb-6">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 flex items-center gap-4 hover:bg-orange-100 transition-colors">
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div>
              <div className="font-bold text-orange-800">
                ⚠️ {metrics.pendingValidations.length} validation{metrics.pendingValidations.length > 1 ? 's' : ''} en attente de votre approbation
              </div>
              <div className="text-orange-600 text-sm">
                {metrics.pendingValidations.map(v => v.title).slice(0, 3).join(' · ')}
              </div>
            </div>
            <div className="ml-auto text-orange-500 font-bold text-sm">Valider →</div>
          </div>
        </Link>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{kpi.value}</div>
            <div className="text-gray-500 text-sm">{kpi.label}</div>
            <div className={`text-xs mt-2 font-medium ${kpi.deltaColor}`}>{kpi.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent leads */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Derniers leads</h2>
            <Link href="/leads" className="text-blue-600 text-sm font-medium hover:underline">
              Voir tous →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Entreprise', 'Secteur', 'Île', 'Score', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {metrics.recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Aucun lead — lancez le scraping pour commencer
                  </td>
                </tr>
              ) : (
                metrics.recentLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{lead.business_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.island}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${lead.score >= 70 ? 'bg-green-500' : lead.score >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Pipeline funnel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Pipeline</h2>
            <div className="space-y-3">
              {[
                { label: 'Nouveaux', key: 'new', color: 'bg-gray-400' },
                { label: 'Contactés', key: 'emailed', color: 'bg-indigo-500' },
                { label: 'Réponses', key: 'replied', color: 'bg-yellow-500' },
                { label: 'Intéressés', key: 'interested', color: 'bg-orange-500' },
                { label: 'Signés', key: 'signed', color: 'bg-green-500' },
              ].map(({ label, key, color }) => {
                const count = metrics.recentLeads.filter((l: any) => l.status === key).length
                const pct = metrics.totalLeads > 0 ? Math.round(count / metrics.totalLeads * 100) : 0
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              {[
                { label: '🔍 Lancer scraping', href: '/api/scrape', method: 'POST', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
                { label: '📊 Générer rapport', href: '/api/cron/daily-report', method: 'POST', color: 'bg-teal-50 hover:bg-teal-100 text-teal-700' },
                { label: '👁 Voir portfolio', href: '/portfolio', method: 'GET', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
              ].map(action => (
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
                    onClick={() => fetch(action.href, { method: action.method })}
                    className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                  >
                    {action.label}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { supabaseAdmin } from '@/lib/supabase'
import { TrendingUp, Mail, BarChart3, DollarSign } from 'lucide-react'
import ReportingCharts from './ReportingCharts'
import Link from 'next/link'

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

async function getReportingData() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    { data: reports },
    { data: topLeads },
    { data: emailLogs },
    { data: clients },
  ] = await Promise.all([
    supabaseAdmin
      .from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(30),
    supabaseAdmin
      .from('leads')
      .select('*')
      .in('status', ['interested', 'replied', 'proposal_sent'])
      .order('score', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('email_logs')
      .select('*')
      .gte('sent_at', monthStart.toISOString()),
    supabaseAdmin
      .from('clients')
      .select('*')
      .gte('created_at', monthStart.toISOString())
      .not('paid_at', 'is', null),
  ])

  // Calculate this month's metrics
  const thisMonthReports = (reports || []).filter(r => {
    const d = new Date(r.report_date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalLeadsThisMonth = thisMonthReports.reduce((sum, r) => sum + (r.leads_scraped || 0), 0)
  const totalEmailsThisMonth = (emailLogs || []).length
  const totalClientsThisMonth = (clients || []).length
  const totalRevenueThisMonth = (clients || []).reduce((sum, c) => sum + (c.amount_xpf || 0), 0)

  // For conversion rate: only count clients that were emails to and then signed
  const emailedLeads = (reports || []).reduce((sum, r) => sum + (r.emails_sent || 0), 0)
  const conversionRate =
    emailedLeads > 0 ? Math.round((totalClientsThisMonth / emailedLeads) * 100) : 0

  return {
    reports: reports || [],
    topLeads: topLeads || [],
    clients: clients || [],
    metrics: {
      totalLeadsThisMonth,
      totalEmailsThisMonth,
      conversionRate,
      totalRevenueThisMonth,
    },
  }
}

export default async function ReportingPage() {
  const { reports, topLeads, clients, metrics } = await getReportingData()

  const kpis = [
    {
      label: 'Leads récoltés (ce mois)',
      value: metrics.totalLeadsThisMonth.toLocaleString('fr-FR'),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Emails envoyés (ce mois)',
      value: metrics.totalEmailsThisMonth.toLocaleString('fr-FR'),
      icon: Mail,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Taux de conversion',
      value: `${metrics.conversionRate}%`,
      icon: BarChart3,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'CA (ce mois) - XPF',
      value: metrics.totalRevenueThisMonth > 0 ? metrics.totalRevenueThisMonth.toLocaleString('fr-FR') : '—',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Rapports & Statistiques</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/"
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          ← Retour au dashboard
        </Link>
      </div>

      {/* KPI Cards */}
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
          </div>
        ))}
      </div>

      {/* Charts */}
      <ReportingCharts reports={reports} />

      {/* Tables Section */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        {/* Daily Reports Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Rapports quotidiens (10 derniers jours)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Date',
                    'Leads',
                    'Emails',
                    'Taux ouv.',
                    'Clients',
                    'CA (XPF)',
                  ].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Aucun rapport quotidien
                    </td>
                  </tr>
                ) : (
                  reports.slice(0, 10).map(report => {
                    const openRate =
                      report.emails_sent > 0
                        ? Math.round((report.emails_opened / report.emails_sent) * 100)
                        : 0
                    const reportDate = new Date(report.report_date).toLocaleDateString('fr-FR')

                    return (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-medium">{reportDate}</td>
                        <td className="px-4 py-3 text-gray-600">{report.leads_scraped || 0}</td>
                        <td className="px-4 py-3 text-gray-600">{report.emails_sent || 0}</td>
                        <td className="px-4 py-3 text-gray-600">{openRate}%</td>
                        <td className="px-4 py-3 text-gray-600">{report.clients_signed || 0}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {(report.revenue_xpf || 0).toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Leads Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Top leads (ce mois)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Nom', 'Secteur', 'Score', 'Statut', 'Email'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Aucun lead qualifié ce mois
                    </td>
                  </tr>
                ) : (
                  topLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {lead.business_type || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                lead.score >= 70
                                  ? 'bg-green-500'
                                  : lead.score >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8">
                            {lead.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {STATUS_LABELS[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-xs">
                        {lead.email || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

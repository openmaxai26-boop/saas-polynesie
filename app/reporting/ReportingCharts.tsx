'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DailyReport {
  id: string
  report_date: string
  leads_scraped: number
  emails_sent: number
  emails_opened: number
  clients_signed: number
  revenue_xpf: number
}

interface ReportingChartsProps {
  reports: DailyReport[]
}

export default function ReportingCharts({ reports }: ReportingChartsProps) {
  // Prepare data for line chart (last 30 days)
  const lineChartData = reports
    .slice()
    .reverse()
    .map(r => ({
      date: new Date(r.report_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      leads: r.leads_scraped || 0,
      fullDate: r.report_date,
    }))

  // Prepare data for bar chart (last 7 days)
  const barChartData = reports
    .slice(0, 7)
    .reverse()
    .map(r => ({
      date: new Date(r.report_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      envoyés: r.emails_sent || 0,
      ouverts: r.emails_opened || 0,
      fullDate: r.report_date,
    }))

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Line Chart: Leads per day */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Leads récoltés (30 derniers jours)</h3>
        {lineChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => value.toLocaleString('fr-FR')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar Chart: Emails sent vs opened */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Emails envoyés vs ouverts (7 derniers jours)</h3>
        {barChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => value.toLocaleString('fr-FR')}
              />
              <Legend />
              <Bar dataKey="envoyés" fill="#8b5cf6" name="Envoyés" />
              <Bar dataKey="ouverts" fill="#10b981" name="Ouverts" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

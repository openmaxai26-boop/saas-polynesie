import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendDailyReport } from '@/lib/email'

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  try {
    const [
      { count: leadsToday },
      { count: emailsToday },
      { data: emailsOpened },
      { count: repliesToday },
      { data: clientsMonth },
      { count: pendingValidations },
    ] = await Promise.all([
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay),
      supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
        .gte('sent_at', startOfDay),
      supabaseAdmin.from('email_logs').select('id')
        .gte('sent_at', startOfDay)
        .not('opened_at', 'is', null),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true })
        .gte('replied_at', startOfDay),
      supabaseAdmin.from('clients').select('amount_xpf')
        .gte('paid_at', startOfMonth)
        .not('paid_at', 'is', null),
      supabaseAdmin.from('validation_queue').select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

    const totalEmailsSent = emailsToday || 0
    const openRate = totalEmailsSent > 0
      ? Math.round(((emailsOpened?.length || 0) / totalEmailsSent) * 100)
      : 0

    const clientsSignedMonth = clientsMonth?.length || 0
    const revenueMonth = clientsMonth?.reduce((sum, c) => sum + (c.amount_xpf || 0), 0) || 0

    const totalLeads = (leadsToday || 0) + clientsSignedMonth
    const conversionRate = totalLeads > 0
      ? parseFloat(((clientsSignedMonth / totalLeads) * 100).toFixed(1))
      : 0

    const metrics = {
      leadsToday: leadsToday || 0,
      emailsSent: totalEmailsSent,
      openRate,
      replies: repliesToday || 0,
      clientsSigned: clientsSignedMonth,
      revenueMth: revenueMonth,
      conversionRate,
      pendingValidations: pendingValidations || 0,
    }

    // Sauvegarder dans la table daily_reports
    await supabaseAdmin.from('daily_reports').upsert({
      report_date: todayStr,
      leads_scraped: leadsToday || 0,
      emails_sent: totalEmailsSent,
      emails_opened: emailsOpened?.length || 0,
      replies_received: repliesToday || 0,
      clients_signed: clientsSignedMonth,
      revenue_xpf: revenueMonth,
      conversion_rate: conversionRate,
      raw_data: metrics,
    }, { onConflict: 'report_date' })

    // Envoyer le rapport
    await sendDailyReport(metrics)

    return NextResponse.json({ success: true, metrics })

  } catch (err: any) {
    console.error('Daily report error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

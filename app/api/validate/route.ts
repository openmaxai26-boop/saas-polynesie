import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

// GET: récupérer les items de validation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'
  const id = searchParams.get('id')
  const action = searchParams.get('action') // pour les liens one-click email

  // One-click approval depuis email (lien GET)
  if (id && action && (action === 'approve' || action === 'reject')) {
    const { data: item } = await supabaseAdmin
      .from('validation_queue')
      .update({ status: action === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (action === 'approve' && item) {
      await executeApprovedAction(item)
    }

    // Redirect to dashboard
    return NextResponse.redirect(`${APP_URL}/validation?toast=${action === 'approve' ? 'approved' : 'rejected'}`)
  }

  const { data: items, error } = await supabaseAdmin
    .from('validation_queue')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items })
}

// POST: approuver ou rejeter depuis le dashboard
export async function POST(request: NextRequest) {
  const { id, action, notes } = await request.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'id et action requis' }, { status: 400 })
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  const { data: item, error } = await supabaseAdmin
    .from('validation_queue')
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Exécuter l'action si approuvée
  if (action === 'approve' && item) {
    await executeApprovedAction(item)
  }

  return NextResponse.json({ success: true, item })
}

// Exécute l'action après approbation
async function executeApprovedAction(item: {
  id: string
  type: string
  lead_id: string | null
  client_id: string | null
  preview_data: Record<string, unknown> | null
}) {
  try {
    if (item.type === 'email_sequence' && item.lead_id) {
      // Envoyer le premier email de la séquence
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', item.lead_id)
        .single()

      if (lead?.email) {
        const emailData = item.preview_data as any
        await sendEmail({
          to: lead.email,
          subject: emailData.subject,
          html: emailData.html,
          leadId: item.lead_id,
        })

        await supabaseAdmin.from('leads').update({
          status: 'emailed',
          email_sequence_step: 1,
          last_email_sent_at: new Date().toISOString(),
          next_email_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }).eq('id', item.lead_id)
      }

    } else if (item.type === 'site_delivery' && item.client_id) {
      // Marquer le site comme livré
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', item.client_id)
        .single()

      if (client) {
        // Email de livraison client
        const deliveryHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#16a34a,#0f766e);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="color:white;margin:0;">🚀 Votre site est en ligne !</h1>
            </div>
            <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
              <p>Bonjour ${client.name},</p>
              <p>Votre site internet est maintenant <strong>en ligne</strong> !</p>
              <p style="text-align:center;margin:24px 0;">
                <a href="${client.site_url_live}" target="_blank"
                   style="background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
                  👉 Voir mon site
                </a>
              </p>
              <p>Votre domaine : <strong>${client.domain_name || client.site_url_live}</strong></p>
              <p>Bonne continuation !<br/>Agence Web Polynésie</p>
            </div>
          </div>
        `

        await sendEmail({
          to: client.email,
          subject: '🚀 Votre site internet est en ligne !',
          html: deliveryHtml,
        })

        await supabaseAdmin.from('clients').update({
          site_status: 'delivered',
          delivered_at: new Date().toISOString(),
          delivery_email_sent_at: new Date().toISOString(),
        }).eq('id', item.client_id)
      }
    }
  } catch (err) {
    console.error('Error executing approved action:', err)
  }
}

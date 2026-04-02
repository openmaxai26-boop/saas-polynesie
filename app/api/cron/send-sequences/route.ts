import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildEmailSequence, sendValidationNotification } from '@/lib/email'

// Vérifie le secret cron (sécurité)
function verifyCronSecret(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function POST(request: NextRequest) {
  // Autoriser Vercel Cron + appels manuels depuis le dashboard
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const isAuthorized = verifyCronSecret(request)

  if (!isVercelCron && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  let processed = 0
  let queued = 0

  try {
    // 1. Leads nouveaux avec email — déclencher séquence email #1
    const { data: newLeads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .not('email', 'is', null)
      .eq('email_sequence_step', 0)
      .gte('score', 50)
      .limit(20)  // max 20/run pour ne pas spammer

    for (const lead of newLeads || []) {
      const sequence = buildEmailSequence(lead)
      const email = sequence[0]

      // Mettre en queue de validation plutôt que d'envoyer directement
      await supabaseAdmin.from('validation_queue').insert({
        type: 'email_sequence',
        lead_id: lead.id,
        title: `Email #1 → ${lead.name}`,
        description: `Séquence froide pour ${lead.business_type} à ${lead.city}. Email: ${lead.email}`,
        preview_data: {
          subject: email.subject,
          html: email.html,
          preview: email.html.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
          lead_name: lead.name,
          lead_email: lead.email,
        },
        status: 'pending',
      })

      queued++
    }

    // 2. Leads déjà en séquence — envoyer relances automatiques (J+3, J+7, J+14)
    const { data: sequenceLeads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('status', 'emailed')
      .not('email', 'is', null)
      .lte('next_email_date', today)
      .lt('email_sequence_step', 4)

    for (const lead of sequenceLeads || []) {
      const sequence = buildEmailSequence(lead)
      const nextStep = lead.email_sequence_step
      const email = sequence[nextStep]
      if (!email) continue

      // Les relances (step 2+) s'envoient automatiquement sans validation
      // Seul le premier email passe par la validation
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const { data: emailResult, error } = await resend.emails.send({
        from: `Agence Web Polynésie <contact@votreagence-pf.com>`,
        to: [lead.email],
        subject: email.subject,
        html: email.html,
      })

      if (!error) {
        await supabaseAdmin.from('email_logs').insert({
          lead_id: lead.id,
          type: `sequence_${nextStep + 1}`,
          subject: email.subject,
          body_preview: email.html.replace(/<[^>]*>/g, '').slice(0, 200),
          resend_id: emailResult?.id || null,
          status: 'sent',
        })

        const nextStepNum = nextStep + 1
        const nextDays = [0, 3, 7, 14][nextStepNum] || 30
        const nextDate = new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        await supabaseAdmin.from('leads').update({
          email_sequence_step: nextStepNum,
          last_email_sent_at: new Date().toISOString(),
          next_email_date: nextStepNum < 4 ? nextDate : null,
          status: nextStepNum >= 4 ? 'lost' : 'emailed',
        }).eq('id', lead.id)

        processed++
      }
    }

    // 3. Notifier si des items ont été mis en queue
    if (queued > 0) {
      await sendValidationNotification({
        type: 'email_sequence',
        title: `${queued} nouveaux emails en attente de validation`,
        description: `${queued} séquences email prêtes. Approuvez-les pour lancer la prospection.`,
        validationId: 'batch',
      })
    }

    return NextResponse.json({
      success: true,
      queued,
      processed,
      message: `${queued} en validation, ${processed} relances envoyées`,
    })

  } catch (err: any) {
    console.error('Cron send-sequences error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET pour Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request)
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.vercel.app'

export async function POST(request: NextRequest) {
  const { leadId } = await request.json()

  // Récupérer le lead
  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })
  }

  if (!lead.email) {
    return NextResponse.json({ error: 'Ce lead n\'a pas d\'email' }, { status: 400 })
  }

  // Lien portfolio personnalisé avec tracking
  const portfolioUrl = `${APP_URL}/portfolio?ref=${leadId}&utm_source=email&utm_campaign=portfolio_send`

  // Email portfolio (remplace le RDV)
  const subject = `Nos créations pour votre secteur — ${lead.name}`
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">Portfolio & Réalisations</h1>
        <p style="color:#bfdbfe;margin:8px 0 0;">Agence Web Polynésie</p>
      </div>
      <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
        <p>Bonjour,</p>
        <p>Suite à mon message précédent concernant <strong>${lead.name}</strong>,
        je vous envoie notre portfolio complet pour que vous puissiez juger par vous-même
        de la qualité de notre travail.</p>

        <p>Vous y trouverez :</p>
        <ul style="color:#475569;line-height:2;">
          <li>✅ Des exemples de sites créés pour des entreprises en Polynésie</li>
          <li>⭐ Les avis de nos clients (vérifiés)</li>
          <li>💰 Nos tarifs transparents — à partir de <strong>49 000 XPF</strong></li>
          <li>🚀 Le processus de création étape par étape</li>
        </ul>

        <p style="text-align:center;margin:32px 0;">
          <a href="${portfolioUrl}"
             style="background:linear-gradient(135deg,#2563eb,#0891b2);color:white;padding:16px 36px;
                    border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;
                    box-shadow:0 4px 12px rgba(37,99,235,0.3);">
            👉 Voir le portfolio complet
          </a>
        </p>

        <div style="background:#f8fafc;border-radius:8px;padding:20px;border-left:4px solid #2563eb;margin:24px 0;">
          <p style="margin:0;font-style:italic;color:#475569;">
            "Nous avons livré plus de 12 sites en Polynésie. Le délai moyen est de 7 jours.
            100% de nos clients sont satisfaits ou remboursés."
          </p>
        </div>

        <p>Si vous avez des questions, répondez simplement à cet email — je vous réponds en moins de 24h.</p>
        <p>Bonne journée,<br/><strong>Agence Web Polynésie</strong></p>
      </div>
      <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">
        <a href="${APP_URL}/api/unsubscribe?lead=${leadId}" style="color:#94a3b8;">Se désinscrire</a>
      </p>
    </div>
  `

  try {
    const emailResult = await sendEmail({ to: lead.email, subject, html, leadId })

    // Logger l'envoi
    await supabaseAdmin.from('email_logs').insert({
      lead_id: leadId,
      type: 'portfolio',
      subject,
      body_preview: `Portfolio envoyé à ${lead.email}`,
      resend_id: emailResult?.id || null,
      status: 'sent',
    })

    // Mettre à jour le lead
    await supabaseAdmin.from('leads').update({
      portfolio_sent_at: new Date().toISOString(),
      status: lead.status === 'new' ? 'emailed' : lead.status,
      updated_at: new Date().toISOString(),
    }).eq('id', leadId)

    return NextResponse.json({ success: true, message: `Portfolio envoyé à ${lead.email}` })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

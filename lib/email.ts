import { Resend } from 'resend'
import type { Lead } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key')
// FROM_EMAIL : mettre votre domaine vérifié dans Resend, ex: contact@votredomaine.pf
// En attendant, onboarding@resend.dev fonctionne pour les tests
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Agence Web Polynésie'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://saas-polynesie.vercel.app'

// ============================================================
// SÉQUENCE EMAIL — 4 emails de prospection
// ============================================================

export function buildEmailSequence(lead: Lead) {
  const firstName = lead.name.split(' ')[0]
  const portfolioUrl = `${APP_URL}/portfolio?ref=${lead.id}&utm_source=email&utm_campaign=cold`

  const emails = [
    // ---- EMAIL 1 : Accroche ----
    {
      subject: `${lead.name} — vos clients vous cherchent sur Google et ne vous trouvent pas`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <p>Bonjour,</p>
          <p>Je viens de chercher <strong>"${lead.business_type} ${lead.city}"</strong> sur Google.</p>
          <p>Votre entreprise <strong>${lead.name}</strong> apparaît sur Maps, mais sans site web.</p>
          <p>Chaque mois, des dizaines de personnes font cette recherche.
          Vos concurrents avec un site captent ces clients — pas vous.</p>
          <p><strong>Je crée des sites internet professionnels pour les entreprises de Polynésie en 7 jours.</strong></p>
          <p>J'ai préparé quelques exemples de ce que ça pourrait donner pour un ${lead.business_type} comme le vôtre :</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${portfolioUrl}"
               style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              👉 Voir nos réalisations pour les ${lead.business_type}s
            </a>
          </p>
          <p>Les tarifs démarrent à <strong>49 000 XPF</strong>, hébergement et nom de domaine inclus.</p>
          <p>Bonne journée,<br/><strong>${FROM_NAME}</strong></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="font-size:12px;color:#94a3b8;">
            Vous ne souhaitez pas recevoir d'emails ?
            <a href="${APP_URL}/api/unsubscribe?lead=${lead.id}" style="color:#94a3b8;">Se désinscrire</a>
          </p>
        </div>
      `,
    },

    // ---- EMAIL 2 : Preuve sociale (J+3) ----
    {
      subject: `Un restaurant comme ${lead.name} a gagné 47 clients en 1 mois grâce à son site`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <p>Bonjour,</p>
          <p>Je me permets de revenir vers vous avec un exemple concret.</p>
          <p>Un de nos clients, <strong>Chez Miri à Papeete</strong>, n'avait pas de site web.
          Nous avons créé le leur en 7 jours. Le mois suivant, <strong>47 nouveaux clients</strong>
          les ont trouvés sur Google.</p>
          <blockquote style="border-left:4px solid #2563eb;padding-left:16px;color:#475569;font-style:italic;">
            "Le site a été livré en 6 jours. Maintenant j'ai des réservations tous les soirs."
            — Miriama T., Chez Miri
          </blockquote>
          <p>Voici le portfolio complet avec toutes nos réalisations :</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${portfolioUrl}"
               style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              👉 Voir toutes nos réalisations
            </a>
          </p>
          <p>Les tarifs démarrent à <strong>49 000 XPF</strong>, tout inclus, livraison en 7 jours.</p>
          <p>Bonne journée,<br/><strong>${FROM_NAME}</strong></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="font-size:12px;color:#94a3b8;">
            <a href="${APP_URL}/api/unsubscribe?lead=${lead.id}" style="color:#94a3b8;">Se désinscrire</a>
          </p>
        </div>
      `,
    },

    // ---- EMAIL 3 : Urgence / Concurrents (J+7) ----
    {
      subject: `Question rapide sur ${lead.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <p>Bonjour,</p>
          <p>Petite question directe : est-ce que l'absence de site web est un choix délibéré,
          ou c'est juste quelque chose que vous n'avez pas encore eu le temps de faire ?</p>
          <p>Je demande parce que je vois beaucoup d'entreprises à ${lead.city} qui perdent
          des clients chaque jour uniquement parce qu'elles ne sont pas visibles en ligne.</p>
          <p>Si c'est une question de temps ou de budget, je peux vous aider :
          <strong>site livré en 7 jours, à partir de 49 000 XPF</strong>, et je gère tout de A à Z.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${portfolioUrl}"
               style="background:#0f766e;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              👉 Voir le portfolio & les tarifs
            </a>
          </p>
          <p>Bonne journée,<br/><strong>${FROM_NAME}</strong></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="font-size:12px;color:#94a3b8;">
            <a href="${APP_URL}/api/unsubscribe?lead=${lead.id}" style="color:#94a3b8;">Se désinscrire</a>
          </p>
        </div>
      `,
    },

    // ---- EMAIL 4 : Dernier email / Ressource offerte (J+14) ----
    {
      subject: `Dernier message — je vous offre quelque chose`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <p>Bonjour,</p>
          <p>C'est mon dernier email. Je ne veux pas vous déranger davantage.</p>
          <p>Avant de partir, je vous offre une ressource gratuite : une <strong>analyse rapide
          de votre présence en ligne</strong> (Google, réseaux sociaux, visibilité locale).</p>
          <p>Aucun engagement, juste une analyse claire de ce que vous perdez et ce que vous
          pourriez gagner avec un site.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${portfolioUrl}"
               style="background:#7c3aed;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              👉 Voir le portfolio & commander
            </a>
          </p>
          <p>Si le moment n'est pas bon maintenant, je comprends. Bonne continuation à ${lead.name}.</p>
          <p>Cordialement,<br/><strong>${FROM_NAME}</strong></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="font-size:12px;color:#94a3b8;">
            <a href="${APP_URL}/api/unsubscribe?lead=${lead.id}" style="color:#94a3b8;">Se désinscrire</a>
          </p>
        </div>
      `,
    },
  ]

  return emails
}

// ============================================================
// ENVOI EMAIL VIA RESEND
// ============================================================
export async function sendEmail({
  to,
  subject,
  html,
  leadId,
}: {
  to: string
  subject: string
  html: string
  leadId?: string
}) {
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
    headers: leadId ? { 'X-Lead-Id': leadId } : undefined,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// ============================================================
// RAPPORT QUOTIDIEN (email + telegram)
// ============================================================
export async function sendDailyReport(metrics: {
  leadsToday: number
  emailsSent: number
  openRate: number
  replies: number
  clientsSigned: number
  revenueMth: number
  conversionRate: number
  pendingValidations: number
}) {
  const reportHtml = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#1e3a5f;border-bottom:3px solid #2563eb;padding-bottom:8px;">
        📊 Rapport quotidien — ${new Date().toLocaleDateString('fr-FR')}
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ['🎯 Leads trouvés', metrics.leadsToday, '#0f766e'],
          ['📧 Emails envoyés', metrics.emailsSent, '#2563eb'],
          ['👀 Taux d\'ouverture', `${metrics.openRate}%`, '#7c3aed'],
          ['💬 Réponses reçues', metrics.replies, '#16a34a'],
          ['🤝 Clients signés (mois)', metrics.clientsSigned, '#ea580c'],
          ['💰 CA ce mois (XPF)', metrics.revenueMth.toLocaleString('fr-FR'), '#ea580c'],
          ['📈 Taux de conversion', `${metrics.conversionRate}%`, '#2563eb'],
        ].map(([label, val, color]) => `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 8px;color:#475569;">${label}</td>
            <td style="padding:10px 8px;text-align:right;font-weight:bold;color:${color};">${val}</td>
          </tr>
        `).join('')}
      </table>
      ${metrics.pendingValidations > 0 ? `
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin-top:16px;">
          <strong>⚠️ ${metrics.pendingValidations} validation(s) en attente</strong><br/>
          <a href="${APP_URL}/validation" style="color:#d97706;">👉 Valider maintenant</a>
        </div>
      ` : `
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin-top:16px;">
          <strong>✅ Aucune action requise — tout roule !</strong>
        </div>
      `}
    </div>
  `

  // Envoyer par email
  await sendEmail({
    to: 'openmaxai26@gmail.com',
    subject: `📊 Rapport quotidien SaaS PF — ${new Date().toLocaleDateString('fr-FR')}`,
    html: reportHtml,
  })

  // Envoyer via Telegram
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const text = `📊 *Rapport du ${new Date().toLocaleDateString('fr-FR')}*\n\n` +
      `🎯 Leads: *${metrics.leadsToday}*\n` +
      `📧 Emails: *${metrics.emailsSent}*\n` +
      `👀 Ouverture: *${metrics.openRate}%*\n` +
      `💬 Réponses: *${metrics.replies}*\n` +
      `🤝 Clients: *${metrics.clientsSigned}*\n` +
      `💰 CA mois: *${metrics.revenueMth.toLocaleString('fr-FR')} XPF*\n\n` +
      (metrics.pendingValidations > 0
        ? `⚠️ *${metrics.pendingValidations} validation(s) en attente !*`
        : '✅ Aucune action requise')

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    })
  }
}

// ============================================================
// NOTIFICATION VALIDATION HUMAINE
// ============================================================
export async function sendValidationNotification(item: {
  type: string
  title: string
  description: string
  previewUrl?: string
  validationId: string
}) {
  const approveUrl = `${APP_URL}/api/validate?id=${item.validationId}&action=approve`
  const rejectUrl  = `${APP_URL}/api/validate?id=${item.validationId}&action=reject`
  const dashUrl    = `${APP_URL}/validation`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
      <div style="background:#ea580c;color:white;padding:16px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">⚠️ Validation requise</h2>
      </div>
      <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <h3>${item.title}</h3>
        <p style="color:#475569;">${item.description}</p>
        ${item.previewUrl ? `<p><a href="${item.previewUrl}" style="color:#2563eb;">👁 Prévisualiser</a></p>` : ''}
        <div style="display:flex;gap:12px;margin-top:24px;">
          <a href="${approveUrl}"
             style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            ✅ Approuver
          </a>
          <a href="${rejectUrl}"
             style="background:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            ❌ Rejeter
          </a>
        </div>
        <p style="margin-top:16px;"><a href="${dashUrl}" style="color:#2563eb;">Voir toutes les validations</a></p>
      </div>
    </div>
  `

  await sendEmail({
    to: 'openmaxai26@gmail.com',
    subject: `⚠️ Action requise : ${item.title}`,
    html,
  })

  // Telegram
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `⚠️ *Validation requise*\n\n${item.title}\n${item.description}\n\n[Voir le dashboard](${dashUrl})`,
        parse_mode: 'Markdown',
      }),
    })
  }
}

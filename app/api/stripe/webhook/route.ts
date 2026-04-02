import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, sendValidationNotification } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const pack = session.metadata?.pack || 'starter'
    const leadId = session.metadata?.lead_id || null
    const amountXpf = parseInt(session.metadata?.amount_xpf || '49000')

    const customer = session.customer_details
    const businessName = (session.custom_fields?.find(f => f.key === 'business_name') as any)?.text?.value || ''

    // Créer le client dans Supabase
    const { data: client, error } = await supabaseAdmin.from('clients').insert({
      lead_id: leadId || null,
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || null,
      business_name: businessName,
      pack,
      amount_xpf: amountXpf,
      stripe_session_id: session.id,
      paid_at: new Date().toISOString(),
      site_status: 'pending',
    }).select().single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mettre à jour le lead si fourni
    if (leadId) {
      await supabaseAdmin.from('leads').update({ status: 'signed' }).eq('id', leadId)
    }

    // Email de confirmation au client
    await sendEmail({
      to: customer?.email || '',
      subject: '✅ Commande confirmée — Votre site est en cours de création !',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#16a34a,#0f766e);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;">✅ Commande confirmée !</h1>
          </div>
          <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <p>Bonjour ${customer?.name},</p>
            <p>Votre commande <strong>Pack ${pack.charAt(0).toUpperCase() + pack.slice(1)}</strong> a bien été reçue !</p>
            <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="margin:0;"><strong>Prochaine étape :</strong></p>
              <p style="margin:8px 0 0;">Nous vous contacterons dans les <strong>24 heures</strong> pour recueillir vos informations (logo, textes, photos).</p>
            </div>
            <p>Votre site sera en ligne dans les délais promis.</p>
            <p>Cordialement,<br/><strong>Agence Web Polynésie</strong></p>
          </div>
        </div>
      `,
    })

    // Notifier Maxence
    await sendValidationNotification({
      type: 'site_delivery',
      title: `💰 Nouveau client signé ! ${businessName || customer?.name} — ${amountXpf.toLocaleString('fr-FR')} XPF`,
      description: `Pack ${pack} · ${customer?.email} · ${customer?.phone || 'Pas de téléphone'}`,
      previewUrl: `${APP_URL}/`,
      validationId: client.id,
    })
  }

  return NextResponse.json({ received: true })
}

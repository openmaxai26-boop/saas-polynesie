import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.vercel.app'

const PACK_PRICES: Record<string, { amount: number; name: string; xpf: number }> = {
  starter:  { amount: 41200, name: 'Pack Starter — Site vitrine 5 pages',  xpf: 49000 },
  business: { amount: 74800, name: 'Pack Business — Site vitrine 10 pages', xpf: 89000 },
  premium:  { amount: 125200, name: 'Pack Premium — Site e-commerce',        xpf: 149000 },
}

export async function POST(request: NextRequest) {
  const { pack, leadId } = await request.json()

  const packInfo = PACK_PRICES[pack]
  if (!packInfo) {
    return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
  }

  try {
    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packInfo.name,
              description: `Site internet professionnel livré en Polynésie française. Prix en EUR (équivalent ${packInfo.xpf.toLocaleString('fr-FR')} XPF)`,
              images: [`${APP_URL}/logo.png`],
            },
            unit_amount: packInfo.amount, // en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${APP_URL}/portfolio/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/portfolio#pricing`,
      metadata: {
        pack,
        lead_id: leadId || '',
        amount_xpf: packInfo.xpf.toString(),
      },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'business_name',
          label: { type: 'custom', custom: 'Nom de votre entreprise' },
          type: 'text',
        },
      ],
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

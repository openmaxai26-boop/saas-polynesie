import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const leadId = searchParams.get('lead')

  if (!leadId) {
    return NextResponse.json({ error: 'Lead ID requis' }, { status: 400 })
  }

  await supabaseAdmin
    .from('leads')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('id', leadId)

  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Désinscription</title></head>
    <body style="font-family:Arial;text-align:center;padding:60px;color:#374151;">
      <h1 style="color:#16a34a;">✅ Désinscription prise en compte</h1>
      <p>Vous ne recevrez plus d'emails de notre part.</p>
      <p style="color:#9ca3af;font-size:14px;">Agence Web Polynésie</p>
    </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

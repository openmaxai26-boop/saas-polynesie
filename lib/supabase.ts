import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Client public (frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin (API routes — bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Types
export type Lead = {
  id: string
  created_at: string
  updated_at: string
  name: string
  business_type: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string
  island: string
  source: string | null
  score: number
  has_website: boolean
  website_url: string | null
  status: 'new' | 'enriched' | 'emailed' | 'replied' | 'interested' | 'proposal_sent' | 'signed' | 'lost' | 'unsubscribed'
  email_sequence_step: number
  last_email_sent_at: string | null
  next_email_date: string | null
  email_open_count: number
  email_click_count: number
  replied_at: string | null
  reply_classification: string | null
  portfolio_sent_at: string | null
  portfolio_opened: boolean
  notes: string | null
  tags: string[] | null
}

export type Client = {
  id: string
  created_at: string
  lead_id: string | null
  name: string
  email: string
  phone: string | null
  business_name: string | null
  business_type: string | null
  pack: 'starter' | 'business' | 'premium'
  amount_xpf: number
  stripe_session_id: string | null
  paid_at: string | null
  site_status: 'pending' | 'in_production' | 'ready_for_review' | 'approved' | 'delivered'
  site_url_preview: string | null
  site_url_live: string | null
  domain_name: string | null
  validation_requested_at: string | null
  validated_at: string | null
  validation_notes: string | null
  delivered_at: string | null
  maintenance_active: boolean
  seo_active: boolean
  notes: string | null
}

export type ValidationItem = {
  id: string
  created_at: string
  type: 'email_sequence' | 'portfolio' | 'site_delivery'
  client_id: string | null
  lead_id: string | null
  title: string
  description: string | null
  preview_url: string | null
  preview_data: Record<string, unknown> | null
  status: 'pending' | 'approved' | 'rejected' | 'modified'
  reviewed_at: string | null
  reviewer_notes: string | null
}

export type DashboardMetrics = {
  total_leads: number
  new_leads: number
  emailed_leads: number
  replied_leads: number
  signed_clients: number
  leads_today: number
  leads_this_month: number
}

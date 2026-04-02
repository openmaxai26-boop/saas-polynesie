-- ============================================================
-- SAAS POLYNÉSIE — Schéma Supabase
-- Coller ce SQL dans: Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: leads
-- ============================================================
create table if not exists leads (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Infos business
  name          text not null,
  business_type text,           -- restaurant, artisan, hotel, beaute, etc.
  email         text,
  phone         text,
  address       text,
  city          text default 'Papeete',
  island        text default 'Tahiti',

  -- Source scraping
  source        text,           -- google_maps, pages_jaunes, facebook, manual
  google_place_id text,
  facebook_page_id text,

  -- Scoring
  score         integer default 0 check (score >= 0 and score <= 100),
  has_website   boolean default false,
  website_url   text,
  website_last_updated date,

  -- Pipeline status
  status        text default 'new'
                check (status in ('new', 'enriched', 'emailed', 'replied', 'interested', 'proposal_sent', 'signed', 'lost', 'unsubscribed')),

  -- Email sequence tracking
  email_sequence_step  integer default 0,  -- 0=not started, 1=email1, 2=relance1, etc.
  last_email_sent_at   timestamptz,
  next_email_date      date,
  email_open_count     integer default 0,
  email_click_count    integer default 0,
  replied_at           timestamptz,
  reply_classification text,    -- interested, not_interested, info_request, bad_timing

  -- Portfolio sent
  portfolio_sent_at    timestamptz,
  portfolio_opened     boolean default false,

  -- Notes
  notes         text,
  tags          text[]
);

-- Indexes for performance
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_score_idx on leads(score desc);
create index if not exists leads_next_email_idx on leads(next_email_date);
create index if not exists leads_island_idx on leads(island);

-- ============================================================
-- TABLE: email_logs
-- ============================================================
create table if not exists email_logs (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now(),
  lead_id     uuid references leads(id) on delete cascade,

  type        text not null,  -- sequence_1, sequence_2, sequence_3, sequence_4, portfolio, proposal
  subject     text,
  body_preview text,
  sent_at     timestamptz default now(),
  opened_at   timestamptz,
  clicked_at  timestamptz,
  resend_id   text,           -- ID retourné par Resend API
  status      text default 'sent'  -- sent, opened, clicked, bounced, unsubscribed
);

create index if not exists email_logs_lead_idx on email_logs(lead_id);

-- ============================================================
-- TABLE: clients
-- ============================================================
create table if not exists clients (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  lead_id       uuid references leads(id),

  -- Info client
  name          text not null,
  email         text not null,
  phone         text,
  business_name text,
  business_type text,

  -- Commande
  pack          text not null check (pack in ('starter', 'business', 'premium')),
  amount_xpf    integer not null,
  stripe_session_id text,
  stripe_payment_intent text,
  paid_at       timestamptz,

  -- Production site
  site_status   text default 'pending'
                check (site_status in ('pending', 'in_production', 'ready_for_review', 'approved', 'delivered')),
  site_url_preview text,     -- URL de prévisualisation avant livraison
  site_url_live   text,      -- URL finale
  domain_name   text,

  -- Validation (vous)
  validation_requested_at timestamptz,
  validated_at  timestamptz,
  validation_notes text,

  -- Livraison
  delivered_at  timestamptz,
  delivery_email_sent_at timestamptz,

  -- Récurrence
  maintenance_active boolean default false,
  maintenance_start_date date,
  seo_active     boolean default false,

  notes         text
);

-- ============================================================
-- TABLE: daily_reports
-- ============================================================
create table if not exists daily_reports (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  report_date   date not null unique,

  -- Métriques leads
  leads_scraped      integer default 0,
  leads_enriched     integer default 0,
  emails_sent        integer default 0,
  emails_opened      integer default 0,
  emails_clicked     integer default 0,
  replies_received   integer default 0,
  portfolios_sent    integer default 0,

  -- Métriques business
  clients_signed     integer default 0,
  revenue_xpf        integer default 0,
  conversion_rate    numeric(5,2),

  -- Totaux cumulés
  total_leads        integer default 0,
  total_clients      integer default 0,
  total_revenue_xpf  integer default 0,

  -- Données brutes JSON
  raw_data           jsonb
);

-- ============================================================
-- TABLE: validation_queue
-- ============================================================
create table if not exists validation_queue (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),

  type          text not null check (type in ('email_sequence', 'portfolio', 'site_delivery')),
  client_id     uuid references clients(id),
  lead_id       uuid references leads(id),

  -- Ce qui doit être validé
  title         text not null,
  description   text,
  preview_url   text,
  preview_data  jsonb,    -- contenu de l'email ou du site

  -- Statut
  status        text default 'pending' check (status in ('pending', 'approved', 'rejected', 'modified')),
  reviewed_at   timestamptz,
  reviewer_notes text,

  -- Notification
  notified_at   timestamptz,
  telegram_message_id text
);

create index if not exists validation_queue_status_idx on validation_queue(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- (activer si vous utilisez Supabase Auth)
-- ============================================================
alter table leads enable row level security;
alter table email_logs enable row level security;
alter table clients enable row level security;
alter table daily_reports enable row level security;
alter table validation_queue enable row level security;

-- Policy: accès complet avec service role (API server-side)
-- Les API Next.js utilisent SUPABASE_SERVICE_ROLE_KEY donc bypass RLS

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Calcul automatique updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_leads_updated_at
  before update on leads
  for each row execute function update_updated_at_column();

-- Vue: métriques dashboard
create or replace view dashboard_metrics as
select
  count(*)                                         as total_leads,
  count(*) filter (where status = 'new')           as new_leads,
  count(*) filter (where status = 'emailed')       as emailed_leads,
  count(*) filter (where status = 'replied')       as replied_leads,
  count(*) filter (where status = 'signed')        as signed_clients,
  count(*) filter (where date_trunc('day', created_at) = current_date)  as leads_today,
  count(*) filter (where date_trunc('month', created_at) = date_trunc('month', current_date)) as leads_this_month
from leads;

-- Vue: pipeline par statut
create or replace view pipeline_by_status as
select
  status,
  count(*) as count,
  round(count(*) * 100.0 / nullif(sum(count(*)) over(), 0), 1) as pct
from leads
group by status
order by case status
  when 'new' then 1
  when 'enriched' then 2
  when 'emailed' then 3
  when 'replied' then 4
  when 'interested' then 5
  when 'proposal_sent' then 6
  when 'signed' then 7
  when 'lost' then 8
  when 'unsubscribed' then 9
end;

-- ============================================================
-- DONNÉES DE TEST (optionnel — supprimer en production)
-- ============================================================
insert into leads (name, business_type, email, phone, city, source, score, status, has_website) values
  ('Restaurant Taina', 'restaurant', 'taina@email.pf', '+689 87 11 22 33', 'Papeete', 'google_maps', 85, 'new', false),
  ('Fare Coco Guesthouse', 'hebergement', 'coco@email.pf', '+689 87 44 55 66', 'Moorea', 'google_maps', 72, 'new', false),
  ('Tama Peinture Batiment', 'artisan', null, '+689 87 77 88 99', 'Papeete', 'pages_jaunes', 45, 'new', false),
  ('Salon Vahine', 'beaute', 'vahine@email.pf', '+689 87 00 11 22', 'Papeete', 'facebook', 91, 'emailed', false),
  ('Pension Moorea Dream', 'hebergement', 'moorea@email.pf', '+689 87 33 44 55', 'Moorea', 'google_maps', 88, 'replied', false)
on conflict do nothing;

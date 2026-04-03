# 🚀 Guide de déploiement — SaaS Polynésie
## Mise en production en moins de 30 minutes

---

## ÉTAPE 1 — Supabase (base de données)

1. Aller sur **https://supabase.com** → Nouveau projet
2. Nom : `saas-polynesie` | Région : `ap-southeast-1` (Singapore, plus proche PF)
3. Notez votre mot de passe de BDD
4. Aller dans **SQL Editor** → coller le contenu de `supabase/schema.sql` → Run
5. Aller dans **Project Settings > API** → copier :
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## ÉTAPE 2 — Resend (emails)

1. Aller sur **https://resend.com** → Créer un compte gratuit
2. **Domains** → Ajouter votre domaine (ex: `votreagence-pf.com`)
3. Configurer les DNS (Resend vous donne les enregistrements)
4. **API Keys** → Créer une clé → copier dans `RESEND_API_KEY`
5. Modifier l'email d'envoi dans `lib/email.ts` ligne 4

---

## ÉTAPE 3 — Stripe (paiements)

1. Aller sur **https://stripe.com** → Créer un compte
2. **Dashboard** → Mode Live (ou Test pour commencer)
3. **API Keys** → copier `Publishable key` et `Secret key`
4. **Webhooks** → Ajouter endpoint :
   - URL : `https://VOTRE-DOMAINE.vercel.app/api/stripe/webhook`
   - Events : `checkout.session.completed`
   - Copier le `Signing secret` → `STRIPE_WEBHOOK_SECRET`

---

## ÉTAPE 4 — Google Places API (scraping)

1. Aller sur **https://console.cloud.google.com**
2. Nouveau projet → Activer **Places API**
3. **APIs & Services > Credentials** → Créer une clé API
4. Copier dans `GOOGLE_PLACES_API_KEY`
5. Budget : $200/mois offerts = ~11 000 requêtes gratuites

---

## ÉTAPE 5 — Telegram Bot (notifications)

1. Ouvrir Telegram → chercher **@BotFather**
2. `/newbot` → Donner un nom → Copier le token → `TELEGRAM_BOT_TOKEN`
3. Chercher **@userinfobot** → `/start` → Copier votre `id` → `TELEGRAM_CHAT_ID`

---

## ÉTAPE 6 — GitHub

```bash
# Dans le dossier saas-polynesie
git init
git add .
git commit -m "Initial commit — SaaS Polynésie"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/saas-polynesie.git
git push -u origin main
```

---

## ÉTAPE 7 — Vercel (déploiement)

1. Aller sur **https://vercel.com** → Import GitHub repository
2. Sélectionner `saas-polynesie`
3. **Environment Variables** → Ajouter TOUTES les variables du `.env.example` :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
CRON_SECRET=GÉNÉRER_32_CARACTÈRES_ALÉATOIRES
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
GOOGLE_PLACES_API_KEY=
```

4. **Deploy** → Attendre 2 minutes
5. Copier l'URL de déploiement → mettre à jour `NEXT_PUBLIC_APP_URL`

---

## ÉTAPE 8 — Vérification finale

Tester ces URLs après déploiement :

- [ ] `https://votre-domaine.vercel.app` → Dashboard s'affiche
- [ ] `https://votre-domaine.vercel.app/portfolio` → Page portfolio client
- [ ] `https://votre-domaine.vercel.app/validation` → Queue vide
- [ ] `https://votre-domaine.vercel.app/api/cron/daily-report` → Rapport test
- [ ] `https://votre-domaine.vercel.app/api/scrape` → Scraping test (besoin Google API)

---

## CRONS VERCEL (automatiques)

Le `vercel.json` configure :
- **20h00 UTC** = 8h00 heure de Tahiti (UTC-10)
- `/api/cron/send-sequences` → prépare les emails en validation
- `/api/cron/daily-report` → envoie le rapport du jour

---

## DOMAINE PERSONNALISÉ

1. Vercel Dashboard → **Domains** → Ajouter `votreagence-pf.com`
2. Configurer DNS chez votre registrar
3. Mettre à jour `NEXT_PUBLIC_APP_URL` dans Vercel

---

## COÛTS MENSUELS ESTIMÉS

| Service | Plan | Coût |
|---------|------|------|
| Vercel | Hobby (gratuit) | 0 € |
| Supabase | Free tier | 0 € |
| Resend | Free (100 emails/j) | 0 € → 20 $/mois si scale |
| Stripe | 1,5% + 0,25€ / transaction | Variable |
| Google Places | $200 crédit offert | 0 € → ~17$/1000 req |
| Telegram Bot | Gratuit | 0 € |
| **TOTAL démarrage** | | **~0 €/mois** |

---

## PREMIER LANCEMENT

1. Déployer sur Vercel ✅
2. Ouvrir le dashboard → lancer manuellement le scraping
3. Aller dans Validations → approuver les premiers emails
4. Les relances partent automatiquement (cron 8h Tahiti)
5. Dès qu'un prospect répond → vous le contactez, il paie via Stripe
6. Vous livrez le site → bouton "Approuver livraison" dans Validations

**Temps de gestion quotidienne : 15-30 minutes**
# SaaS Polynésie - Trigger redeploy 20260403082640

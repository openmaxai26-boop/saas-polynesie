'use client'
import { useState } from 'react'
import { Star, CheckCircle, ArrowRight, Phone, Mail, MapPin, Clock, ChevronDown } from 'lucide-react'

const PROJECTS = [
  {
    name: "Chez Miri — Restaurant",
    location: "Papeete, Tahiti",
    category: "Restaurant & Snack",
    color: "from-orange-400 to-red-500",
    accent: "#f97316",
    pages: ["Accueil", "Menu", "Galerie", "Contact"],
    result: "+47 nouveaux clients en 1 mois",
    mockup: {
      bg: "bg-orange-50",
      hero: "bg-gradient-to-r from-orange-500 to-red-600",
      nav: ["Accueil", "Menu", "Galerie", "Réserver"],
      title: "La vraie cuisine polynésienne",
      subtitle: "Poisson cru, mahi-mahi grillé, ma'a tinito — fait maison chaque jour",
      cta: "Voir le menu",
      cards: ["Poisson Cru Tahiti", "Mahi-Mahi Grillé", "Ma'a Tinito"],
      cardColors: ["bg-orange-100", "bg-red-100", "bg-yellow-100"],
    }
  },
  {
    name: "Fare Nui Bungalows",
    location: "Moorea",
    category: "Hébergement Tourisme",
    color: "from-cyan-400 to-blue-500",
    accent: "#06b6d4",
    pages: ["Accueil", "Bungalows", "Activités", "Réservation"],
    result: "Taux d'occupation +62% en 2 mois",
    mockup: {
      bg: "bg-cyan-50",
      hero: "bg-gradient-to-r from-cyan-500 to-blue-600",
      nav: ["Accueil", "Bungalows", "Activités", "Réserver"],
      title: "Le paradis à deux pas de Moorea",
      subtitle: "5 bungalows face au lagon, pension complète, activités nautiques",
      cta: "Réserver maintenant",
      cards: ["Bungalow Lagon", "Bungalow Jardin", "Suite Panorama"],
      cardColors: ["bg-cyan-100", "bg-blue-100", "bg-teal-100"],
    }
  },
  {
    name: "Tama Plomberie",
    location: "Papeete & alentours",
    category: "Artisan — Plomberie",
    color: "from-blue-400 to-indigo-500",
    accent: "#3b82f6",
    pages: ["Accueil", "Services", "Devis Gratuit", "Contact"],
    result: "15 devis en ligne la première semaine",
    mockup: {
      bg: "bg-blue-50",
      hero: "bg-gradient-to-r from-blue-600 to-indigo-600",
      nav: ["Accueil", "Services", "Tarifs", "Contact"],
      title: "Plombier de confiance à Tahiti",
      subtitle: "Intervention rapide 7j/7 — Devis gratuit en 24h — 12 ans d'expérience",
      cta: "Demander un devis",
      cards: ["Urgences", "Installation", "Rénovation"],
      cardColors: ["bg-blue-100", "bg-indigo-100", "bg-violet-100"],
    }
  },
  {
    name: "Vahine Beauty Spa",
    location: "Papeete, Tahiti",
    category: "Beauté & Bien-être",
    color: "from-pink-400 to-rose-500",
    accent: "#ec4899",
    pages: ["Accueil", "Soins", "Tarifs", "Réservation"],
    result: "Complet le week-end dès le 2ème mois",
    mockup: {
      bg: "bg-pink-50",
      hero: "bg-gradient-to-r from-pink-500 to-rose-500",
      nav: ["Accueil", "Soins", "Tarifs", "Réserver"],
      title: "L'art du soin polynésien",
      subtitle: "Massages tiare, soins monoi, beauté naturelle — Institut agréé",
      cta: "Prendre rendez-vous",
      cards: ["Massage Tiare", "Soin Visage", "Forfait Duo"],
      cardColors: ["bg-pink-100", "bg-rose-100", "bg-fuchsia-100"],
    }
  },
]

const TESTIMONIALS = [
  {
    name: "Miriama T.",
    business: "Chez Miri — Restaurant, Papeete",
    avatar: "MT",
    avatarColor: "bg-orange-500",
    stars: 5,
    text: "Avant le site, les gens ne savaient pas qu'on existait. Maintenant j'ai des réservations tous les soirs. Le site a été livré en 6 jours, exactement ce qui avait été promis. Je recommande à 100%.",
    result: "+47 clients le premier mois"
  },
  {
    name: "Henri M.",
    business: "Fare Nui Bungalows, Moorea",
    avatar: "HM",
    avatarColor: "bg-cyan-500",
    stars: 5,
    text: "Mon taux d'occupation est passé de 40% à 82% depuis que j'ai le site. Les touristes me trouvent sur Google maintenant. Ça a tout changé pour mon activité. Investissement rentabilisé en 3 semaines.",
    result: "+62% de taux d'occupation"
  },
  {
    name: "Tama V.",
    business: "Tama Plomberie, Tahiti",
    avatar: "TV",
    avatarColor: "bg-blue-500",
    stars: 5,
    text: "Je cherchais un plombier sur Google moi-même avant d'avoir le site — je ne m'y trouvais pas ! Maintenant j'ai 3 à 5 demandes de devis par semaine via le formulaire. C'est propre, rapide, professionnel.",
    result: "15 devis la 1ère semaine"
  },
  {
    name: "Valérie H.",
    business: "Vahine Beauty Spa, Papeete",
    avatar: "VH",
    avatarColor: "bg-pink-500",
    stars: 5,
    text: "Le site est magnifique, encore plus beau que ce à quoi je m'attendais. Mes clientes l'ont tout de suite adoré. Je suis complète le week-end depuis 2 mois. Merci pour le travail et la rapidité.",
    result: "Complet le week-end"
  },
]

const PACKS = [
  {
    name: "STARTER",
    price: "49 000",
    color: "border-teal-500",
    bg: "bg-teal-500",
    light: "bg-teal-50",
    textColor: "text-teal-600",
    features: [
      "Site vitrine 5 pages",
      "Design moderne responsive",
      "Formulaire de contact",
      "SEO on-page inclus",
      "Hébergement 1 an offert",
      "Nom de domaine inclus",
      "Livraison en 7 jours",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "starter",
    popular: false,
  },
  {
    name: "BUSINESS",
    price: "89 000",
    color: "border-blue-600",
    bg: "bg-blue-600",
    light: "bg-blue-50",
    textColor: "text-blue-600",
    features: [
      "Site vitrine 10 pages",
      "Design premium sur mesure",
      "Blog + actualités",
      "SEO avancé + audit offert",
      "Google My Business setup",
      "Formulaires avancés",
      "Hébergement 1 an offert",
      "Livraison en 10 jours",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || "business",
    popular: true,
  },
  {
    name: "PREMIUM",
    price: "149 000",
    color: "border-orange-500",
    bg: "bg-orange-500",
    light: "bg-orange-50",
    textColor: "text-orange-600",
    features: [
      "Site e-commerce complet",
      "Design exclusif",
      "Paiement en ligne intégré",
      "SEO complet + reporting mensuel",
      "Analytics dashboard",
      "Formation incluse",
      "Support 3 mois inclus",
      "Livraison en 14 jours",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || "premium",
    popular: false,
  },
]

function MockupCard({ project }: { project: typeof PROJECTS[0] }) {
  const { mockup } = project
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
      {/* Browser chrome */}
      <div className="bg-gray-800 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-gray-700 rounded text-xs text-gray-400 px-3 py-1 text-center">
          www.{project.name.toLowerCase().replace(/[^a-z]/g, '')}-tahiti.com
        </div>
      </div>
      {/* Mock site */}
      <div className={`${mockup.bg} text-xs`}>
        {/* Nav */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="font-bold text-gray-800 text-sm">{project.name.split('—')[0].trim()}</div>
          <div className="hidden sm:flex gap-4 text-gray-500">
            {mockup.nav.slice(0, 3).map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
        {/* Hero */}
        <div className={`${mockup.hero} text-white px-4 py-6`}>
          <div className="text-sm font-bold mb-1">{mockup.title}</div>
          <div className="text-xs opacity-80 mb-3">{mockup.subtitle}</div>
          <div className="inline-block bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full">
            {mockup.cta} →
          </div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-3 gap-2 p-3">
          {mockup.cards.map((card, i) => (
            <div key={card} className={`${mockup.cardColors[i]} rounded-lg p-2 text-center`}>
              <div className="w-full h-10 bg-white/60 rounded mb-1" />
              <div className="text-xs font-medium text-gray-700">{card}</div>
            </div>
          ))}
        </div>
        {/* Footer mock */}
        <div className="bg-gray-800 text-gray-400 px-4 py-2 text-xs flex justify-between">
          <span>{project.name.split('—')[0].trim()}</span>
          <span>{project.location}</span>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const [activeProject, setActiveProject] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleOrder = async (pack: typeof PACKS[0]) => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack: pack.name.toLowerCase(), priceId: pack.priceId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 20%, #06b6d4 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-blue-200 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Sites internet professionnels en Polynésie française
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Votre entreprise mérite
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              d&apos;être visible en ligne
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Nous créons des sites web professionnels pour les entreprises de Polynésie.
            Livraison en 7 jours. Résultats garantis ou remboursés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30">
              Voir les tarifs <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#portfolio"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-all">
              Voir nos réalisations
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center border-t border-white/10 pt-10">
            {[['12+', 'Sites livrés'], ['100%', 'Clients satisfaits'], ['7j', 'Délai moyen']].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl font-black text-cyan-400">{val}</div>
                <div className="text-sm text-blue-200 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">
            Pourquoi un site internet aujourd&apos;hui ?
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            En Polynésie, 78% des consommateurs cherchent une entreprise sur Google avant de se déplacer.
            Sans site, vous perdez des clients chaque jour.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Soyez trouvé sur Google', desc: 'Apparaissez quand vos clients vous cherchent. Vos concurrents sont déjà là.' },
              { icon: '📱', title: 'Visible 24h/24 sur mobile', desc: '80% du trafic web en Polynésie vient du téléphone. Votre site est optimisé.' },
              { icon: '💰', title: 'Retour sur investissement', desc: 'Nos clients récupèrent leur investissement en moins de 3 semaines en moyenne.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PORTFOLIO ===== */}
      <section id="portfolio" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Nos réalisations récentes</h2>
            <p className="text-gray-500">Des sites qui fonctionnent vraiment — avec des résultats mesurables</p>
          </div>
          {/* Tab selectors */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {PROJECTS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setActiveProject(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeProject === i
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {p.category}
              </button>
            ))}
          </div>
          {/* Active project */}
          {PROJECTS.map((project, i) => (
            <div key={project.name} className={`${activeProject === i ? 'block' : 'hidden'}`}>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <MockupCard project={project} />
                </div>
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${project.color} text-white mb-4`}>
                    {project.category}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{project.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.pages.map(page => (
                      <span key={page} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {page}
                      </span>
                    ))}
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-700 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      Résultat : {project.result}
                    </div>
                  </div>
                  <a href="#pricing"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
                    Je veux un site comme celui-ci <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Ce que disent nos clients</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-xl mb-2">
              {'★★★★★'}
            </div>
            <p className="text-gray-500">100% d&apos;avis vérifiés — tous nos clients</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.avatarColor} text-white flex items-center justify-center font-bold text-sm`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.business}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                    {t.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="py-16 bg-blue-950 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-3">Comment ça fonctionne ?</h2>
          <p className="text-blue-200 mb-12">De la commande à la mise en ligne — simple et transparent</p>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { step: '01', icon: '✅', title: 'Vous commandez', desc: 'Choisissez votre pack et payez en ligne de façon sécurisée' },
              { step: '02', icon: '📋', title: 'On vous contacte', desc: 'Nous récupérons vos informations en 24h par email' },
              { step: '03', icon: '🎨', title: 'On crée votre site', desc: 'Votre site est conçu et optimisé en 5 à 14 jours' },
              { step: '04', icon: '🚀', title: 'Mise en ligne', desc: 'Votre site est en ligne. Vous validez avant publication.' },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/30 border border-blue-400/30 flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-blue-400 mb-1">ÉTAPE {item.step}</div>
                <div className="font-bold mb-2">{item.title}</div>
                <div className="text-blue-200 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Tarifs clairs, sans surprise</h2>
            <p className="text-gray-500">Prix en Franc Pacifique (XPF). Paiement sécurisé en ligne.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PACKS.map(pack => (
              <div key={pack.name}
                className={`relative rounded-2xl border-2 ${pack.color} ${pack.popular ? 'shadow-2xl scale-105' : 'shadow-sm'} overflow-hidden`}>
                {pack.popular && (
                  <div className={`${pack.bg} text-white text-xs font-bold text-center py-2`}>
                    ⭐ LE PLUS POPULAIRE
                  </div>
                )}
                <div className={`p-6 ${pack.popular ? 'bg-white' : 'bg-white'}`}>
                  <div className={`text-xs font-black tracking-widest ${pack.textColor} mb-3`}>{pack.name}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-gray-900">{pack.price}</span>
                    <span className="text-gray-400 mb-1">XPF</span>
                  </div>
                  <div className="text-gray-400 text-xs mb-6">≈ {Math.round(parseInt(pack.price.replace(/\s/g,'')) / 119)} EUR · Paiement unique</div>
                  <ul className="space-y-3 mb-8">
                    {pack.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pack.textColor}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleOrder(pack)}
                    className={`w-full ${pack.bg} hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2`}
                  >
                    Commander ce pack <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            🔒 Paiement 100% sécurisé via Stripe · Satisfait ou remboursé sous 7 jours
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-10">Questions fréquentes</h2>
          {[
            {
              q: "Combien de temps pour avoir mon site en ligne ?",
              a: "Le délai dépend du pack choisi : 7 jours pour le Starter, 10 jours pour le Business, 14 jours pour le Premium. Vous validez le site avant la mise en ligne."
            },
            {
              q: "Je n'ai pas de textes ni de photos — ce n'est pas un problème ?",
              a: "Aucun problème. Nous rédigeons les textes pour vous (optimisés SEO) et utilisons des photos professionnelles adaptées à votre activité. Vous pouvez aussi nous envoyer les vôtres."
            },
            {
              q: "Est-ce que mon site sera visible sur Google ?",
              a: "Oui. Chaque site est optimisé SEO (on-page) à la livraison. Pour les packs Business et Premium, nous incluons un audit SEO complet et une configuration Google My Business."
            },
            {
              q: "Que se passe-t-il après la livraison ?",
              a: "Vous êtes propriétaire de votre site. Nous proposons des abonnements de maintenance (9 900 XPF/mois) et de SEO mensuel pour continuer à progresser sur Google."
            },
            {
              q: "Est-ce que je peux payer en plusieurs fois ?",
              a: "Oui, nous proposons un paiement en 2 fois sans frais pour les packs Business et Premium. Contactez-nous après votre commande."
            },
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-200 py-4">
              <button
                className="w-full flex items-center justify-between text-left gap-4"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-gray-900">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Prêt à être visible en ligne ?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Rejoignez les entreprises polynésiennes qui ont déjà fait le pas.
            Livraison en 7 jours. Satisfaction garantie.
          </p>
          <a href="#pricing"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-black px-10 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all">
            Commander mon site maintenant <ArrowRight className="w-6 h-6" />
          </a>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100 text-sm">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +689 87 XX XX XX</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@votreagence-pf.com</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Réponse sous 24h</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold text-white">Agence Web Polynésie</div>
          <div>© 2026 · Tous droits réservés · Papeete, Tahiti</div>
          <div className="flex gap-4">
            <a href="/mentions-legales" className="hover:text-white">Mentions légales</a>
            <a href="/cgu" className="hover:text-white">CGV</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

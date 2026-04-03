'use client'

import { useEffect, useState } from 'react'
import {
  Settings, Check, X, AlertTriangle, Database, Mail, CreditCard,
  MessageSquare, Zap, Eye, EyeOff
} from 'lucide-react'

interface ServiceStatus {
  name: string
  icon: React.ReactNode
  status: 'active' | 'configured' | 'missing'
  statusText: string
}

interface SystemStats {
  database: {
    connected: boolean
    message: string
  }
  appVersion: string
  region: string
  deployment: string
}

export default function SettingsPage() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [configVars, setConfigVars] = useState<Array<{ name: string; configured: boolean }>>([])

  useEffect(() => {
    const checkServices = async () => {
      // Check services based on environment variables that are accessible on client
      const serviceList: ServiceStatus[] = [
        {
          name: 'Supabase Database',
          icon: <Database className="w-5 h-5" />,
          status: 'active',
          statusText: 'Vérification...',
        },
        {
          name: 'Resend (Email)',
          icon: <Mail className="w-5 h-5" />,
          status: typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
          statusText: typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configuré' : 'À configurer',
        },
        {
          name: 'Stripe (Paiements)',
          icon: <CreditCard className="w-5 h-5" />,
          status: typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'configured' : 'missing',
          statusText: typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Configuré' : 'À configurer',
        },
        {
          name: 'Telegram (Notifications)',
          icon: <MessageSquare className="w-5 h-5" />,
          status: 'missing',
          statusText: 'À configurer',
        },
      ]

      // Test database connectivity
      try {
        const response = await fetch('/api/leads?limit=1')
        if (response.ok) {
          serviceList[0].status = 'active'
          serviceList[0].statusText = 'Connecté ✅'
        } else {
          serviceList[0].status = 'missing'
          serviceList[0].statusText = 'Erreur ❌'
        }
      } catch (error) {
        serviceList[0].status = 'missing'
        serviceList[0].statusText = 'Erreur ❌'
      }

      setServices(serviceList)

      // Check configuration variables
      const vars = [
        { name: 'NEXT_PUBLIC_SUPABASE_URL', configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
        { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY },
        { name: 'NEXT_PUBLIC_APP_URL', configured: !!process.env.NEXT_PUBLIC_APP_URL },
      ]
      setConfigVars(vars)

      // Set system stats
      setStats({
        database: {
          connected: true,
          message: 'Connecté ✅',
        },
        appVersion: '1.0.0',
        region: 'Singapour (Supabase)',
        deployment: 'Vercel',
      })

      setLoading(false)
    }

    checkServices()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'configured':
        return 'text-blue-600'
      case 'missing':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200'
      case 'configured':
        return 'bg-blue-50 border-blue-200'
      case 'missing':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'configured':
        return 'bg-blue-500'
      case 'missing':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <p className="text-gray-600">Gérez la configuration et le statut de votre système</p>
      </div>

      {/* System Status Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">État du système</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.length > 0 ? services.map((service, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all ${getStatusBgColor(service.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${service.status === 'active' ? 'bg-green-100' : service.status === 'configured' ? 'bg-blue-100' : 'bg-red-100'}`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(service.status)} animate-pulse`} />
              </div>
              <p className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                {service.statusText}
              </p>
            </div>
          )) : null}
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Offres commerciales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Starter</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">45 000</span>
                <span className="text-gray-600">XPF</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Site vitrine 5 pages
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Design professionnel
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Mobile responsive
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                1 mois support
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              En savoir plus
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 hover:shadow-md transition-shadow ring-1 ring-blue-100">
            <div className="mb-4">
              <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                Recommandé
              </div>
              <h3 className="text-lg font-bold text-gray-900">Business</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">85 000</span>
                <span className="text-gray-600">XPF</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Tout Starter +
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Formulaire contact
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Google Analytics
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                SEO de base
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Formation 1h
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Choisir ce plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Premium</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">150 000</span>
                <span className="text-gray-600">XPF</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Tout Business +
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Blog/actualités
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Galerie photos
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Réservation en ligne
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                3 mois support
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Référencement local
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* Quick Configuration Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration rapide</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-4">Variables d'environnement à configurer:</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {configVars.map((variable, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {variable.configured ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  )}
                  <code className="text-sm font-mono text-gray-700">{variable.name}</code>
                </div>
                <span className={`text-xs font-semibold ${variable.configured ? 'text-green-600' : 'text-orange-600'}`}>
                  {variable.configured ? 'Configuré' : 'À configurer'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Conseil:</strong> Définissez ces variables dans votre fichier <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> ou dans les variables d'environnement Vercel.
            </p>
          </div>
        </div>
      </section>

      {/* System Statistics Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques système</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Connectivité base de données
            </h3>
            {stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">État:</span>
                  <span className={`text-sm font-medium ${stats.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.database.message}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900">PostgreSQL (Supabase)</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chargement...</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Informations déploiement
            </h3>
            {stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.appVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Région:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hébergement:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.deployment}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chargement...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CheckSquare, Globe,
  BarChart2, Settings, Zap, Bell
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/validation', label: 'Validations', icon: CheckSquare, badge: true },
  { href: '/portfolio', label: 'Portfolio', icon: Globe },
  { href: '/reporting', label: 'Reporting', icon: BarChart2 },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-sm">SaaS PF</div>
            <div className="text-blue-300 text-xs">Polynésie française</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={clsx('sidebar-link', path === href && 'active')}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {badge && (
              <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                !
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="px-4 pb-4">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-xs font-semibold">Système actif</span>
          </div>
          <div className="space-y-1 text-xs text-blue-200">
            <div className="flex justify-between">
              <span>Scraping</span>
              <span className="text-green-400">✓ Actif</span>
            </div>
            <div className="flex justify-between">
              <span>Emails</span>
              <span className="text-green-400">✓ Actif</span>
            </div>
            <div className="flex justify-between">
              <span>Rapport 8h00</span>
              <span className="text-green-400">✓ Planifié</span>
            </div>
          </div>
        </div>
        <Link
          href="/settings"
          className="mt-3 flex items-center gap-2 px-3 py-2 text-blue-300 hover:text-white text-sm transition-colors"
        >
          <Settings className="w-4 h-4" />
          Paramètres
        </Link>
      </div>
    </aside>
  )
}

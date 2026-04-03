'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CheckSquare, Globe,
  BarChart2, Settings, Waves
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/validation', label: 'Validations', icon: CheckSquare, badge: true },
  { href: '/portfolio', label: 'Portfolio', icon: Globe },
  { href: '/reporting', label: 'Reporting', icon: BarChart2 },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #091540 0%, #0f2050 60%, #162d68 100%)' }}
    >
      {/* Subtle wave decoration */}
      <svg className="absolute bottom-0 left-0 right-0 opacity-[0.07] pointer-events-none" viewBox="0 0 256 80" preserveAspectRatio="none">
        <path d="M0,40 C40,10 80,70 128,40 C176,10 216,70 256,40 L256,80 L0,80 Z" fill="#00d4cc"/>
        <path d="M0,55 C50,25 100,80 160,50 C210,25 240,70 256,55 L256,80 L0,80 Z" fill="#00d4cc" opacity="0.5"/>
      </svg>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4cc, #00a8a4)', boxShadow: '0 0 16px rgba(0,212,204,0.35)' }}>
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: 'Syne, system-ui' }}>SaaS Polynésie</div>
            <div className="text-xs" style={{ color: 'rgba(0,212,204,0.7)' }}>Papeete · Tahiti</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 relative">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Navigation</p>
        {NAV.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={clsx('sidebar-link', path === href && 'active')}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {badge && (
              <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,87,51,0.85)', color: 'white' }}>
                !
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* System status */}
      <div className="px-3 pb-5 relative">
        <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,204,0.08)', border: '1px solid rgba(0,212,204,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            <span className="text-xs font-semibold" style={{ color: '#00d4cc' }}>Système opérationnel</span>
          </div>
          <div className="space-y-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {[['Scraping', true], ['Emails seq.', true], ['Cron 8h/20h', true]].map(([label, ok]) => (
              <div key={String(label)} className="flex justify-between items-center">
                <span>{String(label)}</span>
                <span style={{ color: ok ? '#34d399' : '#f87171' }}>{ok ? '● Actif' : '○ Inactif'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

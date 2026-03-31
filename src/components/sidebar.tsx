'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  user: { fullName: string; role: string }
}

const mainNavItems = [
  { label: 'Pipeline', icon: '\u25aa', href: '/dashboard' },
  { label: 'My Loans', icon: '\ud83d\udcc4', href: '/dashboard' },
  { label: 'Alerts', icon: '\ud83d\udd14', href: '/dashboard', badge: '3' },
]

const viewNavItems = [
  { label: 'Analytics', icon: '\ud83d\udcca', href: '#' },
  { label: 'Settings', icon: '\u2699', href: '#' },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Brand */}
      <div className="flex h-[57px] items-center px-5 border-b border-zinc-800">
        <span className="text-lg font-bold text-zinc-100">LoanFlow</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* MAIN section */}
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Main
        </p>
        <ul className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = item.label === 'Pipeline' && pathname === '/dashboard'
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* VIEWS section */}
        <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Views
        </p>
        <ul className="space-y-0.5">
          {viewNavItems.map((item) => (
            <li key={item.label}>
              <span className="flex cursor-default items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-400">
                <span className="w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <p className="truncate text-sm text-zinc-300">{user.fullName}</p>
        <p className="truncate text-xs text-zinc-500">{user.role}</p>
      </div>
    </aside>
  )
}

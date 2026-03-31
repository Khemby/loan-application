'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps {
  user: { fullName: string; role: string; email: string }
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-[57px] w-full shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5">
      {/* Left: Search */}
      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="Search loans, borrowers..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Right: Live indicator, bell, avatar */}
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-zinc-500">Live</span>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <span className="cursor-default text-lg" role="img" aria-label="Notifications">
            {'\ud83d\udd14'}
          </span>
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            3
          </span>
        </div>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {getInitials(user.fullName)}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-md border border-zinc-700 bg-zinc-800 py-2 shadow-xl">
              <div className="border-b border-zinc-700 px-4 pb-2">
                <p className="text-sm font-medium text-zinc-100">{user.fullName}</p>
                <p className="text-xs text-zinc-400">{user.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-1 w-full px-4 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

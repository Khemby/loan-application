'use client'

import { useRouter } from 'next/navigation'
import { formatCurrency, getDaysInStage, getUrgencyLevel } from '@/lib/utils'
import type { LoanWithOfficer } from '@/lib/types'

const urgencyColors: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export function LoanCard({ loan }: { loan: LoanWithOfficer }) {
  const router = useRouter()
  const urgency = getUrgencyLevel(loan.stage, new Date(loan.stageEnteredAt))
  const days = getDaysInStage(new Date(loan.stageEnteredAt))
  const borrowerName = `${loan.borrowerFirstName} ${loan.borrowerLastName}`

  const initials = loan.loanOfficer.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      onClick={() => router.push(`/dashboard/loans/${loan.id}`)}
      className="cursor-grab rounded-md border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700 active:cursor-grabbing"
    >
      {/* Top row: borrower name + urgency dot */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-100 truncate">
          {borrowerName}
        </span>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${urgencyColors[urgency]}`}
        />
      </div>

      {/* Amount */}
      <p className="mt-1 font-mono text-lg font-bold text-zinc-50">
        {formatCurrency(Number(loan.loanAmount))}
      </p>

      {/* Bottom row: days in stage + loan officer */}
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span>{days}d</span>
        <div className="ml-auto flex items-center gap-1.5">
          {loan.loanOfficer.avatarUrl ? (
            <img
              src={loan.loanOfficer.avatarUrl}
              alt={loan.loanOfficer.fullName}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
              {initials}
            </div>
          )}
          <span className="truncate">{loan.loanOfficer.fullName}</span>
        </div>
      </div>

      {/* Loan type label */}
      <div className="mt-2 border-t border-zinc-800 pt-2">
        <span className="text-[11px] text-zinc-500">
          {loan.loanType.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}

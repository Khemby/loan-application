import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency, getRelativeTime } from '@/lib/utils'
import { LoanDetailClient } from './loan-detail-client'

const STAGES = ['LEAD', 'APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSED'] as const

const stageLabels: Record<string, string> = {
  LEAD: 'Lead',
  APPLICATION: 'Application',
  PROCESSING: 'Processing',
  UNDERWRITING: 'Underwriting',
  APPROVED: 'Approved',
  CLOSED: 'Closed',
}

const stageBadgeColors: Record<string, string> = {
  LEAD: 'bg-zinc-700 text-zinc-200',
  APPLICATION: 'bg-blue-900 text-blue-200',
  PROCESSING: 'bg-yellow-900 text-yellow-200',
  UNDERWRITING: 'bg-purple-900 text-purple-200',
  APPROVED: 'bg-green-900 text-green-200',
  CLOSED: 'bg-zinc-600 text-zinc-300',
}

const actionBadgeColors: Record<string, string> = {
  STAGE_CHANGE: 'bg-blue-900 text-blue-300',
  NOTE_ADDED: 'bg-yellow-900 text-yellow-300',
  LOAN_CREATED: 'bg-green-900 text-green-300',
  LOAN_UPDATED: 'bg-purple-900 text-purple-300',
}

const loanTermLabels: Record<string, string> = {
  FIFTEEN_YEAR: '15 Year',
  THIRTY_YEAR: '30 Year',
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      loanOfficer: true,
      activities: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!loan) {
    notFound()
  }

  const borrowerName = `${loan.borrowerFirstName} ${loan.borrowerLastName}`
  const currentStageIndex = STAGES.indexOf(loan.stage)

  // Serialize loan data for the client component (Decimal -> number, Date -> string)
  const serializedLoan = {
    id: loan.id,
    borrowerFirstName: loan.borrowerFirstName,
    borrowerLastName: loan.borrowerLastName,
    borrowerEmail: loan.borrowerEmail,
    borrowerPhone: loan.borrowerPhone,
    loanAmount: Number(loan.loanAmount),
    loanType: loan.loanType,
    loanTerm: loan.loanTerm,
    propertyAddress: loan.propertyAddress,
    propertyCity: loan.propertyCity,
    propertyState: loan.propertyState,
    propertyZip: loan.propertyZip,
    loanOfficerId: loan.loanOfficerId,
    notes: loan.notes,
    stage: loan.stage,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          &larr; Back to Pipeline
        </Link>
        <div className="flex-1" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">{borrowerName}</h1>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-medium ${stageBadgeColors[loan.stage]}`}
        >
          {stageLabels[loan.stage]}
        </span>
      </div>

      {/* Stage progress bar */}
      <div className="mb-8 flex items-center gap-1">
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentStageIndex
          const isCurrent = i === currentStageIndex
          return (
            <div key={stage} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full border-2 ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-500'
                      : isCompleted
                        ? 'border-blue-500 bg-blue-500/50'
                        : 'border-zinc-700 bg-zinc-800'
                  }`}
                />
                <span className={`mt-1 text-[10px] ${isCurrent ? 'text-blue-400 font-medium' : 'text-zinc-500'}`}>
                  {stageLabels[stage]}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-12 ${
                    i < currentStageIndex ? 'bg-blue-500/50' : 'bg-zinc-700'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Loan detail client section (handles inline editing and notes) */}
      <LoanDetailClient loan={serializedLoan} />

      {/* Loan terms (read-only summary below editable section) */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Loan Terms</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">Amount</p>
            <p className="text-sm text-zinc-200 font-medium">
              {formatCurrency(Number(loan.loanAmount))}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Type</p>
            <p className="text-sm text-zinc-200">{loan.loanType.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Term</p>
            <p className="text-sm text-zinc-200">{loanTermLabels[loan.loanTerm]}</p>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Activity</h2>
        {loan.activities.length === 0 ? (
          <p className="text-sm text-zinc-500">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {loan.activities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-zinc-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${actionBadgeColors[activity.action] ?? 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {activity.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {activity.user.fullName}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {getRelativeTime(new Date(activity.createdAt))}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-300 break-words">
                    {activity.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

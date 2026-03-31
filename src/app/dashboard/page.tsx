import { prisma } from '@/lib/prisma'
import { getUrgencyLevel } from '@/lib/utils'
import { PipelineBoard } from '@/components/pipeline-board'
import type { LoanWithOfficer } from '@/lib/types'

const STAGES = ['LEAD', 'APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSED'] as const

export default async function DashboardPage() {
  const results = await Promise.all(
    STAGES.map((stage) =>
      prisma.loan.findMany({
        where: { stage },
        include: {
          loanOfficer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { stageEnteredAt: 'asc' },
        take: 50,
      })
    )
  )

  const [leads, applications, processing, underwriting, approved, closed] = results

  const loansByStage: Record<string, LoanWithOfficer[]> = {
    LEAD: leads as LoanWithOfficer[],
    APPLICATION: applications as LoanWithOfficer[],
    PROCESSING: processing as LoanWithOfficer[],
    UNDERWRITING: underwriting as LoanWithOfficer[],
    APPROVED: approved as LoanWithOfficer[],
    CLOSED: closed as LoanWithOfficer[],
  }

  // Compute stats
  const allLoans = results.flat()
  const activeLoans = allLoans.filter((l) => l.stage !== 'CLOSED')
  const totalActive = activeLoans.length
  const totalValue = allLoans.reduce(
    (sum, l) => sum + Number(l.loanAmount),
    0
  )
  const overdueCount = allLoans.filter(
    (l) => getUrgencyLevel(l.stage, l.stageEnteredAt) === 'red'
  ).length

  return (
    <PipelineBoard
      initialLoans={loansByStage}
      stats={{ totalActive, totalValue, overdueCount }}
    />
  )
}

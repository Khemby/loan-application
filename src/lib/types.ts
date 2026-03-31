import type { Loan } from '@prisma/client'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type LoanWithOfficer = Loan & {
  loanOfficer: { id: string; fullName: string; avatarUrl: string | null }
}

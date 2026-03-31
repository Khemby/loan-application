import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import {
  updateLoanStage,
  createLoan,
  updateLoan,
  addNote,
} from '@/actions/loan-actions'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/prisma', () => ({
  prisma: {
    loan: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
    loanActivity: { create: vi.fn() },
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

const OFFICER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const OTHER_OFFICER_ID = 'f9e8d7c6-b5a4-3210-fedc-ba9876543210'
const LOAN_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

function mockAuthenticatedUser(userId: string, role: 'ADMIN' | 'LOAN_OFFICER') {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
  }
  vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  vi.mocked(prisma.user.findUnique).mockResolvedValue({
    id: userId,
    role,
    fullName: 'Test User',
    email: 'test@test.com',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any)
}

function mockUnauthenticated() {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  }
  vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
}

const stageEnteredAt = new Date('2025-01-15T00:00:00.000Z')

const mockLoan = {
  id: LOAN_ID,
  borrowerFirstName: 'John',
  borrowerLastName: 'Doe',
  borrowerEmail: 'john@example.com',
  borrowerPhone: '555-0100',
  loanAmount: 350000,
  loanType: 'CONVENTIONAL',
  loanTerm: 'THIRTY_YEAR',
  propertyAddress: '123 Main St',
  propertyCity: 'Austin',
  propertyState: 'TX',
  propertyZip: '78701',
  stage: 'LEAD',
  stageEnteredAt,
  loanOfficerId: OFFICER_ID,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── updateLoanStage ──────────────────────────────────────────────────────────

describe('updateLoanStage', () => {
  it('S1: valid stage change → updates loan + creates activity → success', async () => {
    mockAuthenticatedUser(OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan as any)
    vi.mocked(prisma.loan.update).mockResolvedValue({ ...mockLoan, stage: 'APPLICATION' } as any)
    vi.mocked(prisma.loanActivity.create).mockResolvedValue({} as any)

    const result = await updateLoanStage({
      loanId: LOAN_ID,
      newStage: 'APPLICATION',
      stageEnteredAt: stageEnteredAt.toISOString(),
    })

    expect(result.success).toBe(true)
    expect(prisma.loan.update).toHaveBeenCalled()
    expect(prisma.loanActivity.create).toHaveBeenCalled()
  })

  it('S2: invalid Zod input → { success: false }', async () => {
    const result = await updateLoanStage({ loanId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('S3: unauthorized (LO updating another LO loan) → error', async () => {
    mockAuthenticatedUser(OTHER_OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan as any)

    const result = await updateLoanStage({
      loanId: LOAN_ID,
      newStage: 'APPLICATION',
      stageEnteredAt: stageEnteredAt.toISOString(),
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Not authorized')
  })

  it('S4: stale stageEnteredAt (conflict) → error', async () => {
    mockAuthenticatedUser(OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan as any)

    const result = await updateLoanStage({
      loanId: LOAN_ID,
      newStage: 'APPLICATION',
      stageEnteredAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('refresh')
  })

  it('S5: loan not found → error', async () => {
    mockAuthenticatedUser(OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(null)

    const result = await updateLoanStage({
      loanId: LOAN_ID,
      newStage: 'APPLICATION',
      stageEnteredAt: stageEnteredAt.toISOString(),
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Loan not found')
  })
})

// ── createLoan ───────────────────────────────────────────────────────────────

describe('createLoan', () => {
  const validInput = {
    borrowerFirstName: 'John',
    borrowerLastName: 'Doe',
    borrowerEmail: 'john@example.com',
    borrowerPhone: '555-0100',
    loanAmount: 350000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '123 Main St',
    propertyCity: 'Austin',
    propertyState: 'TX',
    propertyZip: '78701',
    loanOfficerId: OFFICER_ID,
  }

  it('S6: valid input → creates loan + activity → success', async () => {
    mockAuthenticatedUser(OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.create).mockResolvedValue({ ...mockLoan, id: 'new-id' } as any)
    vi.mocked(prisma.loanActivity.create).mockResolvedValue({} as any)

    const result = await createLoan(validInput)

    expect(result.success).toBe(true)
    expect(prisma.loan.create).toHaveBeenCalled()
    expect(prisma.loanActivity.create).toHaveBeenCalled()
  })

  it('S7: invalid Zod input → { success: false }', async () => {
    const result = await createLoan({ borrowerFirstName: '' })
    expect(result.success).toBe(false)
  })

  it('S8: unauthenticated → error', async () => {
    mockUnauthenticated()

    const result = await createLoan(validInput)

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Not authenticated')
  })
})

// ── updateLoan ───────────────────────────────────────────────────────────────

describe('updateLoan', () => {
  it('S9: valid update → success', async () => {
    mockAuthenticatedUser(OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan as any)
    vi.mocked(prisma.loan.update).mockResolvedValue({ ...mockLoan, notes: 'Updated' } as any)
    vi.mocked(prisma.loanActivity.create).mockResolvedValue({} as any)

    const result = await updateLoan({
      id: LOAN_ID,
      notes: 'Updated',
    })

    expect(result.success).toBe(true)
    expect(prisma.loan.update).toHaveBeenCalled()
  })

  it('S10: invalid Zod input → error', async () => {
    const result = await updateLoan({ id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('S11: unauthorized → error', async () => {
    mockAuthenticatedUser(OTHER_OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan as any)

    const result = await updateLoan({
      id: LOAN_ID,
      notes: 'Updated',
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Not authorized')
  })
})

// ── addNote ──────────────────────────────────────────────────────────────────

describe('addNote', () => {
  it('S12: valid note → creates activity → success', async () => {
    mockAuthenticatedUser(OFFICER_ID, 'LOAN_OFFICER')
    vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan as any)
    vi.mocked(prisma.loan.update).mockResolvedValue({ ...mockLoan, notes: 'A note' } as any)
    vi.mocked(prisma.loanActivity.create).mockResolvedValue({} as any)

    const result = await addNote(LOAN_ID, 'A note')

    expect(result.success).toBe(true)
    expect(prisma.loanActivity.create).toHaveBeenCalled()
  })

  it('S13: empty note → error', async () => {
    const result = await addNote(LOAN_ID, '')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Note is required')
  })
})

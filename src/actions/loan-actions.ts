'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import {
  createLoanSchema,
  updateLoanSchema,
  updateLoanStageSchema,
} from '@/lib/validations/loan'
import type { ActionResult } from '@/lib/types'
import type { ActivityAction, Loan, LoanStage } from '@prisma/client'

// ── Helper: create a LoanActivity record ──────────────────────────────────

async function createActivity(params: {
  loanId: string
  userId: string
  action: ActivityAction
  description: string
  fromStage?: LoanStage
  toStage?: LoanStage
}) {
  await prisma.loanActivity.create({
    data: {
      loanId: params.loanId,
      userId: params.userId,
      action: params.action,
      description: params.description,
      fromStage: params.fromStage,
      toStage: params.toStage,
    },
  })
}

// ── Server Action: updateLoanStage ────────────────────────────────────────

export async function updateLoanStage(
  input: unknown,
): Promise<ActionResult<Loan>> {
  const parsed = updateLoanStageSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { loanId, newStage, stageEnteredAt } = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const profile = await prisma.user.findUnique({ where: { id: user.id } })
    if (!profile) {
      return { success: false, error: 'Not authenticated' }
    }

    const loan = await prisma.loan.findUnique({ where: { id: loanId } })
    if (!loan) {
      return { success: false, error: 'Loan not found' }
    }

    // Conflict check: compare stageEnteredAt
    if (loan.stageEnteredAt.toISOString() !== stageEnteredAt) {
      return {
        success: false,
        error:
          'This loan was just moved by another user. Please refresh.',
      }
    }

    // Auth check: LOAN_OFFICER can only move their own loans
    if (profile.role === 'LOAN_OFFICER' && loan.loanOfficerId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    const fromStage = loan.stage

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        stage: newStage,
        stageEnteredAt: new Date(),
      },
    })

    await createActivity({
      loanId,
      userId: user.id,
      action: 'STAGE_CHANGE',
      description: `Stage changed from ${fromStage} to ${newStage}`,
      fromStage,
      toStage: newStage,
    })

    revalidatePath('/dashboard')

    return { success: true, data: updatedLoan }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ── Server Action: createLoan ─────────────────────────────────────────────

export async function createLoan(
  input: unknown,
): Promise<ActionResult<Loan>> {
  const parsed = createLoanSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const newLoan = await prisma.loan.create({
      data: {
        ...parsed.data,
        stage: 'LEAD',
        stageEnteredAt: new Date(),
      },
    })

    await createActivity({
      loanId: newLoan.id,
      userId: user.id,
      action: 'LOAN_CREATED',
      description: 'Loan created',
    })

    revalidatePath('/dashboard')

    return { success: true, data: newLoan }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ── Server Action: updateLoan ─────────────────────────────────────────────

export async function updateLoan(
  input: unknown,
): Promise<ActionResult<Loan>> {
  const parsed = updateLoanSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { id, ...updates } = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const profile = await prisma.user.findUnique({ where: { id: user.id } })
    if (!profile) {
      return { success: false, error: 'Not authenticated' }
    }

    const loan = await prisma.loan.findUnique({ where: { id } })
    if (!loan) {
      return { success: false, error: 'Loan not found' }
    }

    // Auth check: LOAN_OFFICER can only update their own loans
    if (profile.role === 'LOAN_OFFICER' && loan.loanOfficerId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: updates,
    })

    await createActivity({
      loanId: id,
      userId: user.id,
      action: 'LOAN_UPDATED',
      description: 'Loan details updated',
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/loans/${id}`)

    return { success: true, data: updatedLoan }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ── Server Action: addNote ────────────────────────────────────────────────

export async function addNote(
  loanId: string,
  note: string,
): Promise<ActionResult<undefined>> {
  if (!loanId || typeof loanId !== 'string') {
    return { success: false, error: 'Loan ID is required' }
  }
  if (!note || typeof note !== 'string') {
    return { success: false, error: 'Note is required' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const profile = await prisma.user.findUnique({ where: { id: user.id } })
    if (!profile) {
      return { success: false, error: 'Not authenticated' }
    }

    const loan = await prisma.loan.findUnique({ where: { id: loanId } })
    if (!loan) {
      return { success: false, error: 'Loan not found' }
    }

    // Auth check: LOAN_OFFICER can only add notes to their own loans
    if (profile.role === 'LOAN_OFFICER' && loan.loanOfficerId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    const existingNotes = loan.notes ?? ''
    const updatedNotes = existingNotes
      ? `${existingNotes}\n${note}`
      : note

    await prisma.loan.update({
      where: { id: loanId },
      data: { notes: updatedNotes },
    })

    await createActivity({
      loanId,
      userId: user.id,
      action: 'NOTE_ADDED',
      description: note,
    })

    revalidatePath(`/dashboard/loans/${loanId}`)

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

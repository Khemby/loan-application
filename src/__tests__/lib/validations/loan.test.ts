import { describe, it, expect } from 'vitest'
import {
  createLoanSchema,
  updateLoanStageSchema,
  updateLoanSchema,
} from '@/lib/validations/loan'

const validLoanInput = {
  borrowerFirstName: 'John',
  borrowerLastName: 'Doe',
  borrowerEmail: 'john@example.com',
  borrowerPhone: '555-0100',
  loanAmount: 350000,
  loanType: 'CONVENTIONAL' as const,
  loanTerm: 'THIRTY_YEAR' as const,
  propertyAddress: '123 Main St',
  propertyCity: 'Austin',
  propertyState: 'TX',
  propertyZip: '78701',
  loanOfficerId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
}

describe('createLoanSchema', () => {
  it('Z1: valid input passes', () => {
    const result = createLoanSchema.safeParse(validLoanInput)
    expect(result.success).toBe(true)
  })

  it('Z2: missing required fields fails with specific errors', () => {
    const result = createLoanSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('borrowerFirstName')
      expect(paths).toContain('borrowerLastName')
      expect(paths).toContain('borrowerEmail')
    }
  })

  it('Z3: negative loan amount fails', () => {
    const result = createLoanSchema.safeParse({
      ...validLoanInput,
      loanAmount: -1000,
    })
    expect(result.success).toBe(false)
  })
})

describe('updateLoanStageSchema', () => {
  it('Z4: valid loanId + stage + stageEnteredAt passes', () => {
    const result = updateLoanStageSchema.safeParse({
      loanId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      newStage: 'PROCESSING',
      stageEnteredAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('Z5: invalid stage enum value fails', () => {
    const result = updateLoanStageSchema.safeParse({
      loanId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      newStage: 'INVALID_STAGE',
      stageEnteredAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })
})

describe('updateLoanSchema', () => {
  it('Z6: valid partial update (just notes) passes', () => {
    const result = updateLoanSchema.safeParse({
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      notes: 'Updated borrower info',
    })
    expect(result.success).toBe(true)
  })

  it('Z7: invalid field types fail', () => {
    const result = updateLoanSchema.safeParse({
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      loanAmount: 'not-a-number',
    })
    expect(result.success).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { getUrgencyLevel, formatCurrency, getDaysInStage } from '@/lib/utils'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

describe('getUrgencyLevel', () => {
  it('U1: Lead stage, 2 days → green', () => {
    expect(getUrgencyLevel('LEAD', daysAgo(2))).toBe('green')
  })

  it('U2: Application stage, 5 days → yellow', () => {
    expect(getUrgencyLevel('APPLICATION', daysAgo(5))).toBe('yellow')
  })

  it('U3: Processing stage, 14 days → red', () => {
    expect(getUrgencyLevel('PROCESSING', daysAgo(14))).toBe('red')
  })

  it('U4: Approved stage → always green (even with many days)', () => {
    expect(getUrgencyLevel('APPROVED', daysAgo(100))).toBe('green')
  })

  it('U5: Closed stage → always green', () => {
    expect(getUrgencyLevel('CLOSED', daysAgo(100))).toBe('green')
  })
})

describe('formatCurrency', () => {
  it('U6: 425000 → $425,000', () => {
    expect(formatCurrency(425000)).toBe('$425,000')
  })

  it('U7: 0 → $0', () => {
    expect(formatCurrency(0)).toBe('$0')
  })
})

describe('getDaysInStage', () => {
  it('U8: stageEnteredAt = today → 0', () => {
    expect(getDaysInStage(new Date())).toBe(0)
  })

  it('U9: stageEnteredAt = 5 days ago → 5', () => {
    expect(getDaysInStage(daysAgo(5))).toBe(5)
  })
})

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createLoanSchema } from '@/lib/validations/loan'
import { createLoan } from '@/actions/loan-actions'

const LOAN_TYPE_OPTIONS = [
  { label: 'Conventional', value: 'CONVENTIONAL' },
  { label: 'FHA', value: 'FHA' },
  { label: 'VA', value: 'VA' },
  { label: 'Jumbo', value: 'JUMBO' },
  { label: 'USDA', value: 'USDA' },
] as const

const LOAN_TERM_OPTIONS = [
  { label: '15 Year', value: 'FIFTEEN_YEAR' },
  { label: '30 Year', value: 'THIRTY_YEAR' },
] as const

export default function NewLoanPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [amount, setAmount] = useState('')
  const [loanType, setLoanType] = useState('CONVENTIONAL')
  const [loanTerm, setLoanTerm] = useState('THIRTY_YEAR')
  const [loanOfficerId, setLoanOfficerId] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const formData = {
      borrowerFirstName: firstName,
      borrowerLastName: lastName,
      borrowerEmail: email,
      borrowerPhone: phone,
      propertyAddress: address,
      propertyCity: city,
      propertyState: state,
      propertyZip: zip,
      loanAmount: parseFloat(amount) || 0,
      loanType,
      loanTerm,
      loanOfficerId,
      notes: notes || undefined,
    }

    // Client-side validation
    const parsed = createLoanSchema.safeParse(formData)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString()
        if (key && !errors[key]) {
          errors[key] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    startTransition(async () => {
      const result = await createLoan(parsed.data)
      if (result.success) {
        router.push(`/dashboard/loans/${result.data.id}`)
      } else {
        setError(result.error)
      }
    })
  }

  const inputClass =
    'w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  const selectClass =
    'w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  function FieldError({ field }: { field: string }) {
    const msg = fieldErrors[field]
    if (!msg) return null
    return <p className="mt-1 text-xs text-red-400">{msg}</p>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          &larr; Back to Pipeline
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-zinc-100 mb-8">New Loan</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Borrower Information */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Borrower Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">First Name *</label>
              <input
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              <FieldError field="borrowerFirstName" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Last Name *</label>
              <input
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
              />
              <FieldError field="borrowerLastName" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Email *</label>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <FieldError field="borrowerEmail" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Phone</label>
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
              <FieldError field="borrowerPhone" />
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Property Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Address *</label>
              <input
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
              />
              <FieldError field="propertyAddress" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">City *</label>
                <input
                  className={inputClass}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Austin"
                />
                <FieldError field="propertyCity" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">State *</label>
                <input
                  className={inputClass}
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="TX"
                />
                <FieldError field="propertyState" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">ZIP *</label>
                <input
                  className={inputClass}
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="78701"
                />
                <FieldError field="propertyZip" />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Loan Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Amount *</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="425000"
              />
              <FieldError field="loanAmount" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Type *</label>
              <select
                className={selectClass}
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              >
                {LOAN_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError field="loanType" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Term *</label>
              <select
                className={selectClass}
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              >
                {LOAN_TERM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError field="loanTerm" />
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Assignment</h2>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Loan Officer ID *</label>
            <input
              className={inputClass}
              value={loanOfficerId}
              onChange={(e) => setLoanOfficerId(e.target.value)}
              placeholder="UUID of assigned loan officer"
            />
            <FieldError field="loanOfficerId" />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Notes</h2>
          <textarea
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this loan..."
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md border border-red-800 bg-red-950 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Creating...' : 'Create Loan'}
          </button>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-700 px-5 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

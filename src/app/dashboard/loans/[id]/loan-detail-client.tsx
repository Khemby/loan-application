'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateLoan, addNote } from '@/actions/loan-actions'

interface SerializedLoan {
  id: string
  borrowerFirstName: string
  borrowerLastName: string
  borrowerEmail: string
  borrowerPhone: string
  loanAmount: number
  loanType: string
  loanTerm: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  loanOfficerId: string
  notes: string | null
  stage: string
}

export function LoanDetailClient({ loan }: { loan: SerializedLoan }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Editable fields
  const [firstName, setFirstName] = useState(loan.borrowerFirstName)
  const [lastName, setLastName] = useState(loan.borrowerLastName)
  const [email, setEmail] = useState(loan.borrowerEmail)
  const [phone, setPhone] = useState(loan.borrowerPhone)
  const [address, setAddress] = useState(loan.propertyAddress)
  const [city, setCity] = useState(loan.propertyCity)
  const [state, setState] = useState(loan.propertyState)
  const [zip, setZip] = useState(loan.propertyZip)

  // Notes
  const [noteText, setNoteText] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [isAddingNote, startNoteTransition] = useTransition()

  function handleCancel() {
    setFirstName(loan.borrowerFirstName)
    setLastName(loan.borrowerLastName)
    setEmail(loan.borrowerEmail)
    setPhone(loan.borrowerPhone)
    setAddress(loan.propertyAddress)
    setCity(loan.propertyCity)
    setState(loan.propertyState)
    setZip(loan.propertyZip)
    setIsEditing(false)
    setError(null)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateLoan({
        id: loan.id,
        borrowerFirstName: firstName,
        borrowerLastName: lastName,
        borrowerEmail: email,
        borrowerPhone: phone,
        propertyAddress: address,
        propertyCity: city,
        propertyState: state,
        propertyZip: zip,
      })

      if (result.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  function handleAddNote() {
    if (!noteText.trim()) return
    setNoteError(null)
    startNoteTransition(async () => {
      const result = await addNote(loan.id, noteText.trim())
      if (result.success) {
        setNoteText('')
        router.refresh()
      } else {
        setNoteError(result.error)
      }
    })
  }

  const inputClass =
    'w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <>
      {/* Borrower + Property info grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Borrower Info */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Borrower Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">First Name</label>
                  <input
                    className={inputClass}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Last Name</label>
                  <input
                    className={inputClass}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Email</label>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                <input
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-zinc-500">Name</p>
                <p className="text-sm text-zinc-200">
                  {loan.borrowerFirstName} {loan.borrowerLastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm text-zinc-200">{loan.borrowerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="text-sm text-zinc-200">{loan.borrowerPhone || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Property Information</h2>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Address</label>
                <input
                  className={inputClass}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">City</label>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">State</label>
                  <input
                    className={inputClass}
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">ZIP</label>
                  <input
                    className={inputClass}
                    maxLength={5}
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-zinc-500">Address</p>
                <p className="text-sm text-zinc-200">{loan.propertyAddress}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">City / State / ZIP</p>
                <p className="text-sm text-zinc-200">
                  {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit action buttons */}
      {isEditing && (
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}

      {/* Notes section */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Notes</h2>
        {loan.notes ? (
          <pre className="mb-4 whitespace-pre-wrap text-sm text-zinc-300 font-sans">
            {loan.notes}
          </pre>
        ) : (
          <p className="mb-4 text-sm text-zinc-500">No notes yet.</p>
        )}

        <div className="space-y-2">
          <textarea
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Add a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          {noteError && <p className="text-sm text-red-400">{noteError}</p>}
          <button
            onClick={handleAddNote}
            disabled={isAddingNote || !noteText.trim()}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>
    </>
  )
}

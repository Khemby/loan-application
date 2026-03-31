'use client'

export default function LoanError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold text-zinc-100">Something went wrong</h2>
      <p className="mt-2 text-zinc-400">
        {error.message || 'An unexpected error occurred while loading this loan.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

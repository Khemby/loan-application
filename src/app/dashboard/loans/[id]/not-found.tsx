import Link from 'next/link'

export default function LoanNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold text-zinc-100">Loan not found</h2>
      <p className="mt-2 text-zinc-400">
        The loan you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
      >
        Back to Pipeline
      </Link>
    </div>
  )
}

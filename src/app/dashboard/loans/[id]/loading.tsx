export default function LoanDetailLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-6 w-24 rounded-full bg-zinc-800" />
      </div>

      {/* Stage progress skeleton */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            {i < 5 && <div className="h-0.5 w-12 bg-zinc-800" />}
          </div>
        ))}
      </div>

      {/* Details grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="h-5 w-32 rounded bg-zinc-800 mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-zinc-800" />
            <div className="h-4 w-3/4 rounded bg-zinc-800" />
            <div className="h-4 w-1/2 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="h-5 w-32 rounded bg-zinc-800 mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-zinc-800" />
            <div className="h-4 w-3/4 rounded bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Notes skeleton */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 mb-8">
        <div className="h-5 w-16 rounded bg-zinc-800 mb-4" />
        <div className="h-20 w-full rounded bg-zinc-800" />
      </div>
    </div>
  )
}

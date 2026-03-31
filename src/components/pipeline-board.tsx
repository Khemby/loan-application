'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { updateLoanStage } from '@/actions/loan-actions'
import { formatCurrency } from '@/lib/utils'
import { LoanCard } from '@/components/loan-card'
import type { LoanWithOfficer } from '@/lib/types'

// ── Constants ────────────────────────────────────────────────────────────────

const STAGES = ['LEAD', 'APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSED'] as const

const STAGE_COLORS: Record<string, string> = {
  LEAD: 'border-t-indigo-500',
  APPLICATION: 'border-t-blue-500',
  PROCESSING: 'border-t-amber-500',
  UNDERWRITING: 'border-t-red-500',
  APPROVED: 'border-t-green-500',
  CLOSED: 'border-t-purple-500',
}

// ── Draggable card wrapper ───────────────────────────────────────────────────

function DraggableLoanCard({ loan }: { loan: LoanWithOfficer }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: loan.id,
    data: { loan },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-30' : ''}
    >
      <LoanCard loan={loan} />
    </div>
  )
}

// ── Droppable column ─────────────────────────────────────────────────────────

function StageColumn({
  stage,
  loans,
}: {
  stage: string
  loans: LoanWithOfficer[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] flex-col rounded-lg border border-zinc-800 bg-zinc-950 ${STAGE_COLORS[stage]} border-t-2 ${
        isOver ? 'ring-1 ring-zinc-600' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-[13px] font-semibold uppercase text-zinc-300">
          {stage}
        </span>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-700 px-1.5 text-[11px] font-medium text-zinc-300">
          {loans.length}
        </span>
      </div>

      {/* Column body */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {loans.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-600">
            No loans in this stage
          </p>
        ) : (
          loans.map((loan) => (
            <DraggableLoanCard key={loan.id} loan={loan} />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main PipelineBoard component ─────────────────────────────────────────────

interface PipelineBoardProps {
  initialLoans: Record<string, LoanWithOfficer[]>
  stats: { totalActive: number; totalValue: number; overdueCount: number }
}

export function PipelineBoard({ initialLoans, stats }: PipelineBoardProps) {
  const [loans, setLoans] = useState(initialLoans)
  const [activeDragLoan, setActiveDragLoan] = useState<LoanWithOfficer | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('SUBSCRIBED')

  // Track pending optimistic moves to dedup realtime events
  const pendingMovesRef = useRef<Map<string, string>>(new Map())

  // ── Drag handlers ────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const loan = event.active.data.current?.loan as LoanWithOfficer | undefined
    setActiveDragLoan(loan ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragLoan(null)
    const { active, over } = event

    if (!over) return

    const loanId = active.id as string
    const newStage = over.id as string

    // Find current stage of this loan
    let currentStage: string | null = null
    let draggedLoan: LoanWithOfficer | null = null

    for (const stage of STAGES) {
      const found = loans[stage]?.find((l) => l.id === loanId)
      if (found) {
        currentStage = stage
        draggedLoan = found
        break
      }
    }

    if (!currentStage || !draggedLoan || currentStage === newStage) return

    // Mark as pending optimistic move
    pendingMovesRef.current.set(loanId, newStage)

    // Optimistic update
    const prevLoans = { ...loans }
    setLoans((prev) => {
      const updated = { ...prev }
      updated[currentStage] = prev[currentStage].filter((l) => l.id !== loanId)
      updated[newStage] = [
        ...prev[newStage],
        { ...draggedLoan, stage: newStage as LoanWithOfficer['stage'], stageEnteredAt: new Date() },
      ]
      return updated
    })

    // Call server action
    const result = await updateLoanStage({
      loanId,
      newStage,
      stageEnteredAt: draggedLoan.stageEnteredAt instanceof Date
        ? draggedLoan.stageEnteredAt.toISOString()
        : new Date(draggedLoan.stageEnteredAt).toISOString(),
    })

    // Clear pending move
    pendingMovesRef.current.delete(loanId)

    if (!result.success) {
      // Rollback
      setLoans(prevLoans)
      alert(result.error)
    }
  }

  // ── Realtime subscription ────────────────────────────────────────────────

  const handleRealtimeChange = useCallback(
    (payload: { eventType: string; new?: Record<string, unknown>; old?: Record<string, unknown> }) => {
      if (payload.eventType === 'INSERT') {
        const newLoan = payload.new as unknown as LoanWithOfficer
        if (!newLoan?.stage) return
        setLoans((prev) => {
          const stage = newLoan.stage as string
          if (!prev[stage]) return prev
          // Avoid duplicates
          if (prev[stage].some((l) => l.id === newLoan.id)) return prev
          return { ...prev, [stage]: [...prev[stage], newLoan] }
        })
      }

      if (payload.eventType === 'UPDATE') {
        const updated = payload.new as unknown as LoanWithOfficer
        if (!updated?.id) return

        // Dedup: if this was our own optimistic move, skip
        const pendingStage = pendingMovesRef.current.get(updated.id)
        if (pendingStage && pendingStage === (updated.stage as string)) {
          return
        }

        setLoans((prev) => {
          const next = { ...prev }
          // Remove from all stages
          for (const stage of STAGES) {
            next[stage] = prev[stage].filter((l) => l.id !== updated.id)
          }
          // Add to correct stage
          const targetStage = updated.stage as string
          if (next[targetStage]) {
            next[targetStage] = [...next[targetStage], updated]
          }
          return next
        })
      }

      if (payload.eventType === 'DELETE') {
        const old = payload.old as { id?: string }
        if (!old?.id) return
        setLoans((prev) => {
          const next = { ...prev }
          for (const stage of STAGES) {
            next[stage] = prev[stage].filter((l) => l.id !== old.id)
          }
          return next
        })
      }
    },
    []
  )

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('loans-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' } as const,
        (payload: unknown) => {
          handleRealtimeChange(payload as { eventType: string; new?: Record<string, unknown>; old?: Record<string, unknown> })
        }
      )
      .subscribe((status: string) => {
        setConnectionStatus(status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [handleRealtimeChange])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* Connection banner */}
      {connectionStatus !== 'SUBSCRIBED' && (
        <div className="bg-yellow-900/50 px-4 py-2 text-center text-sm text-yellow-200">
          Reconnecting to live updates...
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 border-b border-zinc-800 px-6 py-4">
        <div className="rounded-md bg-zinc-800/60 px-3 py-1.5 text-sm">
          <span className="text-zinc-400">Active: </span>
          <span className="font-semibold text-zinc-100">{stats.totalActive}</span>
        </div>
        <div className="rounded-md bg-zinc-800/60 px-3 py-1.5 text-sm">
          <span className="text-zinc-400">Pipeline: </span>
          <span className="font-semibold text-zinc-100">
            {formatCurrency(stats.totalValue)}
          </span>
        </div>
        <div className="rounded-md bg-zinc-800/60 px-3 py-1.5 text-sm">
          <span className="text-zinc-400">Overdue: </span>
          <span className="font-semibold text-red-400">{stats.overdueCount}</span>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                loans={loans[stage] ?? []}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDragLoan ? (
              <div className="w-[280px] opacity-80">
                <LoanCard loan={activeDragLoan} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

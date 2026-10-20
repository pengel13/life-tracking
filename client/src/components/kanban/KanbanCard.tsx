import type { Card, UrgencyLevel } from '../../types/index.js'

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#64748b',
}

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
}

function dueDateLabel(dueDate: string | null): { text: string; color: string } | null {
  if (!dueDate) return null
  const today = new Date().toISOString().split('T')[0]
  if (dueDate < today) return { text: dueDate, color: '#ef4444' }
  if (dueDate === today) return { text: 'today', color: '#f59e0b' }
  return { text: dueDate, color: '#64748b' }
}

interface Props {
  card: Card
  onDelete: (id: string) => void
}

export default function KanbanCard({ card, onDelete }: Props) {
  const due = dueDateLabel(card.dueDate)
  const progressPct =
    card.currentUnit != null && card.totalUnits != null && card.totalUnits > 0
      ? Math.round((card.currentUnit / card.totalUnits) * 100)
      : null

  return (
    <div
      className="rounded-md p-3 select-none"
      style={{ backgroundColor: '#263345' }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-slate-200 leading-snug flex-1">{card.title}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(card.id) }}
          className="text-slate-600 hover:text-slate-400 text-xs mt-0.5 shrink-0 transition-colors"
          aria-label="Delete card"
        >
          ×
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${URGENCY_COLOR[card.urgency]}20`, color: URGENCY_COLOR[card.urgency] }}
        >
          {URGENCY_LABEL[card.urgency]}
        </span>

        {card.itemType && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
            {card.itemType}
          </span>
        )}

        {due && (
          <span className="text-xs ml-auto" style={{ color: due.color }}>
            {due.text}
          </span>
        )}
      </div>

      {progressPct != null && (
        <div className="mt-2">
          <div className="h-1 rounded-full bg-slate-700">
            <div
              className="h-1 rounded-full"
              style={{ width: `${progressPct}%`, backgroundColor: '#f59e0b' }}
            />
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {card.currentUnit}/{card.totalUnits}
          </span>
        </div>
      )}
    </div>
  )
}

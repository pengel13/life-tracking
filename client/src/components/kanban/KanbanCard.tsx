import type { Card, UrgencyLevel, UpdateCardInput } from '../../types/index.js'

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

function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dueDateLabel(dueDate: string | null): { text: string; color: string } | null {
  if (!dueDate) return null
  const today = todayLocal()
  if (dueDate < today) return { text: dueDate, color: '#ef4444' }
  if (dueDate === today) return { text: 'today', color: '#f59e0b' }
  return { text: dueDate, color: '#64748b' }
}

interface Props {
  card: Card
  onDelete: (id: string) => void
  onUpdate?: (id: string, updates: UpdateCardInput) => void
}

export default function KanbanCard({ card, onDelete, onUpdate }: Props) {
  const due = dueDateLabel(card.dueDate)
  const progressPct =
    card.currentUnit != null && card.totalUnits != null && card.totalUnits > 0
      ? Math.round((card.currentUnit / card.totalUnits) * 100)
      : null

  function increment() {
    if (card.currentUnit == null || card.totalUnits == null) return
    const next = Math.min(card.currentUnit + 1, card.totalUnits)
    onUpdate?.(card.id, { currentUnit: next })
  }

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
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs text-slate-500">
              {card.currentUnit}/{card.totalUnits}
            </span>
            {onUpdate && card.currentUnit !== card.totalUnits && (
              <button
                onClick={e => { e.stopPropagation(); increment() }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-1"
                aria-label="Advance progress"
              >
                +1
              </button>
            )}
          </div>
        </div>
      )}

      {card.source && card.sourceUrl && (
        <a
          href={card.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="mt-2 inline-flex text-xs text-slate-500 hover:text-slate-400 transition-colors"
          aria-label={card.source}
        >
          {card.source === 'email' ? '✉ email' : '💬 teams'}
        </a>
      )}
    </div>
  )
}

import type { Area, Card } from '../../types/index.js'
import { sortByUrgency } from './Dashboard.js'

interface Props {
  area: Area
  cards: Card[]
  onClick: () => void
}

export default function AreaCard({ area, cards, onClick }: Props) {
  const openCards = cards.filter(c => c.column !== 'Done')
  const mostUrgent = sortByUrgency(openCards)[0]

  const learningActive =
    area.id === 'learning'
      ? cards.find(c => c.column === 'In Progress' && c.currentUnit != null && c.totalUnits != null)
      : null

  const progressPct = learningActive
    ? Math.round(((learningActive.currentUnit ?? 0) / (learningActive.totalUnits ?? 1)) * 100)
    : 0

  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg p-4 w-full transition-opacity hover:opacity-90"
      style={{ backgroundColor: '#1e293b', borderTop: `3px solid ${area.color}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: area.color }}>
          {area.label}
        </span>
        <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
          {openCards.length}
        </span>
      </div>

      {mostUrgent ? (
        <p className="text-sm text-slate-300 truncate leading-snug">{mostUrgent.title}</p>
      ) : (
        <p className="text-sm text-slate-600">No open tasks</p>
      )}

      {learningActive && (
        <div className="mt-3">
          <div className="h-1 rounded-full bg-slate-700">
            <div
              className="h-1 rounded-full"
              style={{ width: `${progressPct}%`, backgroundColor: area.color }}
            />
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {learningActive.currentUnit}/{learningActive.totalUnits}
          </span>
        </div>
      )}
    </button>
  )
}

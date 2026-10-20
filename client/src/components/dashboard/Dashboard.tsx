import { useNavigate } from 'react-router-dom'
import { useCards } from '../../hooks/useCards.js'
import { AREAS } from '../../constants/areas.js'
import StatsRow from './StatsRow.js'
import AreaCard from './AreaCard.js'
import type { Card } from '../../types/index.js'

const URGENCY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function sortByUrgency(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    if (a.dueDate && b.dueDate) {
      if (a.dueDate < b.dueDate) return -1
      if (a.dueDate > b.dueDate) return 1
    }
    const urgencyDiff = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
    if (urgencyDiff !== 0) return urgencyDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export default function Dashboard() {
  const { cards, loading } = useCards()
  const navigate = useNavigate()

  if (loading) return <div className="p-6 text-slate-400">Loading…</div>

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <StatsRow cards={cards} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {AREAS.map(area => {
          const areaCards = cards.filter(c => c.areaId === area.id)
          return (
            <AreaCard
              key={area.id}
              area={area}
              cards={areaCards}
              onClick={() => navigate(`/area/${area.id}`)}
            />
          )
        })}
      </div>
    </div>
  )
}

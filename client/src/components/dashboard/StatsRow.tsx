import type { Card } from '../../types/index.js'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface StatTileProps {
  testId: string
  value: number
  label: string
  color?: string
}

function StatTile({ testId, value, label, color }: StatTileProps) {
  return (
    <div className="flex-1 rounded-lg px-4 py-4" style={{ backgroundColor: '#1e293b' }}>
      <div
        data-testid={testId}
        className="text-4xl font-semibold tracking-tight leading-none"
        style={{ color: color ?? '#e2e8f0' }}
      >
        {value}
      </div>
      <div className="text-sm mt-1.5 text-slate-500">{label}</div>
    </div>
  )
}

export default function StatsRow({ cards }: { cards: Card[] }) {
  const today = todayStr()

  const remaining = cards.filter(c => c.column !== 'Done').length

  const dueToday = cards.filter(c => c.dueDate === today && c.column !== 'Done').length

  const doneToday = cards.filter(c => {
    if (!c.completedAt) return false
    return c.completedAt.split('T')[0] === today
  }).length

  return (
    <div className="flex gap-3">
      <StatTile testId="stat-remaining" value={remaining} label="remaining" />
      <StatTile
        testId="stat-due-today"
        value={dueToday}
        label="due today"
        color={dueToday > 0 ? '#f59e0b' : undefined}
      />
      <StatTile
        testId="stat-done-today"
        value={doneToday}
        label="done today"
        color={doneToday > 0 ? '#10b981' : undefined}
      />
    </div>
  )
}

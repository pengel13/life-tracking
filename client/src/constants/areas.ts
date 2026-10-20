import type { Area } from '../types/index.js'

export const AREAS: Area[] = [
  { id: 'job1',       label: 'Job 1',      color: '#6366f1', columns: ['To Do', 'In Progress', 'Done'] },
  { id: 'job2',       label: 'Job 2',      color: '#8b5cf6', columns: ['To Do', 'In Progress', 'Done'] },
  { id: 'university', label: 'University', color: '#10b981', columns: ['To Do', 'In Progress', 'Done'] },
  { id: 'learning',   label: 'Learning',   color: '#f59e0b', columns: ['Backlog', 'In Progress', 'Done'] },
  { id: 'sports',     label: 'Sports',     color: '#14b8a6', columns: ['Planned', 'Done'] },
  { id: 'personal',   label: 'Personal',   color: '#ec4899', columns: ['To Do', 'In Progress', 'Done'] },
]

export function getArea(id: string): Area {
  const area = AREAS.find(a => a.id === id)
  if (!area) throw new Error(`Unknown area: ${id}`)
  return area
}

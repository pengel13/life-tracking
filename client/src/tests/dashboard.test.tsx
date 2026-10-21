import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Card } from '../types/index.js'
import { sortByUrgency } from '../components/dashboard/Dashboard.js'
import StatsRow from '../components/dashboard/StatsRow.js'
import KanbanCard from '../components/kanban/KanbanCard.js'

describe('sortByUrgency', () => {
  test('card with due date today ranks above card with no due date', () => {
    const today = new Date().toISOString().split('T')[0]
    const a = { dueDate: today, urgency: 'low', createdAt: '2026-01-01T00:00:00Z' } as Partial<Card>
    const b = { dueDate: null, urgency: 'high', createdAt: '2026-01-02T00:00:00Z' } as Partial<Card>
    expect(sortByUrgency([b, a] as Card[])[0]).toBe(a)
  })

  test('high urgency beats medium when no due dates', () => {
    const a = { dueDate: null, urgency: 'high', createdAt: '2026-01-01T00:00:00Z' } as Partial<Card>
    const b = { dueDate: null, urgency: 'medium', createdAt: '2026-01-02T00:00:00Z' } as Partial<Card>
    expect(sortByUrgency([b, a] as Card[])[0]).toBe(a)
  })

  test('earlier due date ranks above later due date', () => {
    const a = { dueDate: '2026-10-20', urgency: 'low', createdAt: '2026-01-01T00:00:00Z' } as Partial<Card>
    const b = { dueDate: '2026-10-25', urgency: 'high', createdAt: '2026-01-02T00:00:00Z' } as Partial<Card>
    expect(sortByUrgency([b, a] as Card[])[0]).toBe(a)
  })

  test('tiebreak on createdAt: newer card wins when urgency and date equal', () => {
    const a = { dueDate: null, urgency: 'medium', createdAt: '2026-01-02T00:00:00Z' } as Partial<Card>
    const b = { dueDate: null, urgency: 'medium', createdAt: '2026-01-01T00:00:00Z' } as Partial<Card>
    expect(sortByUrgency([b, a] as Card[])[0]).toBe(a)
  })
})

describe('StatsRow', () => {
  test('shows correct counts for remaining, due today, done today', () => {
    const today = new Date().toISOString().split('T')[0]
    const cards: Partial<Card>[] = [
      { column: 'To Do', dueDate: today, completedAt: null, urgency: 'medium' },
      { column: 'Done', dueDate: null, completedAt: new Date().toISOString(), urgency: 'medium' },
      { column: 'Done', dueDate: null, completedAt: new Date(Date.now() - 2 * 86400000).toISOString(), urgency: 'medium' },
      { column: 'In Progress', dueDate: null, completedAt: null, urgency: 'medium' },
    ]
    render(<StatsRow cards={cards as Card[]} />)
    // 2 non-Done cards
    expect(screen.getByTestId('stat-remaining').textContent).toBe('2')
    // 1 due today
    expect(screen.getByTestId('stat-due-today').textContent).toBe('1')
    // 1 completed today
    expect(screen.getByTestId('stat-done-today').textContent).toBe('1')
  })
})

describe('KanbanCard source badge', () => {
  test('shows email source badge when source is email', () => {
    const card: Card = {
      id: '1',
      areaId: 'job1',
      column: 'To Do',
      title: 'Budget',
      urgency: 'medium',
      dueDate: null,
      notes: null,
      progress: null,
      totalUnits: null,
      currentUnit: null,
      itemType: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'email',
      sourceUrl: 'https://outlook.office.com/m/1',
      externalId: 'email:ext1',
    }
    render(<KanbanCard card={card} onDelete={() => {}} />)
    const link = screen.getByRole('link', { name: /email/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('https://outlook.office.com/m/1')
  })
})

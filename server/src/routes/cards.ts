import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

router.get('/', async (req, res) => {
  const { areaId } = req.query
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS)

  const where: Record<string, unknown> = {
    OR: [
      { completedAt: null },
      { completedAt: { gt: ninetyDaysAgo } },
    ],
  }
  if (areaId) where.areaId = areaId

  const cards = await db.card.findMany({ where, orderBy: { createdAt: 'desc' } })
  res.json(cards)
})

router.post('/', async (req, res) => {
  const { areaId, column, title, urgency, dueDate, notes, progress, totalUnits, currentUnit, itemType } = req.body
  const card = await db.card.create({
    data: {
      areaId,
      column,
      title,
      urgency: urgency ?? 'medium',
      dueDate: dueDate ?? null,
      notes: notes ?? null,
      progress: progress ?? null,
      totalUnits: totalUnits ?? null,
      currentUnit: currentUnit ?? null,
      itemType: itemType ?? null,
    },
  })
  res.status(201).json(card)
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { column, title, urgency, dueDate, notes, itemType, totalUnits, currentUnit } = req.body

  const updates: Record<string, unknown> = {}
  if (column !== undefined) {
    updates.column = column
    updates.completedAt = column === 'Done' ? new Date() : null
  }
  if (title !== undefined) updates.title = title
  if (urgency !== undefined) updates.urgency = urgency
  if (dueDate !== undefined) updates.dueDate = dueDate
  if (notes !== undefined) updates.notes = notes
  if (itemType !== undefined) updates.itemType = itemType
  if (totalUnits !== undefined) updates.totalUnits = totalUnits
  if (currentUnit !== undefined) updates.currentUnit = currentUnit

  const card = await db.card.update({ where: { id }, data: updates })
  res.json(card)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  await db.card.delete({ where: { id } })
  res.status(204).send()
})

export default router

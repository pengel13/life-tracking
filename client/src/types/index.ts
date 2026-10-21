export type UrgencyLevel = 'low' | 'medium' | 'high'
export type ItemType = 'book' | 'course' | 'certification' | 'video'

export interface Card {
  id: string
  areaId: string
  column: string
  title: string
  urgency: UrgencyLevel
  dueDate: string | null
  notes: string | null
  progress: number | null
  totalUnits: number | null
  currentUnit: number | null
  itemType: ItemType | null
  completedAt: string | null
  source?: string | null
  sourceUrl?: string | null
  externalId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Area {
  id: string
  label: string
  color: string
  columns: string[]
}

export type CreateCardInput = Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>
export type UpdateCardInput = Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>

export interface SyncAccount {
  id: string
  displayName: string
  email: string
  tenantId: string
  msAccountId: string
  lastSyncAt: string | null
  createdAt: string
}

export interface SyncRule {
  id: string
  name: string
  source: 'email' | 'teams' | 'both'
  fromEmail: string | null
  keyword: string | null
  accountId: string | null
  areaId: string
  column: string
  urgency: string
  priority: number
  enabled: boolean
  createdAt: string
}

export type CreateSyncRuleInput = Omit<SyncRule, 'id' | 'createdAt'>


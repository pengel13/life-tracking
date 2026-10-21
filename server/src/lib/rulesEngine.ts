export interface SyncMessage {
  externalId: string
  source: 'email' | 'teams'
  fromEmail: string
  subject: string
  sourceUrl: string
  accountId: string
}

interface SyncRuleLike {
  areaId: string
  column: string
  urgency: string
  priority: number
  enabled: boolean
  source: string
  fromEmail?: string | null
  keyword?: string | null
  accountId?: string | null
}

export function applyRules(msg: SyncMessage, rules: SyncRuleLike[]): SyncRuleLike | null {
  const matching = rules
    .filter((r) => r.enabled)
    .filter((r) => r.source === msg.source || r.source === 'both')
    .filter((r) => !r.accountId || r.accountId === msg.accountId)
    .filter((r) => !r.keyword || msg.subject.toLowerCase().includes(r.keyword.toLowerCase()))
    .filter((r) => !r.fromEmail || msg.fromEmail.toLowerCase().includes(r.fromEmail.toLowerCase()))
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return 0
    })

  return matching[0] ?? null
}

import { Client } from '@microsoft/microsoft-graph-client'
import type { SyncAccount } from '@prisma/client'
import { db } from '../lib/db.js'
import { applyRules, type SyncMessage } from '../lib/rulesEngine.js'
import { refreshAccountToken } from '../routes/sync.js'

interface RuleLike {
  areaId: string
  column: string
  urgency: string
}

export function buildCard(msg: SyncMessage, rule: RuleLike) {
  return {
    areaId: rule.areaId,
    column: rule.column,
    title: msg.subject,
    urgency: rule.urgency,
    source: msg.source,
    sourceUrl: msg.sourceUrl,
    externalId: msg.externalId,
  }
}

export async function syncOutlook(
  account: SyncAccount,
  rules: Parameters<typeof applyRules>[1],
): Promise<number> {
  const fresh = await refreshAccountToken(account)

  const graphClient = Client.init({
    authProvider: (done) => done(null, fresh.accessToken),
  })

  // On first run use 24h window; otherwise use lastSyncAt
  const since = fresh.lastSyncAt
    ? fresh.lastSyncAt.toISOString()
    : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let messages: unknown[]
  try {
    const response = await graphClient
      .api('/me/messages')
      .filter(`receivedDateTime ge ${since}`)
      .select('id,subject,from,webLink')
      .top(50)
      .get()
    messages = response.value ?? []
  } catch (err) {
    console.error(`Outlook fetch failed for account ${account.id}:`, err)
    return 0
  }

  let created = 0
  for (const raw of messages as Record<string, unknown>[]) {
    const fromEmail =
      (raw.from as { emailAddress?: { address?: string } } | undefined)?.emailAddress?.address ?? ''
    const msg: SyncMessage = {
      externalId: `email:${raw.id as string}`,
      source: 'email',
      fromEmail,
      subject: (raw.subject as string) ?? '(no subject)',
      sourceUrl: (raw.webLink as string) ?? '',
      accountId: account.id,
    }

    const rule = applyRules(msg, rules)
    if (!rule) continue

    const existing = await db.card.findFirst({ where: { externalId: msg.externalId } })
    if (existing) continue

    await db.card.create({ data: buildCard(msg, rule) })
    created++
  }

  await db.syncAccount.update({
    where: { id: account.id },
    data: { lastSyncAt: new Date() },
  })

  return created
}

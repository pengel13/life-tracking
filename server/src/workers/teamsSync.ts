import { Client } from '@microsoft/microsoft-graph-client'
import type { SyncAccount } from '@prisma/client'
import { db } from '../lib/db.js'
import { applyRules, type SyncMessage } from '../lib/rulesEngine.js'
import { buildCard } from './outlookSync.js'
import { refreshAccountToken } from '../routes/sync.js'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
}

export function buildTeamsMessage(rawMsg: unknown, accountId: string): SyncMessage {
  const msg = rawMsg as Record<string, unknown>
  const body = msg.body as { content?: string } | undefined
  const from = msg.from as { user?: { email?: string } } | undefined

  return {
    externalId: `teams:${msg.id as string}`,
    source: 'teams',
    fromEmail: from?.user?.email ?? '',
    subject: stripHtml(body?.content ?? ''),
    sourceUrl: (msg.webUrl as string) ?? '',
    accountId,
  }
}

export async function syncTeams(
  account: SyncAccount,
  rules: Parameters<typeof applyRules>[1],
): Promise<number> {
  const fresh = await refreshAccountToken(account)

  const graphClient = Client.init({
    authProvider: (done) => done(null, fresh.accessToken),
  })

  const since = fresh.lastSyncAt
    ? fresh.lastSyncAt.toISOString()
    : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const rawMessages: unknown[] = []

  // Personal chats (always available — no admin consent needed)
  try {
    const chatsResp = await graphClient.api('/me/chats').select('id').top(50).get()
    const chats: { id: string }[] = chatsResp.value ?? []

    for (const chat of chats) {
      try {
        const msgsResp = await graphClient
          .api(`/me/chats/${chat.id}/messages`)
          .filter(`createdDateTime ge ${since}`)
          .top(20)
          .get()
        rawMessages.push(...(msgsResp.value ?? []))
      } catch {
        // skip individual chat errors
      }
    }
  } catch (err) {
    console.error(`Teams chat fetch failed for account ${account.id}:`, err)
  }

  // Channel messages — only if ChannelMessage.Read.All in scopes
  const hasChannelScope = fresh.scopes.includes('ChannelMessage.Read.All')
  if (hasChannelScope) {
    try {
      const teamsResp = await graphClient.api('/me/joinedTeams').get()
      const joinedTeams: { id: string }[] = teamsResp.value ?? []

      for (const team of joinedTeams) {
        try {
          const channelsResp = await graphClient
            .api(`/teams/${team.id}/channels`)
            .select('id')
            .get()
          const channels: { id: string }[] = channelsResp.value ?? []

          for (const channel of channels) {
            try {
              const msgsResp = await graphClient
                .api(`/teams/${team.id}/channels/${channel.id}/messages`)
                .filter(`createdDateTime ge ${since}`)
                .top(20)
                .get()
              rawMessages.push(...(msgsResp.value ?? []))
            } catch (err: unknown) {
              const status = (err as { statusCode?: number })?.statusCode
              if (status === 403) {
                console.warn(
                  `channel ${channel.id} message sync skipped for tenant ${account.tenantId} — ChannelMessage.Read.All admin consent missing`,
                )
              }
            }
          }
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode
          if (status === 403) {
            console.warn(
              `channel listing skipped for tenant ${account.tenantId} — admin consent missing`,
            )
          }
        }
      }
    } catch (err) {
      console.error(`Teams channel fetch failed for account ${account.id}:`, err)
    }
  }

  let created = 0
  for (const raw of rawMessages) {
    const msg = buildTeamsMessage(raw, account.id)
    if (!msg.subject) continue

    const rule = applyRules(msg, rules)
    if (!rule) continue

    try {
      await db.card.create({ data: buildCard(msg, rule) })
      created++
    } catch (err) {
      if ((err as { code?: string }).code !== 'P2002') throw err
      // P2002: unique constraint on externalId — already synced, skip
    }
  }

  await db.syncAccount.update({
    where: { id: account.id },
    data: { lastSyncAt: new Date() },
  })

  return created
}

import { Router } from 'express'
import crypto from 'crypto'
import { Client } from '@microsoft/microsoft-graph-client'
import type { SyncAccount } from '@prisma/client'
import { db } from '../lib/db.js'
import { getMsalClient } from '../lib/msalConfig.js'

const router = Router()

const OAUTH_SCOPES = ['Mail.Read', 'Chat.Read', 'ChannelMessage.Read.All', 'User.Read', 'offline_access']

// In-memory nonce store: nonce → created timestamp
const pendingNonces = new Map<string, number>()

// --- Accounts ---

router.get('/accounts', async (_req, res) => {
  const accounts = await db.syncAccount.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      displayName: true,
      email: true,
      tenantId: true,
      msAccountId: true,
      lastSyncAt: true,
      createdAt: true,
    },
  })
  res.json(accounts)
})

router.post('/accounts/connect', async (_req, res) => {
  const nonce = crypto.randomBytes(16).toString('hex')
  pendingNonces.set(nonce, Date.now())

  const msal = getMsalClient()
  const authUrl = await msal.getAuthCodeUrl({
    scopes: OAUTH_SCOPES,
    redirectUri: process.env.AZURE_REDIRECT_URI ?? 'http://localhost:3001/api/sync/accounts/callback',
    state: nonce,
  })
  res.json({ authUrl })
})

router.delete('/accounts/:id', async (req, res) => {
  const { id } = req.params
  const existing = await db.syncAccount.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Account not found' })
    return
  }
  await db.syncAccount.delete({ where: { id } })
  res.status(204).send()
})

// --- OAuth callback (no auth middleware — Microsoft redirects here) ---
// NOTE: This route is mounted BEFORE requireAuth in index.ts

router.get('/accounts/callback', async (req, res) => {
  const { code, state, error } = req.query as Record<string, string>

  if (error) {
    res.redirect(`/sync?error=${encodeURIComponent(error)}`)
    return
  }

  // Validate nonce
  const createdAt = pendingNonces.get(state)
  if (!createdAt || Date.now() - createdAt > 10 * 60 * 1000) {
    res.redirect('/sync?error=invalid_state')
    return
  }
  pendingNonces.delete(state)

  try {
    const msal = getMsalClient()
    const redirectUri = process.env.AZURE_REDIRECT_URI ?? 'http://localhost:3001/api/sync/accounts/callback'
    const result = await msal.acquireTokenByCode({ code, scopes: OAUTH_SCOPES, redirectUri })

    if (!result?.accessToken) {
      res.redirect('/sync?error=no_token')
      return
    }

    // Fetch user profile
    const graphClient = Client.init({
      authProvider: (done) => done(null, result.accessToken),
    })
    const me = await graphClient.api('/me').select('id,displayName,mail,userPrincipalName').get()

    const tenantId = (result.account?.tenantId as string) ?? 'unknown'
    const msAccountId = (result.account?.homeAccountId as string) ?? me.id
    const email = me.mail ?? me.userPrincipalName ?? ''

    await db.syncAccount.upsert({
      where: { msAccountId },
      update: {
        accessToken: result.accessToken,
        refreshToken: (result as unknown as { refreshToken?: string }).refreshToken ?? '',
        tokenExpiry: new Date(result.expiresOn ?? Date.now() + 3600 * 1000),
        scopes: OAUTH_SCOPES.join(' '),
      },
      create: {
        displayName: me.displayName ?? email,
        email,
        tenantId,
        msAccountId,
        accessToken: result.accessToken,
        refreshToken: (result as unknown as { refreshToken?: string }).refreshToken ?? '',
        tokenExpiry: new Date(result.expiresOn ?? Date.now() + 3600 * 1000),
        scopes: OAUTH_SCOPES.join(' '),
      },
    })

    res.redirect('/sync')
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect('/sync?error=auth_failed')
  }
})

// --- Token refresh helper (exported for workers) ---

export async function refreshAccountToken(account: SyncAccount): Promise<SyncAccount> {
  // If token is still valid (5-minute buffer), return as-is
  if (account.tokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
    return account
  }

  const msal = getMsalClient()
  const redirectUri = process.env.AZURE_REDIRECT_URI ?? 'http://localhost:3001/api/sync/accounts/callback'

  try {
    const result = await msal.acquireTokenByRefreshToken({
      refreshToken: account.refreshToken,
      scopes: account.scopes.split(' '),
      redirectUri,
    } as Parameters<typeof msal.acquireTokenByRefreshToken>[0])

    if (!result?.accessToken) throw new Error('No access token in refresh response')

    return await db.syncAccount.update({
      where: { id: account.id },
      data: {
        accessToken: result.accessToken,
        tokenExpiry: new Date(result.expiresOn ?? Date.now() + 3600 * 1000),
      },
    })
  } catch (err) {
    throw new Error(`Token refresh failed for account ${account.id}: ${(err as Error).message}`)
  }
}

export default router

import cron from 'node-cron'
import { db } from '../lib/db.js'
import { syncOutlook } from './outlookSync.js'
import { syncTeams } from './teamsSync.js'

export function startSyncWorker(): void {
  cron.schedule('*/5 * * * *', async () => {
    let accounts
    try {
      accounts = await db.syncAccount.findMany()
    } catch (err) {
      console.error('sync worker: failed to load accounts:', err)
      return
    }

    let rules
    try {
      rules = await db.syncRule.findMany({ where: { enabled: true } })
    } catch (err) {
      console.error('sync worker: failed to load rules:', err)
      return
    }

    for (const account of accounts) {
      try {
        const emailCount = await syncOutlook(account, rules)
        const teamsCount = await syncTeams(account, rules)
        if (emailCount + teamsCount > 0) {
          console.log(
            `sync: account ${account.email} — ${emailCount} email, ${teamsCount} teams cards created`,
          )
        }
      } catch (err) {
        console.error(`sync error for account ${account.id} (${account.email}):`, err)
      }
    }
  })
}

import { useState, useEffect, useCallback } from 'react'
import { syncApi } from '../../api/client.js'
import type { SyncAccount, SyncRule, CreateSyncRuleInput } from '../../types/index.js'
import ConnectAccount from './ConnectAccount.js'
import RuleForm from './RuleForm.js'

export default function SyncSettings() {
  const [accounts, setAccounts] = useState<SyncAccount[]>([])
  const [rules, setRules] = useState<SyncRule[]>([])
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAccounts = useCallback(async () => {
    try {
      setAccounts(await syncApi.getAccounts())
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  const loadRules = useCallback(async () => {
    try {
      setRules(await syncApi.getRules())
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
    loadRules()

    // Handle redirect back from OAuth with ?error
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('error')
    if (oauthError) {
      setError(`OAuth error: ${oauthError}`)
      window.history.replaceState({}, '', '/sync')
    }
  }, [loadAccounts, loadRules])

  async function handleConnect() {
    setConnecting(true)
    try {
      const { authUrl } = await syncApi.connectAccount()
      window.location.href = authUrl
    } catch (err) {
      setError((err as Error).message)
      setConnecting(false)
    }
  }

  async function handleDeleteAccount(id: string) {
    await syncApi.deleteAccount(id)
    await loadAccounts()
  }

  async function handleCreateRule(input: CreateSyncRuleInput) {
    await syncApi.createRule(input)
    setShowRuleForm(false)
    await loadRules()
  }

  async function handleDeleteRule(id: string) {
    await syncApi.deleteRule(id)
    await loadRules()
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 mb-1">Microsoft Sync</h1>
        <p className="text-sm text-slate-400">
          Connect your work accounts and set rules for where messages land.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded px-3 py-2">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Connected accounts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300">Connected accounts</h2>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded transition-colors"
          >
            {connecting ? 'Redirecting…' : '+ Connect account'}
          </button>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No accounts connected yet.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <ConnectAccount key={a.id} account={a} onDelete={() => handleDeleteAccount(a.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Routing rules */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300">Routing rules</h2>
          <button
            onClick={() => setShowRuleForm(!showRuleForm)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded transition-colors"
          >
            {showRuleForm ? 'Cancel' : '+ Add rule'}
          </button>
        </div>

        {showRuleForm && (
          <div className="mb-4">
            <RuleForm accounts={accounts} onSubmit={handleCreateRule} />
          </div>
        )}

        {rules.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No rules yet. Add a rule to decide where messages land.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{r.name}</p>
                  <p className="text-xs text-slate-400">
                    {r.source}
                    {r.fromEmail ? ` · from:${r.fromEmail}` : ''}
                    {r.keyword ? ` · keyword:${r.keyword}` : ''}
                    {' → '}
                    {r.areaId} / {r.column}
                    {r.priority > 0 ? ` (priority ${r.priority})` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRule(r.id)}
                  className="ml-3 text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

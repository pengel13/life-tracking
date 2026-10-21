import { useState } from 'react'
import { AREAS } from '../../constants/areas.js'
import type { SyncAccount, CreateSyncRuleInput } from '../../types/index.js'

interface Props {
  accounts: SyncAccount[]
  onSubmit: (rule: CreateSyncRuleInput) => void
}

export default function RuleForm({ accounts, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [source, setSource] = useState<'email' | 'teams' | 'both'>('email')
  const [fromEmail, setFromEmail] = useState('')
  const [keyword, setKeyword] = useState('')
  const [accountId, setAccountId] = useState('')
  const [areaId, setAreaId] = useState(AREAS[0].id)
  const [column, setColumn] = useState(AREAS[0].columns[0])
  const [urgency, setUrgency] = useState('medium')
  const [priority, setPriority] = useState(0)

  const selectedArea = AREAS.find((a) => a.id === areaId) ?? AREAS[0]

  function handleAreaChange(id: string) {
    const area = AREAS.find((a) => a.id === id) ?? AREAS[0]
    setAreaId(area.id)
    setColumn(area.columns[0])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      source,
      fromEmail: fromEmail.trim() || null,
      keyword: keyword.trim() || null,
      accountId: accountId || null,
      areaId,
      column,
      urgency,
      priority,
      enabled: true,
    })
    setName('')
    setFromEmail('')
    setKeyword('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-800 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Rule name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work emails"
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as 'email' | 'teams' | 'both')}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          >
            <option value="email">Email</option>
            <option value="teams">Teams</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">From email (partial match)</label>
          <input
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="e.g. boss@company.com"
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Keyword (subject match)</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. urgent"
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Account (optional)</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Any account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Area *</label>
          <select
            value={areaId}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Column *</label>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value)}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
          >
            {selectedArea.columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Priority</label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 focus:outline-none"
            min={0}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-1.5 rounded transition-colors"
      >
        Add rule
      </button>
    </form>
  )
}

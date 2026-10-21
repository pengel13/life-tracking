import type { SyncAccount } from '../../types/index.js'

interface Props {
  account: SyncAccount
  onDelete: () => void
}

export default function ConnectAccount({ account, onDelete }: Props) {
  const lastSync = account.lastSyncAt
    ? new Date(account.lastSyncAt).toLocaleString()
    : 'Never'

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{account.displayName}</p>
        <p className="text-xs text-slate-400 truncate">{account.email}</p>
        <p className="text-xs text-slate-500">Last sync: {lastSync}</p>
      </div>
      <button
        onClick={onDelete}
        className="ml-3 text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
        aria-label={`Disconnect ${account.displayName}`}
      >
        Disconnect
      </button>
    </div>
  )
}

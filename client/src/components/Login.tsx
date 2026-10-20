import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setError('')
    setLoading(true)
    try {
      await login(password)
      navigate('/', { replace: true })
    } catch {
      setError('Wrong password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f172a' }}>
      <div className="px-6 py-5">
        <span className="text-sm font-medium text-slate-500 tracking-wide">Life OS</span>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <h1 className="text-2xl font-semibold text-slate-100 mb-8">
            Enter your password
          </h1>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="rounded-md px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
              }}
              onFocus={e => (e.target.style.borderColor = '#64748b')}
              onBlur={e => (e.target.style.borderColor = '#334155')}
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="font-medium py-3 rounded-md transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#1e3a5f', color: '#e2e8f0' }}
              onMouseEnter={e => { if (!loading && password) (e.target as HTMLElement).style.backgroundColor = '#1e4a7a' }}
              onMouseLeave={e => (e.target as HTMLElement).style.backgroundColor = '#1e3a5f'}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

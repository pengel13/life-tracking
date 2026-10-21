const TOKEN_KEY = 'life_os_token'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    clearToken()
    window.location.replace('/login')
    throw new Error('Unauthorized')
  }

  if (res.status === 204) return undefined as T

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}

import type { SyncAccount, SyncRule, CreateSyncRuleInput } from '../types/index.js'

export const syncApi = {
  getAccounts: () => api.get<SyncAccount[]>('/api/sync/accounts'),
  connectAccount: (accountHint?: string) =>
    api.post<{ authUrl: string }>('/api/sync/accounts/connect', { accountHint }),
  deleteAccount: (id: string) => api.delete(`/api/sync/accounts/${id}`),
  getRules: () => api.get<SyncRule[]>('/api/sync/rules'),
  createRule: (input: CreateSyncRuleInput) => api.post<SyncRule>('/api/sync/rules', input),
  deleteRule: (id: string) => api.delete(`/api/sync/rules/${id}`),
}

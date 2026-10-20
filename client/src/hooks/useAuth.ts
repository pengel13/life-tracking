import { useState } from 'react'
import { api, setToken, clearToken, isAuthenticated } from '../api/client.js'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())

  async function login(password: string): Promise<void> {
    const { token } = await api.post<{ token: string }>('/api/auth/login', { password })
    setToken(token)
    setAuthenticated(true)
  }

  function logout() {
    clearToken()
    setAuthenticated(false)
    window.location.replace('/login')
  }

  return { login, logout, isAuthenticated: authenticated }
}

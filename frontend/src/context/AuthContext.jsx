import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function getStoredAuth() {
  try {
    const t = localStorage.getItem('finance_token')
    const u = localStorage.getItem('finance_user')
    if (t && u) return { token: t, user: JSON.parse(u) }
  } catch {}
  return null
}

function devAutoLogin() {
  const obj = {
    token: 'dev-token-' + Date.now(),
    user: { username: 'dev' },
  }
  localStorage.setItem('finance_token', obj.token)
  localStorage.setItem('finance_user', JSON.stringify(obj.user))
  return obj
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = getStoredAuth()
    if (stored) return stored
    if (import.meta.env.DEV) return devAutoLogin()
    return null
  })

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(err.error)
    }
    const data = await res.json()
    const obj = { token: data.token, user: data.user }
    localStorage.setItem('finance_token', obj.token)
    localStorage.setItem('finance_user', JSON.stringify(obj.user))
    setAuth(obj)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('finance_token')
    localStorage.removeItem('finance_user')
    setAuth(null)
  }, [])

  const isLoggedIn = !!auth?.token

  return (
    <AuthContext.Provider value={{ ...auth, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

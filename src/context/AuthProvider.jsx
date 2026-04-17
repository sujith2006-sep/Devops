import { useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../services/api.js'
import { AuthContext } from './authContext.js'

const STORAGE_KEY = 'projectdevobs.session'

function readStoredSession() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  async function signIn({ role, identifier }) {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await loginUser({ role, identifier })
      setSession(response.session)
      return response.session
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  async function signUp({ customerId, name, phone, provider, planId }) {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await registerUser({ customerId, name, phone, provider, planId })
      setSession(response.session)
      return response.session
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  function signOut() {
    setSession(null)
    setAuthError(null)
  }

  function clearAuthError() {
    setAuthError(null)
  }

  const value = useMemo(
    () => ({
      session,
      authLoading,
      authError,
      signIn,
      signUp,
      signOut,
      clearAuthError,
    }),
    [session, authLoading, authError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { useCallback, useMemo, useState } from 'react'
import { getUser, postCustomize } from '../services/api.js'
import { AppContext } from './appContext.js'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userError, setUserError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [customizeResult, setCustomizeResult] = useState(null)

  const loadUser = useCallback(async (id) => {
    const trimmed = String(id).trim()
    setLoading(true)
    setUserError(null)
    setUser(null)
    setCustomizeResult(null)
    try {
      const u = await getUser(trimmed)
      setUser(u)
    } catch (e) {
      setUserError(e instanceof Error ? e.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitCustomize = useCallback(
    async ({ id, planId, selectedChannels, addons }) => {
      setLoading(true)
      setUserError(null)
      setCustomizeResult(null)
      try {
        const res = await postCustomize({
          id,
          planId,
          selectedChannels,
          addons,
        })
        setCustomizeResult(res)
      } catch (e) {
        setUserError(e instanceof Error ? e.message : 'Customization failed')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearFeedback = useCallback(() => {
    setUserError(null)
    setCustomizeResult(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      userError,
      loading,
      customizeResult,
      loadUser,
      submitCustomize,
      clearFeedback,
    }),
    [
      user,
      userError,
      loading,
      customizeResult,
      loadUser,
      submitCustomize,
      clearFeedback,
    ]
  )

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  )
}

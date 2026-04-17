import { useEffect, useState } from 'react'

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export function navigate(path, options = {}) {
  const nextPath = normalizePath(path)
  const nextHash = `#${nextPath}`

  if (options.replace) {
    window.history.replaceState({}, '', nextHash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }

  window.location.hash = nextPath
}

export function useRoute() {
  const [path, setPath] = useState(() =>
    normalizePath(window.location.hash.replace(/^#/, '') || '/')
  )

  useEffect(() => {
    function handleChange() {
      setPath(normalizePath(window.location.hash.replace(/^#/, '') || '/'))
    }

    window.addEventListener('hashchange', handleChange)
    return () => window.removeEventListener('hashchange', handleChange)
  }, [])

  return { path, navigate }
}

import { useEffect, useState } from 'react'
import { AppProvider } from './context/AppProvider.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { useAuth } from './hooks/useAuth.js'
import { navigate, useRoute } from './hooks/useRoute.js'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import './styles/main.css'

function AppShell() {
  const { path } = useRoute()
  const { session, authLoading, authError, signIn, signUp, signOut, clearAuthError } = useAuth()
  const [loginRole, setLoginRole] = useState('user')

  useEffect(() => {
    if (!session && path !== '/login') {
      navigate('/login', { replace: true })
      return
    }

    if (session?.role === 'admin' && path !== '/admin') {
      navigate('/admin', { replace: true })
      return
    }

    if (session?.role === 'user' && path !== '/user') {
      navigate('/user', { replace: true })
    }
  }, [path, session])

  async function handleLogin(credentials) {
    try {
      const nextSession = await signIn(credentials)
      navigate(nextSession.role === 'admin' ? '/admin' : '/user', { replace: true })
    } catch {
      // AuthProvider exposes the visible error state for the login screen.
    }
  }

  async function handleRegister(payload) {
    try {
      const nextSession = await signUp(payload)
      navigate(nextSession.role === 'admin' ? '/admin' : '/user', { replace: true })
    } catch {
      // AuthProvider exposes the visible error state for the register screen.
    }
  }

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  if (!session || path === '/login' || path === '/') {
    return (
      <LoginPage
        role={loginRole}
        authLoading={authLoading}
        authError={authError}
        onRoleChange={(role) => {
          clearAuthError()
          setLoginRole(role)
        }}
        onSubmit={handleLogin}
        onRegister={handleRegister}
      />
    )
  }

  if (session.role === 'admin') {
    return <AdminDashboard session={session} onLogout={handleLogout} />
  }

  return (
    <AppProvider>
      <Home authUser={session.user} onLogout={handleLogout} />
    </AppProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App

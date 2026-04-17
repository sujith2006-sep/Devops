import { useEffect, useState } from 'react'
import { getCatalog } from '../services/api.js'

const PROVIDERS = [
  'TataSky',
  'Videocon d2h',
  'DishTV',
  'Airtel Digital TV',
  'Sun Direct',
  'GTPL',
  'Hathway',
]

const DEFAULT_PLANS = []

export default function LoginPage({
  role,
  authLoading,
  authError,
  onRoleChange,
  onSubmit,
  onRegister,
}) {
  const [mode, setMode] = useState('login')
  const [identifier, setIdentifier] = useState('')
  const [plans, setPlans] = useState(DEFAULT_PLANS)
  const [registerForm, setRegisterForm] = useState({
    customerId: '',
    name: '',
    phone: '',
    provider: PROVIDERS[0],
    planId: '',
  })

  useEffect(() => {
    if (role === 'admin') {
      setMode('login')
      setIdentifier('admin')
    } else {
      setIdentifier('')
    }
  }, [role])

  function openRegister() {
    setRegisterForm((prev) => ({ ...prev, customerId: identifier }))
    setMode('register')
    getCatalog()
      .then((data) => {
        if (data?.plans?.length) {
          setPlans(data.plans)
          setRegisterForm((prev) => ({ ...prev, planId: String(data.plans[0].id) }))
        }
      })
      .catch(() => {})
  }

  function handleLogin(e) {
    e.preventDefault()
    onSubmit({ role, identifier })
  }

  function handleRegisterSubmit(e) {
    e.preventDefault()
    onRegister({
      customerId: registerForm.customerId,
      name: registerForm.name,
      phone: registerForm.phone,
      provider: registerForm.provider,
      planId: registerForm.planId,
    })
  }

  function setField(key, value) {
    setRegisterForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <main className="shell shell--auth">

      {/* Brand header above the card */}
      <div className="auth-brand">
        <div className="auth-brand__icon">📺</div>
        <div className="auth-brand__name">StreamPlan</div>
        <div className="auth-brand__sub">Manage your DTH subscription</div>
      </div>

      <section className="auth-card">

        {/* Role tabs */}
        <div className="role-switch">
          <button
            type="button"
            className={`role-switch__button ${role === 'user' ? 'is-active' : ''}`}
            onClick={() => onRoleChange('user')}
          >
            User
          </button>
          <button
            type="button"
            className={`role-switch__button ${role === 'admin' ? 'is-active' : ''}`}
            onClick={() => onRoleChange('admin')}
          >
            Admin
          </button>
        </div>

        {/* ── USER LOGIN ── */}
        {role === 'user' && mode === 'login' && (
          <>
            <div className="auth-card__header">
              <h2>User Login</h2>
              <p>Enter your Customer ID to continue.</p>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <label className="app-label" htmlFor="user-id">Customer ID</label>
              <input
                id="user-id"
                className="app-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 101"
                autoFocus
              />
              {authError && (
                <p className="app-message app-message--error" role="alert">
                  {authError}
                  {authError === 'Invalid ID' && ' — ID not found. Click Register below.'}
                </p>
              )}
              <div className="btn-row">
                <button
                  type="submit"
                  className="app-button app-button--primary"
                  disabled={authLoading}
                >
                  {authLoading ? 'Checking…' : 'Login'}
                </button>
                <button
                  type="button"
                  className="app-button"
                  onClick={openRegister}
                  disabled={authLoading}
                >
                  Register
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── USER REGISTER ── */}
        {role === 'user' && mode === 'register' && (
          <>
            <div className="auth-card__header">
              <button
                type="button"
                className="back-link"
                onClick={() => setMode('login')}
              >
                ← Back to Login
              </button>
              <h2>Create Account</h2>
            </div>
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <label className="app-label" htmlFor="reg-id">Customer ID</label>
              <input
                id="reg-id"
                className="app-input"
                type="text"
                value={registerForm.customerId}
                onChange={(e) => setField('customerId', e.target.value)}
                placeholder="Choose a unique ID"
                required
              />

              <label className="app-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className="app-input"
                type="text"
                value={registerForm.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Your full name"
                required
              />

              <label className="app-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                className="app-input"
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="10-digit mobile number"
                required
              />

              <label className="app-label" htmlFor="reg-provider">Provider</label>
              <select
                id="reg-provider"
                className="app-input"
                value={registerForm.provider}
                onChange={(e) => setField('provider', e.target.value)}
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <label className="app-label" htmlFor="reg-plan">Plan</label>
              <select
                id="reg-plan"
                className="app-input"
                value={registerForm.planId}
                onChange={(e) => setField('planId', e.target.value)}
              >
                {plans.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} — ₹{p.packPrice}/mo
                  </option>
                ))}
              </select>

              {authError && (
                <p className="app-message app-message--error" role="alert">
                  {authError}
                  {(authError.toLowerCase().includes('exist') ||
                    authError.toLowerCase().includes('409')) &&
                    ' Please use a different ID.'}
                </p>
              )}

              <button
                type="submit"
                className="app-button app-button--primary app-button--full"
                disabled={authLoading}
              >
                {authLoading ? 'Registering…' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        {/* ── ADMIN LOGIN ── */}
        {role === 'admin' && (
          <>
            <div className="auth-card__header">
              <h2>Admin Login</h2>
              <p>Enter the admin identifier to access the dashboard.</p>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <label className="app-label" htmlFor="admin-id">Admin ID</label>
              <input
                id="admin-id"
                className="app-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin"
              />
              {authError && (
                <p className="app-message app-message--error" role="alert">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                className="app-button app-button--primary app-button--full"
                disabled={authLoading}
              >
                {authLoading ? 'Checking…' : 'Login'}
              </button>
            </form>
          </>
        )}

      </section>
    </main>
  )
}

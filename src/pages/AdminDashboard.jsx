import { useEffect, useMemo, useState } from 'react'
import { deleteUser, getCatalog, listUsers } from '../services/api.js'

function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0))
}

export default function AdminDashboard({ session, onLogout }) {
  const [users, setUsers]       = useState([])
  const [catalog, setCatalog]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // id of the row showing the confirm prompt (null = none)
  const [confirmId, setConfirmId] = useState(null)
  // id currently being deleted (shows spinner on that row)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [ur, cr] = await Promise.all([listUsers(), getCatalog()])
        if (cancelled) return
        setUsers(ur.users ?? [])
        setCatalog(cr)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const stats = useMemo(() => ({
    totalSubscribers: users.length,
    totalRevenue: users.reduce((s, u) => s + Number(u.packPrice ?? 0), 0),
    totalPlans: catalog?.plans?.length ?? 0,
    totalChannels: catalog?.channels?.length ?? 0,
  }), [users, catalog])

  async function handleDelete(user) {
    setDeletingId(user.id)
    setDeleteError(null)
    try {
      await deleteUser(user.customerId)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setConfirmId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">📺 StreamPlan — Admin</p>
          <h1>Welcome, {session.displayName}</h1>
        </div>
        <button type="button" className="app-button" onClick={onLogout}>
          Sign out
        </button>
      </header>

      {error && <p className="app-message app-message--error" role="alert">{error}</p>}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Subscribers</span>
          <strong>{stats.totalSubscribers}</strong>
        </article>
        <article className="stat-card">
          <span>Base revenue</span>
          <strong>{formatInr(stats.totalRevenue)}</strong>
        </article>
        <article className="stat-card">
          <span>Plans</span>
          <strong>{stats.totalPlans}</strong>
        </article>
        <article className="stat-card">
          <span>Channels</span>
          <strong>{stats.totalChannels}</strong>
        </article>
      </section>

      <section className="app-card">
        <h2>Subscribers</h2>

        {deleteError && (
          <p className="app-message app-message--error" role="alert">{deleteError}</p>
        )}

        {loading ? (
          <p className="app-hint">Loading subscriber accounts...</p>
        ) : users.length === 0 ? (
          <p className="app-hint">No subscribers found.</p>
        ) : (
          <div className="table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Customer ID</th>
                  <th>Provider</th>
                  <th>Plan</th>
                  <th>Pack price</th>
                  <th>Last recharged</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <>
                    {/* ── Main row ── */}
                    <tr key={user.id}>
                      <td>
                        <span className="user-name-cell">
                          <span className="user-avatar">{user.name.slice(0, 2)}</span>
                          {user.name}
                        </span>
                      </td>
                      <td><code>{user.customerId}</code></td>
                      <td><span className="provider-badge">{user.provider}</span></td>
                      <td><span className="plan-badge">{user.plan}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {formatInr(user.packPrice)}
                      </td>
                      <td style={{ fontSize: '.82rem', color: user.lastRechargedAt ? 'var(--green)' : 'var(--text)' }}>
                        {user.lastRechargedAt
                          ? new Date(user.lastRechargedAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td>
                        {confirmId === user.id ? (
                          // already showing confirm row below — hide button
                          null
                        ) : (
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => { setConfirmId(user.id); setDeleteError(null) }}
                            disabled={deletingId === user.id}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* ── Inline confirm row ── */}
                    {confirmId === user.id && (
                      <tr key={`confirm-${user.id}`} className="confirm-row">
                        <td colSpan={7}>
                          <div className="confirm-box">
                            <span className="confirm-box__icon">⚠️</span>
                            <span className="confirm-box__text">
                              Delete <strong>{user.name}</strong> (ID: {user.customerId})?
                              This will remove all their data permanently.
                            </span>
                            <div className="confirm-box__actions">
                              <button
                                type="button"
                                className="app-button app-button--danger"
                                onClick={() => handleDelete(user)}
                                disabled={deletingId === user.id}
                              >
                                {deletingId === user.id ? 'Deleting…' : 'Yes, delete'}
                              </button>
                              <button
                                type="button"
                                className="app-button"
                                onClick={() => setConfirmId(null)}
                                disabled={deletingId === user.id}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

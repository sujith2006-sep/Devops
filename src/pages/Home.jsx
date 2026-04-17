import { useEffect, useMemo, useState } from 'react'
import { getCatalog, getCustomization, postCustomize, postRecharge } from '../services/api.js'

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

function calcAddOnTotal(channelNames, allChannels) {
  let sum = 0
  for (const name of channelNames) {
    const row = allChannels.find((c) => c.name === name)
    if (row) sum += Number(row.price)
  }
  return sum
}

export default function Home({ authUser, onLogout }) {
  const [view, setView] = useState('dashboard')

  const [catalog, setCatalog] = useState(null)
  const [catalogError, setCatalogError] = useState(null)

  // ── committed (saved) customization ──────────────────────────
  // savedChannels = Set of channel names the user has subscribed & saved
  const [savedChannels, setSavedChannels] = useState(new Set())

  // ── in-progress customize selections ─────────────────────────
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedChannels, setSelectedChannels] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  // ── recharge ──────────────────────────────────────────────────
  const [paid, setPaid] = useState(false)
  const [lastRechargedAt, setLastRechargedAt] = useState(
    authUser?.lastRechargedAt ?? null
  )

  useEffect(() => {
    getCatalog()
      .then((data) => setCatalog(data))
      .catch((e) => setCatalogError(e instanceof Error ? e.message : 'Failed to load catalog'))
  }, [])

  // Load previously saved customization from DB on mount
  useEffect(() => {
    const id = String(authUser?.customerId ?? authUser?.id ?? '')
    if (!id) return
    getCustomization(id)
      .then(({ customization }) => {
        if (customization?.channels?.length) {
          setSavedChannels(new Set(customization.channels.map((c) => c.name)))
        }
      })
      .catch(() => {})
  }, [])

  const packPrice = Number(authUser?.packPrice ?? 0)

  // Add-on total for the SAVED customization (used on dashboard + recharge)
  const savedAddOnTotal = useMemo(
    () => calcAddOnTotal(savedChannels, catalog?.channels ?? []),
    [savedChannels, catalog]
  )
  const rechargeTotal = packPrice + savedAddOnTotal

  // Saved channel objects (for display in recharge)
  const savedChannelObjects = useMemo(() => {
    if (!catalog?.channels) return []
    return catalog.channels.filter((c) => savedChannels.has(c.name))
  }, [catalog, savedChannels])

  // Add-on total for what's currently ticked in customize view
  const addOnTotal = useMemo(
    () => calcAddOnTotal(selectedChannels, catalog?.channels ?? []),
    [selectedChannels, catalog]
  )

  const categories = useMemo(() => {
    if (!catalog?.channels) return ['All']
    const cats = [...new Set(catalog.channels.map((c) => c.category).filter(Boolean))]
    return ['All', ...cats]
  }, [catalog])

  const filteredChannels = useMemo(() => {
    if (!catalog?.channels) return []
    return catalog.channels.filter((ch) => {
      const matchCat = activeCategory === 'All' || ch.category === activeCategory
      const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [catalog, activeCategory, search])

  function openCustomize() {
    // Pre-populate selection from last saved state so user sees their subscriptions
    setSelectedChannels(new Set(savedChannels))
    setSearch('')
    setActiveCategory('All')
    setSaveMsg(null)
    setView('customize')
  }

  function toggleChannel(name) {
    setSelectedChannels((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
    setSaveMsg(null)
  }

  async function handlePay() {
    const id = String(authUser.customerId ?? authUser.id)
    try {
      const res = await postRecharge(id)
      if (res?.lastRechargedAt) setLastRechargedAt(res.lastRechargedAt)
    } catch {
      // payment UI still succeeds even if stamp fails
    }
    setPaid(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveMsg(null)
    try {
      await postCustomize({
        id: String(authUser.customerId ?? authUser.id),
        selectedChannels: [...selectedChannels],
        addons: [],
      })
      // Commit selected channels as the new saved state
      setSavedChannels(new Set(selectedChannels))
      setSaveMsg('Saved successfully!')
      setTimeout(() => setView('dashboard'), 900)
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // ── DASHBOARD ──────────────────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <div className="shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Subscriber</p>
            <h1>Hello, {authUser?.name}</h1>
          </div>
          <button type="button" className="app-button" onClick={onLogout}>
            Sign out
          </button>
        </header>

        <section className="app-card">
          <h2>Account Details</h2>
          <dl className="detail-grid">
            <div><dt>Customer ID</dt><dd>{authUser?.customerId}</dd></div>
            <div><dt>Name</dt><dd>{authUser?.name}</dd></div>
            <div><dt>Provider</dt><dd>{authUser?.provider}</dd></div>
            <div><dt>Plan</dt><dd>{authUser?.plan}</dd></div>
            <div>
              <dt>Base Pack</dt>
              <dd className="app-price">{formatInr(packPrice)}</dd>
            </div>
            {savedChannels.size > 0 && (
              <>
                <div>
                  <dt>Add-on Channels</dt>
                  <dd className="app-price">+{formatInr(savedAddOnTotal)}</dd>
                </div>
                <div>
                  <dt>Total Monthly</dt>
                  <dd className="app-price recharge-amount">{formatInr(rechargeTotal)}</dd>
                </div>
              </>
            )}
            {lastRechargedAt && (
              <div>
                <dt>Last Recharged</dt>
                <dd className="recharge-date">
                  {new Date(lastRechargedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  <span className="recharge-time">
                    {' '}
                    {new Date(lastRechargedAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </dd>
              </div>
            )}
          </dl>

          {savedChannels.size > 0 && (
            <div className="subscribed-channels">
              <p className="subscribed-channels__label">
                Subscribed channels ({savedChannels.size})
              </p>
              <div className="subscribed-tags">
                {savedChannelObjects.map((ch) => (
                  <span key={ch.id} className="sub-tag">
                    {ch.name}
                    <span className="sub-tag__price">{formatInr(ch.price)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="action-row">
          <button
            type="button"
            className="app-button app-button--primary action-btn"
            onClick={openCustomize}
          >
            {savedChannels.size > 0 ? 'Edit Customization' : 'Customize Plan'}
          </button>
          <button
            type="button"
            className="app-button action-btn"
            onClick={() => { setView('recharge'); setPaid(false) }}
          >
            Recharge
          </button>
        </div>
      </div>
    )
  }

  // ── CUSTOMIZE ──────────────────────────────────────────────────
  if (view === 'customize') {
    return (
      <div className="shell">
        <header className="page-header">
          <div>
            <button type="button" className="back-link" onClick={() => setView('dashboard')}>
              ← Back
            </button>
            <h1>Customize Plan</h1>
          </div>
          <button type="button" className="app-button" onClick={onLogout}>
            Sign out
          </button>
        </header>

        {catalogError && (
          <p className="app-message app-message--error" role="alert">{catalogError}</p>
        )}

        <input
          className="app-input search-input"
          type="search"
          placeholder="Search channels…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-tab ${activeCategory === cat ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {cat !== 'All' && (
                <span className="cat-tab__count">
                  {(catalog?.channels ?? []).filter(
                    (c) => c.category === cat && selectedChannels.has(c.name)
                  ).length > 0
                    ? ` ·${(catalog?.channels ?? []).filter(
                        (c) => c.category === cat && selectedChannels.has(c.name)
                      ).length}`
                    : ''}
                </span>
              )}
            </button>
          ))}
        </div>

        {!catalog && !catalogError && <p className="app-hint">Loading channels…</p>}

        {catalog && (
          <section className="app-card">
            {filteredChannels.length === 0 ? (
              <p className="app-hint">No channels match your search.</p>
            ) : (
              <ul className="app-checklist">
                {filteredChannels.map((ch) => {
                  const isSubscribed = savedChannels.has(ch.name)
                  const isSelected = selectedChannels.has(ch.name)
                  return (
                    <li key={ch.id}>
                      <label className={`app-check app-check--row ${isSubscribed && !isSelected ? 'channel--unsub' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleChannel(ch.name)}
                        />
                        <span className="app-check__label">
                          {ch.name}
                          {isSubscribed && (
                            <span className="subscribed-badge">subscribed</span>
                          )}
                        </span>
                        <span className="channel-cat">{ch.category}</span>
                        <span className="app-check__price">{formatInr(ch.price)}/mo</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}

        <section className="app-card">
          <h2>Bill Summary</h2>
          <ul className="app-pricing-lines">
            <li>
              <span>Base pack ({authUser?.plan})</span>
              <span>{formatInr(packPrice)}</span>
            </li>
            <li>
              <span>Add-on channels ({selectedChannels.size})</span>
              <span>{formatInr(addOnTotal)}</span>
            </li>
            <li className="app-pricing-lines__total">
              <span>Total</span>
              <span>{formatInr(packPrice + addOnTotal)}</span>
            </li>
          </ul>
        </section>

        <div className="app-actions">
          <button
            type="button"
            className="app-button app-button--primary"
            onClick={handleSave}
            disabled={saving || !catalog}
          >
            {saving ? 'Saving…' : 'Save Customization'}
          </button>
          {saveMsg && (
            <span className={saveMsg === 'Saved successfully!' ? 'save-msg save-msg--ok' : 'save-msg save-msg--err'}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>
    )
  }

  // ── RECHARGE ───────────────────────────────────────────────────
  return (
    <div className="shell">
      <header className="page-header">
        <div>
          <button type="button" className="back-link" onClick={() => setView('dashboard')}>
            ← Back
          </button>
          <h1>Recharge</h1>
        </div>
        <button type="button" className="app-button" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <section className="app-card">
        <h2>Payment Summary</h2>
        <dl className="detail-grid">
          <div><dt>Customer</dt><dd>{authUser?.name}</dd></div>
          <div><dt>Customer ID</dt><dd>{authUser?.customerId}</dd></div>
          <div><dt>Provider</dt><dd>{authUser?.provider}</dd></div>
          <div><dt>Plan</dt><dd>{authUser?.plan}</dd></div>
        </dl>

        <ul className="app-pricing-lines recharge-breakdown">
          <li>
            <span>Base pack ({authUser?.plan})</span>
            <span>{formatInr(packPrice)}</span>
          </li>
          {savedChannelObjects.length > 0 && (
            <>
              <li className="recharge-breakdown__subheader">
                <span>Add-on channels ({savedChannelObjects.length})</span>
                <span>{formatInr(savedAddOnTotal)}</span>
              </li>
              {savedChannelObjects.map((ch) => (
                <li key={ch.id} className="recharge-breakdown__channel">
                  <span>{ch.name}</span>
                  <span>{formatInr(ch.price)}/mo</span>
                </li>
              ))}
            </>
          )}
          <li className="app-pricing-lines__total">
            <span>Total Amount Due</span>
            <span>{formatInr(rechargeTotal)}</span>
          </li>
        </ul>
      </section>

      {!paid ? (
        <div className="app-actions">
          <button
            type="button"
            className="app-button app-button--primary pay-btn"
            onClick={handlePay}
          >
            Pay {formatInr(rechargeTotal)}
          </button>
        </div>
      ) : (
        <section className="app-card pay-success">
          <span className="pay-success__icon">✓</span>
          <p>Payment of {formatInr(rechargeTotal)} successful!</p>
          <button
            type="button"
            className="app-button app-button--primary"
            onClick={() => setView('dashboard')}
          >
            Back to Dashboard
          </button>
        </section>
      )}
    </div>
  )
}

import { API_BASE_URL } from '../config.js'

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof data.message === 'string' ? data.message : `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}

/**
 * GET /api/catalog — channels and addons with prices
 */
export function getCatalog() {
  return request('/api/catalog')
}

/**
 * POST /api/auth/login
 * @param {{ role: string, identifier: string }} body
 */
export function loginUser(body) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * POST /api/auth/register
 * @param {{ customerId: string, name: string, provider: string, planId: number }} body
 */
export function registerUser(body) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * GET /api/users
 */
export function listUsers() {
  return request('/api/users')
}

/**
 * GET /api/user/:id
 * @param {string} id
 */
export function getUser(id) {
  return request(`/api/user/${encodeURIComponent(id)}`)
}

/**
 * POST /api/customize
 * @param {{ id: string, planId?: number, selectedChannels: string[], addons: string[] }} body
 */
export function postCustomize(body) {
  return request('/api/customize', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * DELETE /api/user/:id — delete a subscriber and all their data
 * @param {string} id  customer_id or numeric id
 */
export function deleteUser(id) {
  return request(`/api/user/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/**
 * GET /api/customization/:id — latest saved channels for a user
 * @param {string} id  customer_id or numeric id
 */
export function getCustomization(id) {
  return request(`/api/customization/${encodeURIComponent(id)}`)
}

/**
 * POST /api/recharge — stamps last_recharged_at for the user
 * @param {string} id  customer_id or numeric id
 */
export function postRecharge(id) {
  return request('/api/recharge', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

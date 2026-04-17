/**
 * API base URL.
 * - Empty string: use same origin + Vite proxy (`/api` → http://localhost:5000) in dev.
 * - Set VITE_API_URL in `.env` for production (e.g. http://localhost:5000).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

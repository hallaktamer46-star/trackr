// Points to Railway in production, local Express server in development
const API_BASE = import.meta.env.PROD
  ? 'https://trackr-production-68cd.up.railway.app'
  : ''

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  return res
}

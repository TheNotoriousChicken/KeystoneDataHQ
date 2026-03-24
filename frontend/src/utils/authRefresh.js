let _accessToken = null

// Initialize from a token the app already has (e.g., after login)
export function initAccessToken(token) {
  _accessToken = token
}

// Basic in-memory access token getter
export function getAccessToken() {
  return _accessToken
}

// Refresh token flow via cookie-based endpoint
export async function refreshTokenIfNeeded() {
  try {
    const res = await fetch('/api/auth/refresh', { credentials: 'include' })
    if (!res.ok) return false
    const data = await res.json()
    if (data?.token) {
      _accessToken = data.token
    }
    // browser cookie is updated by the server response (new refresh cookie)
    return true
  } catch {
    return false
  }
}

export async function authorizedFetch(input, init = {}) {
  // Ensure headers exist
  const headers = new Headers(init.headers || {})
  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const merged = { ...init, headers }
  let response = await fetch(input, merged)
  if (response.status !== 401) return response
  // Try to refresh once and retry
  const refreshed = await refreshTokenIfNeeded()
  if (!refreshed) return response
  // Retry with new token
  const token2 = getAccessToken()
  if (token2) headers.set('Authorization', `Bearer ${token2}`)
  const retry = { ...init, headers }
  response = await fetch(input, retry)
  return response
}

export default { initAccessToken: initAccessToken, authorizedFetch, refreshTokenIfNeeded, getAccessToken }

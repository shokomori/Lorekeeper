const BASE = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN_KEY = 'lorekeeper:token'

function normalizeApiError(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallbackMessage
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    })

    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`
      let apiError = ''
      try {
        const body = await response.json()
        if (body?.error) {
          apiError = body.error
          message = apiError
        }
      } catch {
        // Keep the status message when the server does not return JSON.
      }

      if (!apiError && response.status === 401) {
        message = 'Your session has expired. Please sign in again.'
      } else if (!apiError && response.status === 403) {
        message = 'You do not have permission to do that.'
      } else if (!apiError && response.status === 404) {
        message = 'The requested record could not be found.'
      } else if (!apiError && response.status === 409) {
        message = 'This record already exists.'
      } else if (!apiError && response.status >= 500) {
        message = 'The server is temporarily unavailable. Please try again in a moment.'
      }

      throw new Error(message)
    }

    const body = response.status === 204 ? null : await response.json()
    if (body?.token) localStorage.setItem(TOKEN_KEY, body.token)
    return body
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the server. Please check your connection and try again.')
    }
    throw new Error(normalizeApiError(error, 'Something went wrong while processing your request.'))
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export const getCurrentUser = () => request('/api/auth/me')

export const updateProfile = (name, email) =>
  request('/api/auth/me', { method: 'PUT', body: JSON.stringify({ name, email }) })

export const changePassword = (currentPassword, newPassword, confirmPassword) =>
  request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  })

export const login = (identifier, password) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })

export const register = (name, username, email, password) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, username, email, password }) })

export const listCampaigns = () => request('/api/campaigns')

export const createCampaign = (input) =>
  request('/api/campaigns', { method: 'POST', body: JSON.stringify(input) })

export const updateCampaign = (id, input) =>
  request(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteCampaign = (id) =>
  request(`/api/campaigns/${id}`, { method: 'DELETE' })

export const listNpcs = (campaignId) =>
  request(`/api/campaigns/${campaignId}/npcs`)

export const createNpc = (campaignId, input) =>
  request(`/api/campaigns/${campaignId}/npcs`, { method: 'POST', body: JSON.stringify(input) })

export const updateNpc = (campaignId, id, input) =>
  request(`/api/campaigns/${campaignId}/npcs/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteNpc = (campaignId, id) =>
  request(`/api/campaigns/${campaignId}/npcs/${id}`, { method: 'DELETE' })

export const listLocations = (campaignId) =>
  request(`/api/campaigns/${campaignId}/locations`)

export const createLocation = (campaignId, input) =>
  request(`/api/campaigns/${campaignId}/locations`, { method: 'POST', body: JSON.stringify(input) })

export const updateLocation = (campaignId, id, input) =>
  request(`/api/campaigns/${campaignId}/locations/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteLocation = (campaignId, id) =>
  request(`/api/campaigns/${campaignId}/locations/${id}`, { method: 'DELETE' })

export const listSessions = (campaignId) =>
  request(`/api/campaigns/${campaignId}/sessions`)

export const createSession = (campaignId, input) =>
  request(`/api/campaigns/${campaignId}/sessions`, { method: 'POST', body: JSON.stringify(input) })

export const updateSession = (campaignId, id, input) =>
  request(`/api/campaigns/${campaignId}/sessions/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteSession = (campaignId, id) =>
  request(`/api/campaigns/${campaignId}/sessions/${id}`, { method: 'DELETE' })

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // Keep the status message when the server does not return JSON.
    }
    throw new Error(message)
  }

  return response.status === 204 ? null : response.json()
}

export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const register = (name, email, password) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })

export const listCampaigns = (userId) => request(`/api/campaigns?userId=${userId}`)

export const createCampaign = (input) =>
  request('/api/campaigns', { method: 'POST', body: JSON.stringify(input) })

export const updateCampaign = (id, input) =>
  request(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteCampaign = (id, userId) =>
  request(`/api/campaigns/${id}?userId=${userId}`, { method: 'DELETE' })

export const listNpcs = (campaignId, userId) =>
  request(`/api/campaigns/${campaignId}/npcs?userId=${userId}`)

export const createNpc = (campaignId, input) =>
  request(`/api/campaigns/${campaignId}/npcs`, { method: 'POST', body: JSON.stringify(input) })

export const updateNpc = (campaignId, id, input) =>
  request(`/api/campaigns/${campaignId}/npcs/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteNpc = (campaignId, id, userId) =>
  request(`/api/campaigns/${campaignId}/npcs/${id}?userId=${userId}`, { method: 'DELETE' })

export const listLocations = (campaignId, userId) =>
  request(`/api/campaigns/${campaignId}/locations?userId=${userId}`)

export const createLocation = (campaignId, input) =>
  request(`/api/campaigns/${campaignId}/locations`, { method: 'POST', body: JSON.stringify(input) })

export const updateLocation = (campaignId, id, input) =>
  request(`/api/campaigns/${campaignId}/locations/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteLocation = (campaignId, id, userId) =>
  request(`/api/campaigns/${campaignId}/locations/${id}?userId=${userId}`, { method: 'DELETE' })

export const listSessions = (campaignId, userId) =>
  request(`/api/campaigns/${campaignId}/sessions?userId=${userId}`)

export const createSession = (campaignId, input) =>
  request(`/api/campaigns/${campaignId}/sessions`, { method: 'POST', body: JSON.stringify(input) })

export const updateSession = (campaignId, id, input) =>
  request(`/api/campaigns/${campaignId}/sessions/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteSession = (campaignId, id, userId) =>
  request(`/api/campaigns/${campaignId}/sessions/${id}?userId=${userId}`, { method: 'DELETE' })

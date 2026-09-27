const users = []
const campaigns = []
const npcs = []
const locations = []
const sessions = []
let idCounter = 1

function nextId() {
  return idCounter++
}

export function createUser({ name, email, passwordHash }) {
  const user = {
    id: nextId(),
    name,
    email: String(email).toLowerCase().trim(),
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  }
  users.push(user)
  return user
}

export function findUserByEmail(email) {
  const normalized = String(email).toLowerCase().trim()
  return users.find((user) => user.email === normalized) ?? null
}

export function findUserById(id) {
  return users.find((user) => Number(user.id) === Number(id)) ?? null
}

export function updateUserPassword(id, passwordHash) {
  const user = findUserById(id)
  if (user) user.password_hash = passwordHash
  return user
}

export function updateUserProfile({ userId, name, email }) {
  const user = findUserById(userId)
  if (!user) return null
  user.name = String(name || '').trim() || user.name
  user.email = String(email || '').trim().toLowerCase()
  return user
}

export function listPlaintextUsers() {
  return users.filter((user) => user.password_hash && !user.password_hash.startsWith('$2'))
}

export function listCampaigns(userId) {
  return campaigns.filter((campaign) => Number(campaign.user_id) === Number(userId))
}

export function getCampaignForUser({ campaignId, userId }) {
  return campaigns.find(
    (campaign) => Number(campaign.id) === Number(campaignId) && Number(campaign.user_id) === Number(userId)
  ) ?? null
}

export function createCampaign({ userId, name, description }) {
  const campaign = {
    id: nextId(),
    user_id: Number(userId),
    name: String(name || '').trim(),
    description: String(description || '').trim(),
    created_at: new Date().toISOString(),
  }
  campaigns.push(campaign)
  return campaign
}

export function updateCampaign({ campaignId, userId, name, description }) {
  const campaign = getCampaignForUser({ campaignId, userId })
  if (!campaign) return null

  campaign.name = String(name || '').trim() || campaign.name
  campaign.description = String(description ?? campaign.description).trim()
  return campaign
}

export function deleteCampaign({ campaignId, userId }) {
  const index = campaigns.findIndex(
    (campaign) => Number(campaign.id) === Number(campaignId) && Number(campaign.user_id) === Number(userId)
  )

  if (index === -1) return false
  campaigns.splice(index, 1)
  return true
}

export function listNpcs(campaignId) {
  return npcs.filter((npc) => Number(npc.campaign_id) === Number(campaignId))
}

export function getNpcById(id) {
  return npcs.find((npc) => Number(npc.id) === Number(id)) ?? null
}

export function createNpc({ campaignId, name, description, role, notes, imageUrl }) {
  const npc = {
    id: nextId(),
    campaign_id: Number(campaignId),
    name: String(name || '').trim(),
    description: String(description || '').trim(),
    role: String(role || '').trim(),
    notes: String(notes || '').trim(),
    image_url: imageUrl || null,
    created_at: new Date().toISOString(),
  }
  npcs.push(npc)
  return npc
}

export function updateNpc({ npcId, campaignId, name, description, role, notes, imageUrl }) {
  const npc = npcs.find(
    (item) => Number(item.id) === Number(npcId) && Number(item.campaign_id) === Number(campaignId)
  )
  if (!npc) return null

  npc.name = String(name || '').trim() || npc.name
  npc.description = String(description ?? npc.description).trim()
  npc.role = String(role ?? npc.role).trim()
  npc.notes = String(notes ?? npc.notes).trim()
  npc.image_url = imageUrl ?? npc.image_url
  return npc
}

export function deleteNpc({ npcId, campaignId }) {
  const index = npcs.findIndex(
    (npc) => Number(npc.id) === Number(npcId) && Number(npc.campaign_id) === Number(campaignId)
  )
  if (index === -1) return false
  npcs.splice(index, 1)
  return true
}

export function listLocations(campaignId) {
  return locations.filter((location) => Number(location.campaign_id) === Number(campaignId))
}

export function getLocationById(id) {
  return locations.find((location) => Number(location.id) === Number(id)) ?? null
}

export function createLocation({ campaignId, name, description, notes, imageUrl }) {
  const location = {
    id: nextId(),
    campaign_id: Number(campaignId),
    name: String(name || '').trim(),
    description: String(description || '').trim(),
    notes: String(notes || '').trim(),
    image_url: imageUrl || null,
    created_at: new Date().toISOString(),
  }
  locations.push(location)
  return location
}

export function updateLocation({ locationId, campaignId, name, description, notes, imageUrl }) {
  const location = locations.find(
    (item) => Number(item.id) === Number(locationId) && Number(item.campaign_id) === Number(campaignId)
  )
  if (!location) return null

  location.name = String(name || '').trim() || location.name
  location.description = String(description ?? location.description).trim()
  location.notes = String(notes ?? location.notes).trim()
  location.image_url = imageUrl ?? location.image_url
  return location
}

export function deleteLocation({ locationId, campaignId }) {
  const index = locations.findIndex(
    (location) => Number(location.id) === Number(locationId) && Number(location.campaign_id) === Number(campaignId)
  )
  if (index === -1) return false
  locations.splice(index, 1)
  return true
}

export function listSessions(campaignId) {
  return sessions.filter((session) => Number(session.campaign_id) === Number(campaignId))
}

export function getSessionById(id) {
  return sessions.find((session) => Number(session.id) === Number(id)) ?? null
}

export function createSession({ campaignId, title, date, recap }) {
  const session = {
    id: nextId(),
    campaign_id: Number(campaignId),
    title: String(title || '').trim(),
    date: date || new Date().toISOString().slice(0, 10),
    recap: String(recap || '').trim(),
    created_at: new Date().toISOString(),
  }
  sessions.push(session)
  return session
}

export function updateSession({ sessionId, campaignId, title, date, recap }) {
  const session = sessions.find(
    (item) => Number(item.id) === Number(sessionId) && Number(item.campaign_id) === Number(campaignId)
  )
  if (!session) return null

  session.title = String(title || '').trim() || session.title
  session.date = date || session.date
  session.recap = String(recap ?? session.recap).trim()
  return session
}

export function deleteSession({ sessionId, campaignId }) {
  const index = sessions.findIndex(
    (session) => Number(session.id) === Number(sessionId) && Number(session.campaign_id) === Number(campaignId)
  )
  if (index === -1) return false
  sessions.splice(index, 1)
  return true
}

export function attachSessionNpc({ sessionId, npcId }) {
  const session = getSessionById(sessionId)
  const npc = getNpcById(npcId)
  if (!session || !npc) return null
  return { session_id: Number(sessionId), npc_id: Number(npcId) }
}

export function attachSessionLocation({ sessionId, locationId }) {
  const session = getSessionById(sessionId)
  const location = getLocationById(locationId)
  if (!session || !location) return null
  return { session_id: Number(sessionId), location_id: Number(locationId) }
}

export function listSessionNpcs(sessionId) {
  return npcs.filter((npc) => {
    const linked = sessionId != null && Number(npc.session_id) === Number(sessionId)
    return linked
  })
}

export function listSessionLocations(sessionId) {
  return locations.filter((location) => {
    const linked = sessionId != null && Number(location.session_id) === Number(sessionId)
    return linked
  })
}

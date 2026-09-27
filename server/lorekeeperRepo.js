export async function findUserByEmail(pool, email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase().trim()]
  )
  return result.rows[0] ?? null
}

export async function findUserById(pool, id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1 LIMIT 1',
    [id]
  )
  return result.rows[0] ?? null
}

export async function updateUserPassword(pool, id, passwordHash) {
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
    [passwordHash, id]
  )
  return result.rows[0] ?? null
}

export async function updateUserProfile(pool, { userId, name, email }) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2
     WHERE id = $3
     RETURNING id, name, email`,
    [name.trim(), email.trim().toLowerCase(), userId]
  )
  return result.rows[0] ?? null
}

export async function listPlaintextUsers(pool) {
  const result = await pool.query(
    `SELECT id, password_hash
     FROM users
     WHERE password_hash IS NOT NULL
       AND password_hash NOT LIKE '$2%'`
  )
  return result.rows
}

export async function createUser(pool, { name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name.trim(), email.toLowerCase().trim(), passwordHash]
  )
  return result.rows[0]
}

export async function listCampaigns(pool, userId) {
  const result = await pool.query(
    `SELECT *
     FROM campaigns
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )
  return result.rows
}

export async function getCampaignForUser(pool, { campaignId, userId }) {
  const result = await pool.query(
    `SELECT *
     FROM campaigns
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [campaignId, userId]
  )
  return result.rows[0] ?? null
}

export async function createCampaign(pool, { userId, name, description }) {
  const result = await pool.query(
    `INSERT INTO campaigns (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, name.trim(), description?.trim() || '']
  )
  return result.rows[0]
}

export async function updateCampaign(pool, { campaignId, userId, name, description }) {
  const result = await pool.query(
    `UPDATE campaigns
     SET name = $1, description = $2
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [name.trim(), description?.trim() || '', campaignId, userId]
  )
  return result.rows[0] ?? null
}

export async function deleteCampaign(pool, { campaignId, userId }) {
  const result = await pool.query(
    'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
    [campaignId, userId]
  )
  return result.rowCount > 0
}

export async function listNpcs(pool, campaignId) {
  const result = await pool.query(
    `SELECT *
     FROM npcs
     WHERE campaign_id = $1
     ORDER BY created_at DESC`,
    [campaignId]
  )
  return result.rows
}

export async function getNpcById(pool, id) {
  const result = await pool.query('SELECT * FROM npcs WHERE id = $1 LIMIT 1', [id])
  return result.rows[0] ?? null
}

export async function createNpc(pool, { campaignId, name, description, role, notes, imageUrl }) {
  const result = await pool.query(
    `INSERT INTO npcs (campaign_id, name, description, role, notes, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [campaignId, name.trim(), description?.trim() || '', role?.trim() || '', notes?.trim() || '', imageUrl?.trim() || null]
  )
  return result.rows[0]
}

export async function updateNpc(pool, { npcId, campaignId, name, description, role, notes, imageUrl }) {
  const result = await pool.query(
    `UPDATE npcs
     SET name = $1,
         description = $2,
         role = $3,
         notes = $4,
         image_url = $5
     WHERE id = $6 AND campaign_id = $7
     RETURNING *`,
    [name.trim(), description?.trim() || '', role?.trim() || '', notes?.trim() || '', imageUrl?.trim() || null, npcId, campaignId]
  )
  return result.rows[0] ?? null
}

export async function deleteNpc(pool, { npcId, campaignId }) {
  const result = await pool.query(
    'DELETE FROM npcs WHERE id = $1 AND campaign_id = $2 RETURNING id',
    [npcId, campaignId]
  )
  return result.rowCount > 0
}

export async function listLocations(pool, campaignId) {
  const result = await pool.query(
    `SELECT *
     FROM locations
     WHERE campaign_id = $1
     ORDER BY created_at DESC`,
    [campaignId]
  )
  return result.rows
}

export async function getLocationById(pool, id) {
  const result = await pool.query('SELECT * FROM locations WHERE id = $1 LIMIT 1', [id])
  return result.rows[0] ?? null
}

export async function createLocation(pool, { campaignId, name, description, notes, imageUrl }) {
  const result = await pool.query(
    `INSERT INTO locations (campaign_id, name, description, notes, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [campaignId, name.trim(), description?.trim() || '', notes?.trim() || '', imageUrl?.trim() || null]
  )
  return result.rows[0]
}

export async function updateLocation(pool, { locationId, campaignId, name, description, notes, imageUrl }) {
  const result = await pool.query(
    `UPDATE locations
     SET name = $1,
         description = $2,
         notes = $3,
         image_url = $4
     WHERE id = $5 AND campaign_id = $6
     RETURNING *`,
    [name.trim(), description?.trim() || '', notes?.trim() || '', imageUrl?.trim() || null, locationId, campaignId]
  )
  return result.rows[0] ?? null
}

export async function deleteLocation(pool, { locationId, campaignId }) {
  const result = await pool.query(
    'DELETE FROM locations WHERE id = $1 AND campaign_id = $2 RETURNING id',
    [locationId, campaignId]
  )
  return result.rowCount > 0
}

export async function listSessions(pool, campaignId) {
  const result = await pool.query(
    `SELECT id, campaign_id, title,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        recap, created_at
     FROM sessions
     WHERE campaign_id = $1
     ORDER BY date DESC, created_at DESC`,
    [campaignId]
  )
  return result.rows
}

export async function getSessionById(pool, id) {
  const result = await pool.query(
    `SELECT sessions.*, TO_CHAR(date, 'YYYY-MM-DD') AS date
     FROM sessions
     WHERE id = $1
     LIMIT 1`,
    [id]
  )
  return result.rows[0] ?? null
}

export async function createSession(pool, { campaignId, title, date, recap }) {
  const result = await pool.query(
    `INSERT INTO sessions (campaign_id, title, date, recap)
     VALUES ($1, $2, $3, $4)
     RETURNING id, campaign_id, title, TO_CHAR(date, 'YYYY-MM-DD') AS date, recap, created_at`,
    [campaignId, title.trim(), date || new Date().toISOString().slice(0, 10), recap?.trim() || '']
  )
  return result.rows[0]
}

export async function updateSession(pool, { sessionId, campaignId, title, date, recap }) {
  const result = await pool.query(
    `UPDATE sessions
     SET title = $1,
         date = $2,
         recap = $3
     WHERE id = $4 AND campaign_id = $5
     RETURNING id, campaign_id, title, TO_CHAR(date, 'YYYY-MM-DD') AS date, recap, created_at`,
    [title.trim(), date || new Date().toISOString().slice(0, 10), recap?.trim() || '', sessionId, campaignId]
  )
  return result.rows[0] ?? null
}

export async function deleteSession(pool, { sessionId, campaignId }) {
  const result = await pool.query(
    'DELETE FROM sessions WHERE id = $1 AND campaign_id = $2 RETURNING id',
    [sessionId, campaignId]
  )
  return result.rowCount > 0
}

export async function attachSessionNpc(pool, { sessionId, npcId }) {
  const result = await pool.query(
    `INSERT INTO session_npcs (session_id, npc_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [sessionId, npcId]
  )
  return result.rows[0] ?? null
}

export async function attachSessionLocation(pool, { sessionId, locationId }) {
  const result = await pool.query(
    `INSERT INTO session_locations (session_id, location_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [sessionId, locationId]
  )
  return result.rows[0] ?? null
}

export async function listSessionNpcs(pool, sessionId) {
  const result = await pool.query(
    `SELECT n.*
     FROM session_npcs sn
     JOIN npcs n ON n.id = sn.npc_id
     WHERE sn.session_id = $1`,
    [sessionId]
  )
  return result.rows
}

export async function listSessionLocations(pool, sessionId) {
  const result = await pool.query(
    `SELECT l.*
     FROM session_locations sl
     JOIN locations l ON l.id = sl.location_id
     WHERE sl.session_id = $1`,
    [sessionId]
  )
  return result.rows
}

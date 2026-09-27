import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFile } from 'node:fs/promises'
import { pool } from './db/pool.js'
import * as postgresRepo from './lorekeeperRepo.js'
import * as localRepo from './localStore.js'

const app = express()
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'lorekeeper-development-secret')

if (!jwtSecret) throw new Error('JWT_SECRET is required in production')

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

const allowedOrigins = (process.env.CORS_ORIGINS || defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => origin.endsWith('/') ? origin.slice(0, -1) : origin)
  .filter((origin, index, list) => list.indexOf(origin) === index)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
}))
app.use(express.json({ limit: '200kb' }))

function issueToken(user) {
  return jwt.sign({ sub: String(user.id) }, jwtSecret, { expiresIn: '7d' })
}

function requireAuth(request, response, next) {
  const header = request.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return response.status(401).json({ error: 'Authentication required.' })

  try {
    const payload = jwt.verify(token, jwtSecret)
    const userId = parseId(payload.sub)
    if (!userId) return response.status(401).json({ error: 'Invalid authentication token.' })
    request.userId = userId
    next()
  } catch {
    response.status(401).json({ error: 'Invalid or expired authentication token.' })
  }
}

let activeRepo = localRepo
let usingPostgres = false
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

async function initializeDatabaseSchema() {
  try {
    const schemaSql = await readFile(new URL('./db/schema.sql', import.meta.url), 'utf8')
    await pool.query(schemaSql)
    console.log('Database schema verified')
  } catch (error) {
    console.error('Database schema initialization failed:', error.message)
    throw error
  }
}

async function initializeRepo() {
  try {
    await initializeDatabaseSchema()
    await pool.query('SELECT 1')
    activeRepo = Object.fromEntries(
      Object.entries(postgresRepo).map(([name, method]) => [
        name,
        (...args) => method(pool, ...args),
      ])
    )
    usingPostgres = true
    const legacyUsers = await activeRepo.listPlaintextUsers()
    for (const user of legacyUsers) {
      await activeRepo.updateUserPassword(user.id, await bcrypt.hash(user.password_hash, 12))
    }
    if (legacyUsers.length) console.log(`Migrated ${legacyUsers.length} legacy password(s)`)
    console.log('Using PostgreSQL repository')
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('PostgreSQL is required in production:', error.code || 'NO_CODE', error.message)
      throw error
    }
    activeRepo = localRepo
    usingPostgres = false
    console.error('PostgreSQL unavailable:', error.code || 'NO_CODE', error.message)
    console.log('Using local in-memory repository fallback')
  }
}

await initializeRepo()

app.get('/healthz', (request, response) => {
  response.json({ ok: true, app: 'lorekeeper', repo: usingPostgres ? 'postgres' : 'local' })
})

app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up', repo: 'postgres' })
  } catch (error) {
    response.status(503).json({ ok: false, db: 'down', repo: 'local' })
  }
})

function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body?.[field]
    return value === undefined || value === null || `${value}`.trim() === ''
  })
  return missing
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value) {
  return typeof value === 'string' && emailPattern.test(value.trim())
}

function validatePassword(value) {
  return typeof value === 'string' && value.trim().length >= 8
}

function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function sendInvalidId(response, ...values) {
  return values.some((value) => value === null)
    ? response.status(400).json({ error: 'IDs must be positive integers.' })
    : null
}

app.post('/api/auth/register', async (request, response, next) => {
  try {
    const { name, email, password } = request.body ?? {}
    const missing = requireFields({ name, email, password }, ['name', 'email', 'password'])

    if (missing.length) {
      return response.status(400).json({ error: `${missing.join(', ')} is required` })
    }

    const trimmedName = String(name).trim()
    const trimmedEmail = String(email).trim().toLowerCase()
    if (!trimmedName) {
      return response.status(400).json({ error: 'Name is required.' })
    }
    if (!validateEmail(trimmedEmail)) {
      return response.status(400).json({ error: 'Please enter a valid email address.' })
    }
    if (!validatePassword(password)) {
      return response.status(400).json({ error: 'Password must be at least 8 characters long.' })
    }

    const existing = await activeRepo.findUserByEmail(trimmedEmail)
    if (existing) {
      return response.status(409).json({ error: 'An account with that email already exists.' })
    }

    const user = await activeRepo.createUser({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: await bcrypt.hash(password, 12),
    })

    response.status(201).json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const { email, password } = request.body ?? {}
    const missing = requireFields({ email, password }, ['email', 'password'])

    if (missing.length) {
      return response.status(400).json({ error: `${missing.join(', ')} is required` })
    }

    const trimmedEmail = String(email).trim().toLowerCase()
    if (!validateEmail(trimmedEmail)) {
      return response.status(400).json({ error: 'Please enter a valid email address.' })
    }

    const user = await activeRepo.findUserByEmail(trimmedEmail)
    if (!user) {
      return response.status(401).json({ error: 'Incorrect email or password.' })
    }

    const isHash = typeof user.password_hash === 'string' && user.password_hash.startsWith('$2')
    const valid = isHash ? await bcrypt.compare(password, user.password_hash) : user.password_hash === password
    if (!valid) return response.status(401).json({ error: 'Incorrect email or password.' })
    if (!isHash) await activeRepo.updateUserPassword(user.id, await bcrypt.hash(password, 12))

    response.json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', requireAuth, async (request, response, next) => {
  try {
    const user = await activeRepo.findUserById(request.userId)
    if (!user) return response.status(404).json({ error: 'User not found.' })
    response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    next(error)
  }
})

app.put('/api/auth/me', requireAuth, async (request, response, next) => {
  try {
    const { name, email } = request.body ?? {}
    const trimmedName = String(name ?? '').trim()
    const trimmedEmail = String(email ?? '').trim().toLowerCase()

    if (!trimmedName) return response.status(400).json({ error: 'Name is required.' })
    if (!validateEmail(trimmedEmail)) return response.status(400).json({ error: 'Please enter a valid email address.' })

    const currentUser = await activeRepo.findUserById(request.userId)
    if (!currentUser) return response.status(404).json({ error: 'User not found.' })

    const existing = await activeRepo.findUserByEmail(trimmedEmail)
    if (existing && existing.id !== request.userId) {
      return response.status(409).json({ error: 'An account with that email already exists.' })
    }

    const updated = await activeRepo.updateUserProfile({
      userId: request.userId,
      name: trimmedName,
      email: trimmedEmail,
    })
    if (!updated) return response.status(404).json({ error: 'User not found.' })

    response.json({ user: { id: updated.id, name: updated.name, email: updated.email } })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/change-password', requireAuth, async (request, response, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = request.body ?? {}
    if (!currentPassword || !newPassword || !confirmPassword) {
      return response.status(400).json({ error: 'Current password, new password, and confirmation are required.' })
    }
    if (!validatePassword(newPassword)) {
      return response.status(400).json({ error: 'New password must be at least 8 characters long.' })
    }
    if (newPassword !== confirmPassword) {
      return response.status(400).json({ error: 'New password confirmation does not match.' })
    }

    const user = await activeRepo.findUserById(request.userId)
    if (!user || !user.password_hash) return response.status(401).json({ error: 'This account does not support password changes.' })

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) {
      return response.status(401).json({ error: 'Current password is incorrect.' })
    }

    await activeRepo.updateUserPassword(user.id, await bcrypt.hash(newPassword, 12))
    response.json({ success: true, message: 'Password updated successfully.' })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/google', async (request, response, next) => {
  try {
    const { accessToken } = request.body ?? {}
    if (!accessToken || !supabaseUrl || !supabaseAnonKey) {
      return response.status(400).json({ error: 'Google authentication is not configured.' })
    }

    const supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!supabaseResponse.ok) return response.status(401).json({ error: 'Google session is invalid or expired.' })

    const profile = await supabaseResponse.json()
    const email = profile.email?.toLowerCase().trim()
    if (!email) return response.status(400).json({ error: 'Google did not provide an email address.' })

    let user = await activeRepo.findUserByEmail(email)
    if (!user) {
      user = await activeRepo.createUser({
        name: profile.user_metadata?.full_name || profile.user_metadata?.name || email.split('@')[0],
        email,
        passwordHash: null,
      })
    }

    response.json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    next(error)
  }
})

app.use('/api/campaigns', requireAuth)

app.get('/api/campaigns', async (request, response, next) => {
  try {
    response.json(await activeRepo.listCampaigns(request.userId))
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:id', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: request.params.id,
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(campaign)
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns', async (request, response, next) => {
  try {
    const { name, description } = request.body ?? {}
    const missing = requireFields({ name }, ['name'])

    if (missing.length) {
      return response.status(400).json({ error: `${missing.join(', ')} is required` })
    }

    const campaign = await activeRepo.createCampaign({
      userId: request.userId,
      name,
      description,
    })

    response.status(201).json(campaign)
  } catch (error) {
    next(error)
  }
})

app.put('/api/campaigns/:id', async (request, response, next) => {
  try {
    const { name, description } = request.body ?? {}

    const campaign = await activeRepo.updateCampaign({
      campaignId: Number(request.params.id),
      userId: request.userId,
      name,
      description,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(campaign)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/campaigns/:id', async (request, response, next) => {
  try {
    const removed = await activeRepo.deleteCampaign({
      campaignId: Number(request.params.id),
      userId: request.userId,
    })

    if (!removed) return response.status(404).json({ error: 'Campaign not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:campaignId/npcs', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(await activeRepo.listNpcs(Number(request.params.campaignId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns/:campaignId/npcs', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })

    const { name, description, role, notes, imageUrl } = request.body ?? {}
    const missing = requireFields({ name }, ['name'])
    if (missing.length) return response.status(400).json({ error: `${missing.join(', ')} is required` })
    const npc = await activeRepo.createNpc({
      campaignId: Number(request.params.campaignId),
      name,
      description,
      role,
      notes,
      imageUrl,
    })

    response.status(201).json(npc)
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:campaignId/locations', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(await activeRepo.listLocations(Number(request.params.campaignId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns/:campaignId/locations', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })

    const { name, description, notes, imageUrl } = request.body ?? {}
    const missing = requireFields({ name }, ['name'])
    if (missing.length) return response.status(400).json({ error: `${missing.join(', ')} is required` })
    const location = await activeRepo.createLocation({
      campaignId: Number(request.params.campaignId),
      name,
      description,
      notes,
      imageUrl,
    })

    response.status(201).json(location)
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:campaignId/sessions', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(await activeRepo.listSessions(Number(request.params.campaignId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns/:campaignId/sessions', async (request, response, next) => {
  try {
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId: request.userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })

    const { title, date, recap } = request.body ?? {}
    const missing = requireFields({ title }, ['title'])
    if (missing.length) return response.status(400).json({ error: `${missing.join(', ')} is required` })
    const session = await activeRepo.createSession({
      campaignId: Number(request.params.campaignId),
      title,
      date,
      recap,
    })

    response.status(201).json(session)
  } catch (error) {
    next(error)
  }
})

app.put('/api/campaigns/:campaignId/npcs/:npcId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const npcId = parseId(request.params.npcId)
    const invalid = sendInvalidId(response, campaignId, npcId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId: request.userId })) return response.status(404).json({ error: 'Campaign not found' })
    const { name, description, role, notes, imageUrl } = request.body ?? {}
    const missing = requireFields({ name }, ['name'])
    if (missing.length) return response.status(400).json({ error: `${missing.join(', ')} is required` })
    const npc = await activeRepo.updateNpc({ npcId, campaignId, name, description, role, notes, imageUrl })
    if (!npc) return response.status(404).json({ error: 'NPC not found' })
    response.json(npc)
  } catch (error) { next(error) }
})

app.delete('/api/campaigns/:campaignId/npcs/:npcId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const npcId = parseId(request.params.npcId)
    const invalid = sendInvalidId(response, campaignId, npcId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId: request.userId })) return response.status(404).json({ error: 'Campaign not found' })
    if (!await activeRepo.deleteNpc({ npcId, campaignId })) return response.status(404).json({ error: 'NPC not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.put('/api/campaigns/:campaignId/locations/:locationId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const locationId = parseId(request.params.locationId)
    const invalid = sendInvalidId(response, campaignId, locationId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId: request.userId })) return response.status(404).json({ error: 'Campaign not found' })
    const { name, description, notes, imageUrl } = request.body ?? {}
    const missing = requireFields({ name }, ['name'])
    if (missing.length) return response.status(400).json({ error: `${missing.join(', ')} is required` })
    const location = await activeRepo.updateLocation({ locationId, campaignId, name, description, notes, imageUrl })
    if (!location) return response.status(404).json({ error: 'Location not found' })
    response.json(location)
  } catch (error) { next(error) }
})

app.delete('/api/campaigns/:campaignId/locations/:locationId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const locationId = parseId(request.params.locationId)
    const invalid = sendInvalidId(response, campaignId, locationId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId: request.userId })) return response.status(404).json({ error: 'Campaign not found' })
    if (!await activeRepo.deleteLocation({ locationId, campaignId })) return response.status(404).json({ error: 'Location not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.put('/api/campaigns/:campaignId/sessions/:sessionId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const sessionId = parseId(request.params.sessionId)
    const invalid = sendInvalidId(response, campaignId, sessionId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId: request.userId })) return response.status(404).json({ error: 'Campaign not found' })
    const { title, date, recap } = request.body ?? {}
    const missing = requireFields({ title }, ['title'])
    if (missing.length) return response.status(400).json({ error: `${missing.join(', ')} is required` })
    const session = await activeRepo.updateSession({ sessionId, campaignId, title, date, recap })
    if (!session) return response.status(404).json({ error: 'Session not found' })
    response.json(session)
  } catch (error) { next(error) }
})

app.delete('/api/campaigns/:campaignId/sessions/:sessionId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const sessionId = parseId(request.params.sessionId)
    const invalid = sendInvalidId(response, campaignId, sessionId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId: request.userId })) return response.status(404).json({ error: 'Campaign not found' })
    if (!await activeRepo.deleteSession({ sessionId, campaignId })) return response.status(404).json({ error: 'Session not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})

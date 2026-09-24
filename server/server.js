import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as postgresRepo from './lorekeeperRepo.js'
import * as localRepo from './localStore.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '200kb' }))

let activeRepo = localRepo
let usingPostgres = false
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

async function initializeRepo() {
  try {
    await pool.query('SELECT 1')
    activeRepo = Object.fromEntries(
      Object.entries(postgresRepo).map(([name, method]) => [
        name,
        (...args) => method(pool, ...args),
      ])
    )
    usingPostgres = true
    console.log('Using PostgreSQL repository')
  } catch (error) {
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

    const existing = await activeRepo.findUserByEmail(email)
    if (existing) {
      return response.status(409).json({ error: 'An account with that email already exists.' })
    }

    const user = await activeRepo.createUser({
      name,
      email,
      passwordHash: password,
    })

    response.status(201).json({ user: { id: user.id, name: user.name, email: user.email } })
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

    const user = await activeRepo.findUserByEmail(email)
    if (!user || user.password_hash !== password) {
      return response.status(401).json({ error: 'Invalid email or password.' })
    }

    response.json({ user: { id: user.id, name: user.name, email: user.email } })
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

    response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns', async (request, response, next) => {
  try {
    const userId = Number(request.query.userId ?? 1)
    response.json(await activeRepo.listCampaigns(userId))
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:id', async (request, response, next) => {
  try {
    const userId = Number(request.query.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: request.params.id,
      userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(campaign)
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns', async (request, response, next) => {
  try {
    const { name, description, userId } = request.body ?? {}
    const missing = requireFields({ name, userId }, ['name', 'userId'])

    if (missing.length) {
      return response.status(400).json({ error: `${missing.join(', ')} is required` })
    }

    const campaign = await activeRepo.createCampaign({
      userId: Number(userId),
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
    const userId = Number(request.body?.userId ?? 1)
    const { name, description } = request.body ?? {}

    const campaign = await activeRepo.updateCampaign({
      campaignId: Number(request.params.id),
      userId,
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
    const userId = Number(request.query.userId ?? 1)
    const removed = await activeRepo.deleteCampaign({
      campaignId: Number(request.params.id),
      userId,
    })

    if (!removed) return response.status(404).json({ error: 'Campaign not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:campaignId/npcs', async (request, response, next) => {
  try {
    const userId = Number(request.query.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(await activeRepo.listNpcs(Number(request.params.campaignId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns/:campaignId/npcs', async (request, response, next) => {
  try {
    const userId = Number(request.body?.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId,
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
    const userId = Number(request.query.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(await activeRepo.listLocations(Number(request.params.campaignId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns/:campaignId/locations', async (request, response, next) => {
  try {
    const userId = Number(request.body?.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId,
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
    const userId = Number(request.query.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId,
    })

    if (!campaign) return response.status(404).json({ error: 'Campaign not found' })
    response.json(await activeRepo.listSessions(Number(request.params.campaignId)))
  } catch (error) {
    next(error)
  }
})

app.post('/api/campaigns/:campaignId/sessions', async (request, response, next) => {
  try {
    const userId = Number(request.body?.userId ?? 1)
    const campaign = await activeRepo.getCampaignForUser({
      campaignId: Number(request.params.campaignId),
      userId,
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
    const userId = parseId(request.body?.userId)
    const invalid = sendInvalidId(response, campaignId, npcId, userId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId })) return response.status(404).json({ error: 'Campaign not found' })
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
    const userId = parseId(request.query.userId)
    const invalid = sendInvalidId(response, campaignId, npcId, userId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId })) return response.status(404).json({ error: 'Campaign not found' })
    if (!await activeRepo.deleteNpc({ npcId, campaignId })) return response.status(404).json({ error: 'NPC not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.put('/api/campaigns/:campaignId/locations/:locationId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const locationId = parseId(request.params.locationId)
    const userId = parseId(request.body?.userId)
    const invalid = sendInvalidId(response, campaignId, locationId, userId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId })) return response.status(404).json({ error: 'Campaign not found' })
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
    const userId = parseId(request.query.userId)
    const invalid = sendInvalidId(response, campaignId, locationId, userId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId })) return response.status(404).json({ error: 'Campaign not found' })
    if (!await activeRepo.deleteLocation({ locationId, campaignId })) return response.status(404).json({ error: 'Location not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.put('/api/campaigns/:campaignId/sessions/:sessionId', async (request, response, next) => {
  try {
    const campaignId = parseId(request.params.campaignId)
    const sessionId = parseId(request.params.sessionId)
    const userId = parseId(request.body?.userId)
    const invalid = sendInvalidId(response, campaignId, sessionId, userId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId })) return response.status(404).json({ error: 'Campaign not found' })
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
    const userId = parseId(request.query.userId)
    const invalid = sendInvalidId(response, campaignId, sessionId, userId)
    if (invalid) return invalid
    if (!await activeRepo.getCampaignForUser({ campaignId, userId })) return response.status(404).json({ error: 'Campaign not found' })
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

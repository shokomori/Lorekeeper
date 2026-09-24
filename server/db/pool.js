import pg from 'pg'

const fallbackDatabaseUrl = 'postgresql://postgres:devpassword@localhost:5432/lorekeeper'
const connectionString = process.env.DATABASE_URL || fallbackDatabaseUrl

// A local PostgreSQL has no TLS configured. Every managed host requires it and
// presents a certificate chain Node does not trust out of the box, which is why
// rejectUnauthorized is false: the connection is still encrypted, it is just not
// verifying who is on the other end. That is the standard tradeoff for a
// student project. If your host publishes a CA certificate, pass it as
// ssl: { ca: readFileSync('ca.pem') } instead and say so in your journal.
const isLocal =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1')

export const pool = new pg.Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (error) => {
  console.error('Unexpected database pool error:', error.message)
})

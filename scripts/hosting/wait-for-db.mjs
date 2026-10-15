// Attend que PostgreSQL accepte les connexions (jusqu'à 60 s).
import pg from 'pg'

const deadline = Date.now() + 60_000
for (;;) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.end()
    break
  }
  catch {
    await client.end().catch(() => {})
    if (Date.now() > deadline) {
      console.error('PostgreSQL ne répond pas.')
      process.exit(1)
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

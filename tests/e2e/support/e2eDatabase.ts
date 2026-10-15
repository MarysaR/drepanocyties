/**
 * Accès direct à la base E2E dédiée (jamais la base de l'application).
 */
import pg from 'pg'

export const e2eDatabaseUrl = process.env.E2E_DATABASE_URL ?? 'postgresql://twin:twin_local_password@localhost:5432/twin_e2e'

export async function withE2eDatabase<T>(work: (client: pg.Client) => Promise<T>): Promise<T> {
  if (!new URL(e2eDatabaseUrl).pathname.includes('e2e')) throw new Error('La base E2E doit contenir « e2e » dans son nom.')
  const client = new pg.Client({ connectionString: e2eDatabaseUrl })
  await client.connect()
  const result = await work(client)
  await client.end()
  return result
}

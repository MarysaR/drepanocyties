/**
 * Critère d'acceptation : une installation neuve (migrations appliquées sur une base vide)
 * ne contient aucune donnée métier — ni compte, ni profil, ni contenu, ni consentement.
 */
import { execSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const adminUrl = new URL(process.env.TEST_DATABASE_URL!)
const freshDatabaseName = `twin_test_fresh_${randomBytes(4).toString('hex')}`
const freshUrl = new URL(adminUrl)
freshUrl.pathname = `/${freshDatabaseName}`

async function withClient<T>(url: URL, work: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: url.toString() })
  await client.connect()
  const result = await work(client)
  await client.end()
  return result
}

describe('Installation neuve', () => {
  beforeAll(async () => {
    await withClient(adminUrl, client => client.query(`CREATE DATABASE "${freshDatabaseName}"`))
    execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: freshUrl.toString() }, stdio: 'pipe' })
  }, 60_000)

  afterAll(async () => {
    await withClient(adminUrl, client => client.query(`DROP DATABASE IF EXISTS "${freshDatabaseName}"`))
  })

  it('crée toutes les tables métier, toutes vides', async () => {
    const counts = await withClient(freshUrl, async (client) => {
      const { rows: tables } = await client.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations' ORDER BY tablename`,
      )
      const result: Record<string, number> = {}
      for (const { tablename } of tables) {
        const { rows } = await client.query<{ count: string }>(`SELECT count(*) FROM "${tablename}"`)
        result[tablename] = Number(rows[0]?.count)
      }
      return result
    })

    expect(Object.keys(counts).sort()).toEqual([
      'consent_decisions', 'conversations', 'journal_entries', 'memories', 'memory_proposals',
      'memory_suppressions', 'messages', 'profiles', 'users',
    ])
    expect(Object.values(counts).every(count => count === 0)).toBe(true)
  })
})

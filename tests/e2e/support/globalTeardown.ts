/**
 * Vérifie que les tests ont bien effacé tous les comptes qu'ils ont créés,
 * puis laisse la base E2E vide quoi qu'il arrive.
 */
import { withE2eDatabase } from './e2eDatabase'

export default async function globalTeardown(): Promise<void> {
  const remaining = await withE2eDatabase(async (client) => {
    const { rows } = await client.query<{ count: string }>('SELECT count(*) FROM users')
    await client.query('TRUNCATE TABLE users CASCADE')
    return Number(rows[0]?.count ?? 0)
  })
  if (remaining > 0) throw new Error(`${remaining} compte(s) de test n'ont pas été nettoyés par les tests.`)
}

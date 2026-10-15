/**
 * Part d'une base E2E vide (base dédiée, distincte du développement et de la production).
 */
import { withE2eDatabase } from './e2eDatabase'

export default async function globalSetup(): Promise<void> {
  await withE2eDatabase(client => client.query('TRUNCATE TABLE users, ai_usage_records CASCADE'))
}

/**
 * Prépare la base de test dédiée : applique les migrations versionnées.
 * Refuse de s'exécuter sur une base dont le nom ne contient pas « test ».
 */
import { execSync } from 'node:child_process'

export default function setup(): void {
  const url = process.env.TEST_DATABASE_URL
  if (!url) throw new Error('TEST_DATABASE_URL est requis pour les tests d’intégration (base dédiée).')
  if (!new URL(url).pathname.includes('test')) throw new Error('TEST_DATABASE_URL doit désigner une base de test.')
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' })
}

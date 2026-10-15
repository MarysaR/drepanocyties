/**
 * Configuration Prisma : emplacement du schéma, des migrations
 * et URL de la base (lue depuis l'environnement).
 */
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // `prisma generate` n'a pas besoin de base : l'URL n'est exigée que par les commandes de migration.
  datasource: { url: process.env.DATABASE_URL ?? '' },
})

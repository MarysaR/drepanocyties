/**
 * Fabrique du client Prisma (adaptateur PostgreSQL), sans journalisation des requêtes
 * pour ne jamais exposer de données personnelles dans les logs.
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Prisma } from './generated/client'

export type DatabaseClient = PrismaClient

export function createPrismaClient(databaseUrl: string): DatabaseClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
    log: ['warn', 'error'],
  })
}

/** Client utilisable dans une transaction interactive. */
export type DatabaseTransaction = Prisma.TransactionClient

/**
 * Conteneur réel (Prisma + PostgreSQL) branché sur la base de test,
 * avec un modèle conversationnel scripté pour ne jamais appeler un service externe.
 */
import { randomBytes } from 'node:crypto'
import { createServerContainer } from '@composition/createServerContainer'
import { SONNET_5_5_PRICES } from '@domains/conversation/domain/services/AiCostEstimator'
import type { ConversationModel, TwinReplyRequest } from '@domains/conversation/application/ports/ConversationModel'
import { createPrismaClient } from '@shared/infrastructure/prisma/createPrismaClient'

export class ScriptedConversationModel implements ConversationModel {
  readonly requests: TwinReplyRequest[] = []
  nextSuggestions: string[] = []

  async generateReply(request: TwinReplyRequest) {
    this.requests.push(request)
    const memorySuggestions = this.nextSuggestions
    this.nextSuggestions = []
    return { content: 'Réponse scriptée.', memorySuggestions, model: 'scripted-model', usage: { inputTokens: 100, outputTokens: 50, cacheReadTokens: 0, cacheWriteTokens: 0 } }
  }
}

export function createTestContainer() {
  const databaseUrl = process.env.TEST_DATABASE_URL!
  const database = createPrismaClient(databaseUrl)
  const model = new ScriptedConversationModel()
  const container = createServerContainer({
    databaseUrl,
    dataEncryptionKey: randomBytes(32).toString('base64'),
    appBaseUrl: 'http://localhost:3000',
    anthropic: undefined,
    rateLimits: { perMinute: 100, perDay: 1000 },
    aiBudget: { limitMicroUsd: 5_000_000, prices: SONNET_5_5_PRICES },
    registrationLimit: undefined,
    auth0: undefined,
    testMode: false,
  }, { database, conversationModel: model })
  return { container, database, model }
}

export async function resetDatabase(database: ReturnType<typeof createPrismaClient>): Promise<void> {
  await database.$executeRawUnsafe('TRUNCATE TABLE users, ai_usage_records CASCADE')
}

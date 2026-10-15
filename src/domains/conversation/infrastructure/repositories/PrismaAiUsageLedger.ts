/**
 * Stockage PostgreSQL du registre de consommation de l'IA (compteurs uniquement).
 */
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { AiUsageLedger, AiUsageRecordDraft, AiUsageTotals } from '../../application/ports/AiUsageLedger'

export class PrismaAiUsageLedger implements AiUsageLedger {
  constructor(private readonly db: DatabaseClient) {}

  async record(draft: AiUsageRecordDraft): Promise<void> {
    await this.db.aiUsageRecord.create({
      data: {
        model: draft.model.slice(0, 64),
        inputTokens: draft.usage.inputTokens,
        outputTokens: draft.usage.outputTokens,
        cacheReadTokens: draft.usage.cacheReadTokens,
        cacheWriteTokens: draft.usage.cacheWriteTokens,
        costMicroUsd: draft.costMicroUsd,
      },
    })
  }

  async totals(): Promise<AiUsageTotals> {
    const { _count, _sum } = await this.db.aiUsageRecord.aggregate({
      _count: true,
      _sum: { costMicroUsd: true, inputTokens: true, outputTokens: true, cacheReadTokens: true, cacheWriteTokens: true },
    })
    return {
      requestCount: _count,
      costMicroUsd: _sum.costMicroUsd ?? 0,
      inputTokens: _sum.inputTokens ?? 0,
      outputTokens: _sum.outputTokens ?? 0,
      cacheReadTokens: _sum.cacheReadTokens ?? 0,
      cacheWriteTokens: _sum.cacheWriteTokens ?? 0,
    }
  }
}

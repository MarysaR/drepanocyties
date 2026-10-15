/**
 * Résume la consommation estimée de l'IA par rapport au plafond configuré.
 */
import { microUsdToUsd } from '../../domain/services/AiCostEstimator'
import type { AiUsageSummaryDto } from '../dto/AiUsageDto'
import type { AiUsageLedger } from '../ports/AiUsageLedger'

export class GetAiUsageSummaryUseCase {
  constructor(private readonly ledger: AiUsageLedger, private readonly budgetMicroUsd: number) {}

  async execute(): Promise<AiUsageSummaryDto> {
    const totals = await this.ledger.totals()
    return {
      requestCount: totals.requestCount,
      spentUsd: microUsdToUsd(totals.costMicroUsd),
      budgetUsd: microUsdToUsd(this.budgetMicroUsd),
      remainingUsd: microUsdToUsd(Math.max(0, this.budgetMicroUsd - totals.costMicroUsd)),
      inputTokens: totals.inputTokens + totals.cacheReadTokens + totals.cacheWriteTokens,
      outputTokens: totals.outputTokens,
      cacheReadTokens: totals.cacheReadTokens,
    }
  }
}

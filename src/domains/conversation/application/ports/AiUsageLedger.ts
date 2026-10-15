/**
 * Registre de consommation de l'IA : uniquement des compteurs (jamais de contenu
 * ni d'identité), qui alimentent le garde-fou de budget.
 */
import type { TokenUsage } from '../../domain/value-objects/TokenUsage'

export interface AiUsageRecordDraft {
  readonly model: string
  readonly usage: TokenUsage
  readonly costMicroUsd: number
}

export interface AiUsageTotals {
  readonly requestCount: number
  readonly costMicroUsd: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
}

export interface AiUsageLedger {
  record(draft: AiUsageRecordDraft): Promise<void>
  totals(): Promise<AiUsageTotals>
}

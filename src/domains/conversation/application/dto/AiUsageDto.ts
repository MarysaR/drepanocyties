/**
 * Résumé de consommation de l'IA affiché à la personne (estimation).
 */
export interface AiUsageSummaryDto {
  readonly requestCount: number
  readonly spentUsd: number
  readonly budgetUsd: number
  readonly remainingUsd: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
}

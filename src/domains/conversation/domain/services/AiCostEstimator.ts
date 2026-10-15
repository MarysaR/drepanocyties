/**
 * Estimation du coût d'un appel à partir des tokens consommés et des tarifs configurés.
 * Ce n'est qu'une estimation : la facturation de référence reste celle du fournisseur.
 */
import type { TokenUsage } from '../value-objects/TokenUsage'

/** Tarifs en dollars US par million de tokens. */
export interface TokenPrices {
  readonly inputPerMillion: number
  readonly outputPerMillion: number
  readonly cacheReadPerMillion: number
  readonly cacheWritePerMillion: number
}

/** Tarifs publics de Claude Sonnet 5.5 (entrée 2 $, sortie 10 $, lecture de cache 0,20 $, écriture 1,25 × l'entrée). */
export const SONNET_5_5_PRICES: TokenPrices = {
  inputPerMillion: 2,
  outputPerMillion: 10,
  cacheReadPerMillion: 0.2,
  cacheWritePerMillion: 2.5,
}

/** Coût estimé en micro-dollars (1 $ = 1 000 000), arrondi à l'unité supérieure. */
export function estimateCostMicroUsd(usage: TokenUsage, prices: TokenPrices): number {
  const cost = usage.inputTokens * prices.inputPerMillion
    + usage.outputTokens * prices.outputPerMillion
    + usage.cacheReadTokens * prices.cacheReadPerMillion
    + usage.cacheWriteTokens * prices.cacheWritePerMillion
  return Math.ceil(cost)
}

export function microUsdToUsd(microUsd: number): number {
  return Math.round(microUsd) / 1_000_000
}

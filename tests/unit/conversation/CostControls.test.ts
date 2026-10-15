import { describe, expect, it } from 'vitest'
import { SONNET_5_5_PRICES, estimateCostMicroUsd, microUsdToUsd } from '@domains/conversation/domain/services/AiCostEstimator'
import { HISTORY_MAX_CHARACTERS, MEMORIES_MAX_COUNT, selectMemoriesForPrompt, selectRecentHistory } from '@domains/conversation/domain/services/PromptBudget'
import { GetAiUsageSummaryUseCase } from '@domains/conversation/application/use-cases/GetAiUsageSummaryUseCase'

describe('Estimation du coût (tarifs Sonnet 5.5)', () => {
  it('applique 2 $ / 10 $ par million de tokens en entrée et en sortie', () => {
    const cost = estimateCostMicroUsd({ inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 0, cacheWriteTokens: 0 }, SONNET_5_5_PRICES)
    expect(microUsdToUsd(cost)).toBe(12)
  })

  it('compte la lecture du cache à 0,20 $ et son écriture à 2,50 $ par million', () => {
    const cost = estimateCostMicroUsd({ inputTokens: 0, outputTokens: 0, cacheReadTokens: 1_000_000, cacheWriteTokens: 1_000_000 }, SONNET_5_5_PRICES)
    expect(microUsdToUsd(cost)).toBe(2.7)
  })

  it('arrondit toujours à l’unité supérieure (jamais de sous-estimation à zéro)', () => {
    expect(estimateCostMicroUsd({ inputTokens: 1, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }, SONNET_5_5_PRICES)).toBe(2)
  })
})

describe('Taille du prompt', () => {
  const message = (content: string) => ({ content })

  it('conserve les messages les plus récents dans la limite de caractères', () => {
    const messages = Array.from({ length: 10 }, (_, index) => message(`${index}`.repeat(500)))
    const selected = selectRecentHistory(messages, { maxMessages: 30, maxCharacters: 1600 })
    expect(selected).toEqual(messages.slice(-3))
  })

  it('conserve au plus le nombre de messages demandé', () => {
    const messages = Array.from({ length: 50 }, (_, index) => message(`m${index}`))
    expect(selectRecentHistory(messages, { maxMessages: 5, maxCharacters: HISTORY_MAX_CHARACTERS })).toHaveLength(5)
  })

  it('conserve toujours le dernier message, même très long', () => {
    expect(selectRecentHistory([message('court'), message('x'.repeat(5000))], { maxMessages: 30, maxCharacters: 100 })).toEqual([message('x'.repeat(5000))])
  })

  it('limite les souvenirs transmis en gardant les plus récents', () => {
    const memories = Array.from({ length: MEMORIES_MAX_COUNT + 10 }, (_, index) => `souvenir ${index}`)
    const selected = selectMemoriesForPrompt(memories)
    expect(selected).toHaveLength(MEMORIES_MAX_COUNT)
    expect(selected.at(-1)).toBe(memories.at(-1))
  })
})

describe('Résumé de consommation', () => {
  it('compare la dépense estimée au plafond configuré', async () => {
    const summary = await new GetAiUsageSummaryUseCase({
      record: async () => {},
      totals: async () => ({ requestCount: 3, costMicroUsd: 2_500_000, inputTokens: 1000, outputTokens: 500, cacheReadTokens: 200, cacheWriteTokens: 100 }),
    }, 12_000_000).execute()
    expect(summary).toMatchObject({ requestCount: 3, spentUsd: 2.5, budgetUsd: 12, remainingUsd: 9.5, outputTokens: 500 })
  })

  it('ne présente jamais un reste négatif', async () => {
    const summary = await new GetAiUsageSummaryUseCase({
      record: async () => {},
      totals: async () => ({ requestCount: 1, costMicroUsd: 13_000_000, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }),
    }, 12_000_000).execute()
    expect(summary.remainingUsd).toBe(0)
  })
})

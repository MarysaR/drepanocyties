/**
 * Consommation estimée de l'IA, comparée au plafond configuré.
 */
import { computed, ref } from 'vue'
import type { AiUsageSummaryDto } from '@domains/conversation/application/dto/AiUsageDto'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { aiUsageApi } from '../api/aiUsageApi'

const dollars = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

export function useAiUsage() {
  const summary = ref<AiUsageSummaryDto | null>(null)
  const { run, isPending, error } = useAsyncAction(aiUsageApi.summary)

  async function loadUsage(): Promise<void> {
    const result = await run()
    if (result.ok) summary.value = result.value
  }

  const spentLabel = computed(() => (summary.value ? dollars.format(summary.value.spentUsd) : ''))
  const budgetLabel = computed(() => (summary.value ? dollars.format(summary.value.budgetUsd) : ''))
  const usedPercent = computed(() => (summary.value ? Math.min(100, Math.round((summary.value.spentUsd / summary.value.budgetUsd) * 100)) : 0))

  return { summary, loadUsage, spentLabel, budgetLabel, usedPercent, isLoading: isPending, error }
}

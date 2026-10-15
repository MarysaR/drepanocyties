/**
 * Données du tableau de bord.
 */
import { ref } from 'vue'
import type { DashboardOverviewDto } from '@domains/dashboard/application/dto/DashboardDto'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { dashboardApi } from '../api/dashboardApi'

export function useDashboard() {
  const overview = ref<DashboardOverviewDto | null>(null)
  const { run, isPending, error } = useAsyncAction(dashboardApi.overview)

  async function loadOverview(): Promise<void> {
    const result = await run()
    if (result.ok) overview.value = result.value
  }

  return { overview, loadOverview, isLoading: isPending, error }
}

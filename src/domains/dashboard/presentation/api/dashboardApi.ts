/**
 * Client HTTP du tableau de bord.
 */
import type { DashboardOverviewDto } from '@domains/dashboard/application/dto/DashboardDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const dashboardApi = {
  overview: () => apiRequest<DashboardOverviewDto>('/api/dashboard'),
}

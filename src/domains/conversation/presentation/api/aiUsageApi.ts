/**
 * Client HTTP de la consommation de l'IA.
 */
import type { AiUsageSummaryDto } from '@domains/conversation/application/dto/AiUsageDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const aiUsageApi = {
  summary: () => apiRequest<AiUsageSummaryDto>('/api/ai-usage'),
}

/**
 * Client HTTP du domaine mémoire.
 */
import type { MemoryDto, MemoryOverviewDto } from '@domains/memory/application/dto/MemoryDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const memoryApi = {
  overview: () => apiRequest<MemoryOverviewDto>('/api/memories'),
  create: (content: string, sourceMessageId?: string) => apiRequest<MemoryDto>('/api/memories', 'POST', { content, sourceMessageId }),
  correct: (memoryId: string, content: string) => apiRequest<MemoryDto>(`/api/memories/${memoryId}`, 'PATCH', { content }),
  remove: (memoryId: string) => apiRequest<{ deleted: true }>(`/api/memories/${memoryId}`, 'DELETE'),
  acceptProposal: (proposalId: string, content?: string) => apiRequest<MemoryDto>(`/api/memory-proposals/${proposalId}/accept`, 'POST', { content }),
  rejectProposal: (proposalId: string) => apiRequest<{ rejected: true }>(`/api/memory-proposals/${proposalId}/reject`, 'POST'),
}

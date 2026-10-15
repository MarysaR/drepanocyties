/**
 * Client HTTP du domaine conversation.
 */
import type { ConversationDto, ConversationHistoryDto, SendMessageResultDto } from '@domains/conversation/application/dto/ConversationDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const conversationApi = {
  list: () => apiRequest<ConversationDto[]>('/api/conversations'),
  start: () => apiRequest<ConversationDto>('/api/conversations', 'POST'),
  history: (conversationId: string) => apiRequest<ConversationHistoryDto>(`/api/conversations/${conversationId}`),
  remove: (conversationId: string) => apiRequest<{ deleted: true }>(`/api/conversations/${conversationId}`, 'DELETE'),
  sendMessage: (conversationId: string, content: string) =>
    apiRequest<SendMessageResultDto>(`/api/conversations/${conversationId}/messages`, 'POST', { content }),
}

/**
 * Client HTTP du domaine journal.
 */
import type { JournalEntryDto, JournalEntryInput } from '@domains/journal/application/dto/JournalDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const journalApi = {
  list: () => apiRequest<JournalEntryDto[]>('/api/journal'),
  create: (input: JournalEntryInput) => apiRequest<JournalEntryDto>('/api/journal', 'POST', { ...input }),
  update: (entryId: string, input: JournalEntryInput) => apiRequest<JournalEntryDto>(`/api/journal/${entryId}`, 'PUT', { ...input }),
  remove: (entryId: string) => apiRequest<{ deleted: true }>(`/api/journal/${entryId}`, 'DELETE'),
}

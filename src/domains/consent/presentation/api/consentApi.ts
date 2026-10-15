/**
 * Client HTTP du domaine consentement.
 */
import type { ConsentStateDto, RecordConsentDecisionInput } from '@domains/consent/application/dto/ConsentDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const consentApi = {
  states: () => apiRequest<ConsentStateDto[]>('/api/consents'),
  record: (input: RecordConsentDecisionInput) => apiRequest<ConsentStateDto[]>('/api/consents', 'POST', { ...input }),
}

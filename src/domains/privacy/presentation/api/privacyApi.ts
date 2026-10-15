/**
 * Client HTTP du domaine confidentialité.
 */
import { apiRequest } from '@shared/presentation/http/apiClient'

export const PERSONAL_DATA_EXPORT_URL = '/api/privacy/export'

export const privacyApi = {
  eraseAll: (confirmation: string) => apiRequest<{ erased: true }>('/api/privacy/erase', 'POST', { confirmation }),
}

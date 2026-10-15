/**
 * Client HTTP du domaine identité.
 */
import { apiRequest } from '@shared/presentation/http/apiClient'

export const identityApi = {
  logout: () => apiRequest<{ redirectTo: string }>('/api/identity/logout', 'POST'),
  testLogin: (testIdentity: string) => apiRequest<{ ok: true }>('/api/identity/test-login', 'POST', { testIdentity }),
}

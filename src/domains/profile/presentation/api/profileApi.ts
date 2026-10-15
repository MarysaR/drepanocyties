/**
 * Client HTTP du domaine profil.
 */
import type { ProfileDto, UpdateProfileInput } from '@domains/profile/application/dto/ProfileDto'
import { apiRequest } from '@shared/presentation/http/apiClient'

export const profileApi = {
  get: () => apiRequest<ProfileDto>('/api/profile'),
  update: (input: UpdateProfileInput) => apiRequest<ProfileDto>('/api/profile', 'PUT', { ...input }),
}

/**
 * Accès au profil d'une personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { Profile } from '../../domain/entities/Profile'

export interface ProfileRepository {
  find(userId: UserId): Promise<Profile | undefined>
  save(profile: Profile): Promise<Profile>
}

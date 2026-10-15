/**
 * Retourne le profil de la personne, ou un profil vide par défaut.
 */
import type { UserId } from '@shared/domain/UserId'
import { defaultProfile } from '../../domain/entities/Profile'
import type { ProfileDto } from '../dto/ProfileDto'
import type { ProfileRepository } from '../ports/ProfileRepository'

export class GetProfileUseCase {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(userId: UserId): Promise<ProfileDto> {
    const { preferredName, aboutMe, replyLength } = (await this.profiles.find(userId)) ?? defaultProfile(userId)
    return { preferredName, aboutMe, replyLength }
  }
}

/**
 * Met à jour le profil et les préférences de la personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { ProfileDto, UpdateProfileInput } from '../dto/ProfileDto'
import type { ProfileRepository } from '../ports/ProfileRepository'

export class UpdateProfileUseCase {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(userId: UserId, input: UpdateProfileInput): Promise<ProfileDto> {
    const { preferredName, aboutMe, replyLength } = await this.profiles.save({ userId, ...input })
    return { preferredName, aboutMe, replyLength }
  }
}

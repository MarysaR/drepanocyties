/** Met à jour le profil et les préférences. */
import { updateProfileSchema } from '@domains/profile/application/dto/ProfileDto'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) =>
  container.profile.update.execute(userId, await readValidatedInput(event, updateProfileSchema)))

/** Crée un souvenir rédigé ou choisi par la personne. */
import { createMemorySchema } from '@domains/memory/application/dto/MemoryDto'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) =>
  container.memory.create.execute(userId, await readValidatedInput(event, createMemorySchema)))

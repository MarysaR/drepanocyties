/** Corrige le contenu d'un souvenir. */
import { correctMemorySchema } from '@domains/memory/application/dto/MemoryDto'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readIdParam, readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  const memoryId = readIdParam(event)
  const { content } = await readValidatedInput(event, correctMemorySchema)
  return container.memory.correct.execute(userId, { memoryId, content })
})

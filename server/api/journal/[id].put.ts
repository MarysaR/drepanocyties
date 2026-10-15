/** Modifie une entrée du journal. */
import { journalEntrySchema } from '@domains/journal/application/dto/JournalDto'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readIdParam, readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  const entryId = readIdParam(event)
  return container.journal.update.execute(userId, entryId, await readValidatedInput(event, journalEntrySchema))
})

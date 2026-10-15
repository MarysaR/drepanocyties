/** Ajoute une entrée au journal. */
import { journalEntrySchema } from '@domains/journal/application/dto/JournalDto'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) =>
  container.journal.create.execute(userId, await readValidatedInput(event, journalEntrySchema)))

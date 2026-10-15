/** Accepte une proposition de souvenir, éventuellement reformulée. */
import { acceptMemoryProposalSchema } from '@domains/memory/application/dto/MemoryDto'
import { defineApiRoute } from '../../../http/defineApiRoute'
import { readIdParam, readValidatedInput } from '../../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  const proposalId = readIdParam(event)
  const { content } = await readValidatedInput(event, acceptMemoryProposalSchema)
  return container.memory.acceptProposal.execute(userId, { proposalId, content })
})

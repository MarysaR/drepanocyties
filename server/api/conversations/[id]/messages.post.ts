/** Envoie un message au jumeau et retourne sa réponse. */
import { sendMessageSchema } from '@domains/conversation/application/dto/ConversationDto'
import { defineApiRoute } from '../../../http/defineApiRoute'
import { readIdParam, readValidatedInput } from '../../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  const conversationId = readIdParam(event)
  const { content } = await readValidatedInput(event, sendMessageSchema)
  return container.conversation.sendMessage.execute(userId, { conversationId, content })
})

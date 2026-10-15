/**
 * Conversation en cours : historique, brouillon et envoi d'un message.
 * En cas d'échec, le message n'est pas perdu : il revient dans le champ de saisie.
 */
import { ref } from 'vue'
import type { ConversationDto, MessageDto, SendMessageResultDto } from '@domains/conversation/application/dto/ConversationDto'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { conversationApi } from '../api/conversationApi'

export interface DisplayedMessage extends MessageDto {
  readonly pending?: boolean
}

export function useConversation(conversationId: string) {
  const conversation = ref<ConversationDto | null>(null)
  const messages = ref<DisplayedMessage[]>([])
  const draft = ref('')
  const loading = useAsyncAction(conversationApi.history)
  const sending = useAsyncAction(conversationApi.sendMessage)

  async function loadConversation(): Promise<void> {
    const result = await loading.run(conversationId)
    if (!result.ok) return
    conversation.value = result.value.conversation
    messages.value = result.value.messages
  }

  async function sendMessage(): Promise<SendMessageResultDto | undefined> {
    const content = draft.value.trim()
    if (!content || sending.isPending.value) return undefined

    const pendingMessage: DisplayedMessage = { id: `pending-${Date.now()}`, author: 'PERSON', content, createdAt: new Date().toISOString(), pending: true }
    messages.value = [...messages.value, pendingMessage]
    draft.value = ''

    const result = await sending.run(conversationId, content)
    messages.value = messages.value.filter(message => message.id !== pendingMessage.id)
    if (!result.ok) {
      draft.value = content
      return undefined
    }
    messages.value = [...messages.value, result.value.personMessage, result.value.twinMessage]
    return result.value
  }

  return {
    conversation,
    messages,
    draft,
    loadConversation,
    sendMessage,
    isLoading: loading.isPending,
    loadError: loading.error,
    isSending: sending.isPending,
    sendError: sending.error,
  }
}

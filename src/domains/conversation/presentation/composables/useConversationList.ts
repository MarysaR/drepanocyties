/**
 * Liste des conversations : chargement, création et suppression.
 */
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import type { ConversationDto } from '@domains/conversation/application/dto/ConversationDto'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { useDestructiveConfirmation } from '@shared/presentation/composables/useDestructiveConfirmation'
import { useNotifier } from '@shared/presentation/composables/useNotifier'
import { conversationApi } from '../api/conversationApi'

export function useConversationList() {
  const conversations = ref<ConversationDto[]>([])
  const loading = useAsyncAction(conversationApi.list)
  const starting = useAsyncAction(conversationApi.start)
  const removing = useAsyncAction(conversationApi.remove)
  const { confirmDestruction } = useDestructiveConfirmation()
  const { confirmSuccess } = useNotifier()

  async function loadConversations(): Promise<void> {
    const result = await loading.run()
    if (result.ok) conversations.value = result.value
  }

  async function startConversation(): Promise<void> {
    const result = await starting.run()
    if (result.ok) await navigateTo(`/conversations/${result.value.id}`)
  }

  async function deleteConversation(conversationId: string): Promise<void> {
    const confirmed = await confirmDestruction('Supprimer cette conversation et tous ses messages ? Les souvenirs que vous avez retenus sont conservés.')
    if (!confirmed) return
    const result = await removing.run(conversationId)
    if (!result.ok) return
    conversations.value = conversations.value.filter(conversation => conversation.id !== conversationId)
    confirmSuccess('Conversation supprimée')
  }

  return {
    conversations,
    loadConversations,
    startConversation,
    deleteConversation,
    isLoading: loading.isPending,
    isStarting: starting.isPending,
    error: computed(() => loading.error.value ?? starting.error.value ?? removing.error.value),
  }
}

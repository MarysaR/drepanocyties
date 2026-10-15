/**
 * Actions de mémoire depuis une conversation : décider des propositions
 * du jumeau et retenir l'un de ses propres messages.
 */
import { ref } from 'vue'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { useNotifier } from '@shared/presentation/composables/useNotifier'
import { memoryApi } from '../api/memoryApi'

export interface PendingProposal {
  readonly id: string
  readonly content: string
}

export function useConversationMemoryActions() {
  const proposals = ref<PendingProposal[]>([])
  const messageToRemember = ref<{ id: string; content: string } | null>(null)
  const { confirmSuccess } = useNotifier()

  const decision = useAsyncAction(async (operation: () => Promise<unknown>) => { await operation() })

  function addProposals(newProposals: readonly PendingProposal[]): void {
    proposals.value = [...proposals.value, ...newProposals]
  }

  function forgetProposal(proposalId: string): void {
    proposals.value = proposals.value.filter(proposal => proposal.id !== proposalId)
  }

  async function acceptProposal(proposalId: string, content?: string): Promise<void> {
    const result = await decision.run(() => memoryApi.acceptProposal(proposalId, content))
    if (!result.ok) return
    forgetProposal(proposalId)
    confirmSuccess('Souvenir retenu')
  }

  async function rejectProposal(proposalId: string): Promise<void> {
    const result = await decision.run(() => memoryApi.rejectProposal(proposalId))
    if (!result.ok) return
    forgetProposal(proposalId)
    confirmSuccess('Proposition refusée')
  }

  function openRememberDialog(message: { id: string; content: string }): void {
    decision.clearError()
    messageToRemember.value = message
  }

  function closeRememberDialog(): void {
    messageToRemember.value = null
  }

  async function rememberMessage(content: string): Promise<void> {
    const message = messageToRemember.value
    if (!message) return
    const result = await decision.run(() => memoryApi.create(content, message.id))
    if (!result.ok) return
    closeRememberDialog()
    confirmSuccess('Souvenir retenu')
  }

  return {
    proposals,
    messageToRemember,
    addProposals,
    acceptProposal,
    rejectProposal,
    openRememberDialog,
    closeRememberDialog,
    rememberMessage,
    isDeciding: decision.isPending,
    memoryError: decision.error,
  }
}

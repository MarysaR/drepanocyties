/**
 * Espace Souvenirs : consultation, ajout, correction, suppression
 * et décisions sur les propositions en attente.
 */
import { computed, ref } from 'vue'
import type { MemoryOverviewDto } from '@domains/memory/application/dto/MemoryDto'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { useDestructiveConfirmation } from '@shared/presentation/composables/useDestructiveConfirmation'
import { useNotifier } from '@shared/presentation/composables/useNotifier'
import { memoryApi } from '../api/memoryApi'

export function useMemories() {
  const overview = ref<MemoryOverviewDto>({ memoryEnabled: false, memories: [], proposals: [] })
  const newMemoryDraft = ref('')
  const { confirmSuccess } = useNotifier()
  const { confirmDestruction } = useDestructiveConfirmation()

  const loading = useAsyncAction(memoryApi.overview)
  const mutation = useAsyncAction(async (operation: () => Promise<unknown>) => {
    await operation()
    const refreshed = await memoryApi.overview()
    overview.value = refreshed
  })

  async function loadMemories(): Promise<void> {
    const result = await loading.run()
    if (result.ok) overview.value = result.value
  }

  async function mutate(operation: () => Promise<unknown>, successMessage: string): Promise<boolean> {
    const result = await mutation.run(operation)
    if (result.ok) confirmSuccess(successMessage)
    return result.ok
  }

  const correctMemory = (memoryId: string, content: string) => mutate(() => memoryApi.correct(memoryId, content), 'Souvenir corrigé')
  const acceptProposal = (proposalId: string, content?: string) => mutate(() => memoryApi.acceptProposal(proposalId, content), 'Souvenir retenu')
  const rejectProposal = (proposalId: string) => mutate(() => memoryApi.rejectProposal(proposalId), 'Proposition refusée')

  async function addMemory(content: string): Promise<void> {
    if (await mutate(() => memoryApi.create(content), 'Souvenir ajouté')) newMemoryDraft.value = ''
  }

  async function deleteMemory(memoryId: string): Promise<void> {
    const confirmed = await confirmDestruction('Supprimer définitivement ce souvenir ? Le jumeau ne pourra plus le reproposer.')
    if (confirmed) await mutate(() => memoryApi.remove(memoryId), 'Souvenir supprimé')
  }

  return {
    overview,
    newMemoryDraft,
    loadMemories,
    addMemory,
    correctMemory,
    deleteMemory,
    acceptProposal,
    rejectProposal,
    isLoading: loading.isPending,
    isMutating: mutation.isPending,
    error: computed(() => loading.error.value ?? mutation.error.value),
  }
}

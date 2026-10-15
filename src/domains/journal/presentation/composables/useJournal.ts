/**
 * Journal émotionnel : liste des entrées, création, modification et suppression.
 */
import { computed, ref } from 'vue'
import type { JournalEntryDto, JournalEntryInput } from '@domains/journal/application/dto/JournalDto'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { useDestructiveConfirmation } from '@shared/presentation/composables/useDestructiveConfirmation'
import { useNotifier } from '@shared/presentation/composables/useNotifier'
import { journalApi } from '../api/journalApi'

export function useJournal() {
  const entries = ref<JournalEntryDto[]>([])
  const editingEntryId = ref<string | null>(null)
  const loading = useAsyncAction(journalApi.list)
  const saving = useAsyncAction(async (operation: () => Promise<unknown>) => {
    await operation()
    entries.value = await journalApi.list()
  })
  const { confirmDestruction } = useDestructiveConfirmation()
  const { confirmSuccess } = useNotifier()

  async function loadEntries(): Promise<void> {
    const result = await loading.run()
    if (result.ok) entries.value = result.value
  }

  async function createEntry(input: JournalEntryInput): Promise<boolean> {
    const result = await saving.run(() => journalApi.create(input))
    if (result.ok) confirmSuccess('Entrée ajoutée au journal')
    return result.ok
  }

  async function updateEntry(entryId: string, input: JournalEntryInput): Promise<void> {
    const result = await saving.run(() => journalApi.update(entryId, input))
    if (!result.ok) return
    editingEntryId.value = null
    confirmSuccess('Entrée modifiée')
  }

  async function deleteEntry(entryId: string): Promise<void> {
    if (!(await confirmDestruction('Supprimer définitivement cette entrée du journal ?'))) return
    const result = await saving.run(() => journalApi.remove(entryId))
    if (result.ok) confirmSuccess('Entrée supprimée')
  }

  function startEditing(entryId: string): void {
    editingEntryId.value = entryId
  }

  function stopEditing(): void {
    editingEntryId.value = null
  }

  return {
    entries,
    editingEntryId,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    startEditing,
    stopEditing,
    isSaving: saving.isPending,
    error: computed(() => loading.error.value ?? saving.error.value),
  }
}

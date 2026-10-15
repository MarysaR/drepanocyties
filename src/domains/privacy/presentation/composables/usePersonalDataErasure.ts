/**
 * Effacement complet des données, confirmé par la saisie d'un mot-clé.
 */
import { computed, ref } from 'vue'
import { ERASURE_CONFIRMATION } from '@domains/privacy/application/dto/PersonalDataExport'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { privacyApi } from '../api/privacyApi'

export function usePersonalDataErasure() {
  const confirmation = ref('')
  const { run, isPending, error } = useAsyncAction(privacyApi.eraseAll)
  const canErase = computed(() => confirmation.value.trim() === ERASURE_CONFIRMATION)

  async function eraseAllData(): Promise<void> {
    if (!canErase.value) return
    const result = await run(confirmation.value)
    if (result.ok) window.location.assign('/?compte=supprime')
  }

  return { confirmation, canErase, eraseAllData, isErasing: isPending, error, keyword: ERASURE_CONFIRMATION }
}

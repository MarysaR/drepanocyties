/**
 * Formulaire de profil : chargement, édition locale et enregistrement.
 */
import { computed, reactive } from 'vue'
import type { ReplyLength } from '@domains/profile/domain/value-objects/ReplyLength'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { useNotifier } from '@shared/presentation/composables/useNotifier'
import { profileApi } from '../api/profileApi'

export function useProfile() {
  const form = reactive({ preferredName: '', aboutMe: '', replyLength: 'BALANCED' as ReplyLength })
  const loading = useAsyncAction(profileApi.get)
  const saving = useAsyncAction(profileApi.update)
  const { confirmSuccess } = useNotifier()

  async function loadProfile(): Promise<void> {
    const result = await loading.run()
    if (!result.ok) return
    form.preferredName = result.value.preferredName ?? ''
    form.aboutMe = result.value.aboutMe ?? ''
    form.replyLength = result.value.replyLength
  }

  async function saveProfile(): Promise<void> {
    const result = await saving.run({ preferredName: form.preferredName, aboutMe: form.aboutMe, replyLength: form.replyLength })
    if (result.ok) confirmSuccess('Profil enregistré')
  }

  return {
    form,
    loadProfile,
    saveProfile,
    isSaving: saving.isPending,
    error: computed(() => loading.error.value ?? saving.error.value),
  }
}

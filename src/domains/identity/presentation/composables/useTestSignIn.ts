/**
 * Connexion par identifiant de test (mode test local uniquement).
 */
import { ref } from 'vue'
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { identityApi } from '../api/identityApi'

export function useTestSignIn() {
  const testIdentity = ref('')
  const { run, isPending, error } = useAsyncAction(identityApi.testLogin)

  async function signIn(): Promise<void> {
    const result = await run(testIdentity.value.trim())
    if (result.ok) window.location.assign('/tableau-de-bord')
  }

  return { testIdentity, signIn, isSigningIn: isPending, signInError: error }
}

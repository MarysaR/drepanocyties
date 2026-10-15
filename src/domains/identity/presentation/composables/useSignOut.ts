/**
 * Déconnexion : termine la session serveur puis quitte l'application
 * (y compris la session Auth0 lorsque c'est le fournisseur utilisé).
 */
import { useAsyncAction } from '@shared/presentation/composables/useAsyncAction'
import { identityApi } from '../api/identityApi'

export function useSignOut() {
  const { run, isPending, error } = useAsyncAction(identityApi.logout)

  async function signOut(): Promise<void> {
    const result = await run()
    if (result.ok) window.location.assign(result.value.redirectTo)
  }

  return { signOut, isSigningOut: isPending, signOutError: error }
}

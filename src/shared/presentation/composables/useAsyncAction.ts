/**
 * État de chargement et d'erreur d'une action asynchrone, sans try/catch
 * dans les composants : la capture passe par catchError.
 */
import { readonly, ref } from 'vue'
import type { AppError } from '../../errors/AppError'
import { catchError, type Result } from '../../errors/catchError'

export function useAsyncAction<Args extends unknown[], T>(action: (...args: Args) => Promise<T>) {
  const isPending = ref(false)
  const error = ref<AppError | null>(null)

  function clearError(): void {
    error.value = null
  }

  async function run(...args: Args): Promise<Result<T>> {
    isPending.value = true
    error.value = null
    return catchError(() => action(...args), {
      onError: (failure) => { error.value = failure },
      onFinally: () => { isPending.value = false },
    })
  }

  return { run, clearError, isPending: readonly(isPending), error: readonly(error) }
}

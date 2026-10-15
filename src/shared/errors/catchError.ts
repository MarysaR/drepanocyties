/**
 * Capture centralisée des erreurs asynchrones : retourne un résultat explicite
 * (succès ou AppError) au lieu de try/catch dispersés, avec nettoyage garanti.
 */
import type { AppError } from './AppError'
import { normalizeError } from './normalizeError'

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AppError }

export interface CatchErrorOptions {
  /** Appelé avec l'erreur normalisée, par exemple pour journaliser ou mettre à jour un état. */
  readonly onError?: (error: AppError) => void
  /** Toujours exécuté, comme un bloc finally. */
  readonly onFinally?: () => void
}

export async function catchError<T>(
  operation: () => Promise<T> | T,
  options: CatchErrorOptions = {},
): Promise<Result<T>> {
  try {
    return { ok: true, value: await operation() }
  }
  catch (thrown) {
    const error = normalizeError(thrown)
    options.onError?.(error)
    return { ok: false, error }
  }
  finally {
    options.onFinally?.()
  }
}

/** Renvoie la valeur ou relance l'erreur normalisée : utile pour propager vers le contrôleur HTTP. */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value
  throw result.error
}

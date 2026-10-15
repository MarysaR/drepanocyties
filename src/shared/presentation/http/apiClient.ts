/**
 * Client HTTP commun aux clients API des domaines : même origine,
 * JSON, cookies de session transmis automatiquement.
 */
import { $fetch } from 'ofetch'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export function apiRequest<T>(path: string, method: HttpMethod = 'GET', body?: Record<string, unknown>): Promise<T> {
  return $fetch<T>(path, { method, body, credentials: 'same-origin', headers: { Accept: 'application/json' } })
}

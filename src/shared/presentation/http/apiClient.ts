/**
 * Client HTTP commun aux clients API des domaines : même origine, JSON, cookies de session
 * transmis automatiquement. Une session expirée ramène à l'accueil avec un message clair.
 */
import { $fetch } from 'ofetch'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function leaveExpiredSession(): void {
  if (window.location.pathname !== '/') window.location.assign('/?erreur=session')
}

export function apiRequest<T>(path: string, method: HttpMethod = 'GET', body?: Record<string, unknown>): Promise<T> {
  return $fetch<T>(path, {
    method,
    body,
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    onResponseError: ({ response }) => {
      if (response.status === 401) leaveExpiredSession()
    },
  })
}

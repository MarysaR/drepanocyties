/**
 * Traduit une AppError en réponse HTTP : statut adapté, message sûr,
 * journalisation des seules défaillances techniques (sans contenu personnel).
 */
import { createError, getRequestURL, setResponseHeader, type H3Event } from 'h3'
import type { AppError, AppErrorKind } from '@shared/errors/AppError'
import { RateLimitedError } from '@shared/errors/AppError'
import { serializeAppError } from '@shared/errors/normalizeError'
import { serverLogger } from '@shared/infrastructure/logging/logger'

const statusByKind: Record<AppErrorKind, number> = {
  domain: 409,
  validation: 422,
  not_found: 404,
  unauthenticated: 401,
  forbidden: 403,
  consent_required: 403,
  rate_limited: 429,
  technical: 500,
}

/** Les défaillances du fournisseur d'IA sont signalées en 503, le plafond de consommation en 429. */
function httpStatusFor(error: AppError): number {
  if (error.code === 'AI_BUDGET_EXHAUSTED') return 429
  if (error.kind === 'technical' && error.code.startsWith('AI_')) return 503
  return statusByKind[error.kind]
}

export function toHttpError(event: H3Event, error: AppError) {
  const statusCode = httpStatusFor(error)
  if (error.kind === 'technical') {
    serverLogger.failure('api_request_failed', error, { method: event.method, path: getRequestURL(event).pathname })
  }
  if (error instanceof RateLimitedError) setResponseHeader(event, 'Retry-After', error.retryAfterSeconds)
  return createError({ statusCode, statusMessage: error.code, message: error.message, data: serializeAppError(error) })
}

/**
 * Convertit n'importe quelle valeur levée en AppError,
 * y compris les réponses d'erreur HTTP reçues par le client.
 */
import {
  type AppError,
  ConsentRequiredError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  RateLimitedError,
  TechnicalError,
  UnauthenticatedError,
  ValidationError,
  isAppError,
  type AppErrorKind,
  type FieldIssue,
} from './AppError'

export interface SerializedAppError {
  readonly kind: AppErrorKind
  readonly code: string
  readonly message: string
  readonly issues?: readonly FieldIssue[]
  readonly consentType?: string
  readonly retryAfterSeconds?: number
}

export function serializeAppError(error: AppError): SerializedAppError {
  return {
    kind: error.kind,
    code: error.code,
    message: error.message,
    ...(error instanceof ValidationError ? { issues: error.issues } : {}),
    ...(error instanceof ConsentRequiredError ? { consentType: error.consentType } : {}),
    ...(error instanceof RateLimitedError ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
  }
}

export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error
  const serialized = extractSerializedError(error)
  if (serialized) return rebuildAppError(serialized, error)
  return new TechnicalError('UNEXPECTED_ERROR', { cause: error })
}

function extractSerializedError(error: unknown): SerializedAppError | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const candidate = (error as { data?: { data?: unknown } }).data?.data
  if (isSerializedAppError(candidate)) return candidate
  return undefined
}

function isSerializedAppError(value: unknown): value is SerializedAppError {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as SerializedAppError).kind === 'string'
    && typeof (value as SerializedAppError).code === 'string'
  )
}

class RemoteDomainError extends DomainError {}
class RemoteForbiddenError extends ForbiddenError {}

function rebuildAppError(serialized: SerializedAppError, cause: unknown): AppError {
  switch (serialized.kind) {
    case 'validation':
      return new ValidationError(serialized.message, serialized.issues ?? [])
    case 'not_found':
      return new NotFoundError(serialized.code.replace(/_NOT_FOUND$/, ''))
    case 'unauthenticated':
      return new UnauthenticatedError()
    case 'consent_required':
      return new ConsentRequiredError(serialized.consentType ?? 'UNKNOWN')
    case 'rate_limited':
      return new RateLimitedError(serialized.retryAfterSeconds ?? 60)
    case 'forbidden':
      return new RemoteForbiddenError(serialized.code, serialized.message)
    case 'domain':
      return new RemoteDomainError(serialized.code, serialized.message)
    case 'technical':
      return new TechnicalError(serialized.code, { cause })
  }
}

/**
 * Hiérarchie des erreurs applicatives : chaque erreur porte un type (kind)
 * permettant de distinguer erreurs métier, de validation et techniques.
 */
export type AppErrorKind =
  | 'domain'
  | 'validation'
  | 'not_found'
  | 'unauthenticated'
  | 'forbidden'
  | 'consent_required'
  | 'rate_limited'
  | 'technical'

export interface FieldIssue {
  readonly path: string
  readonly message: string
}

export abstract class AppError extends Error {
  abstract readonly kind: AppErrorKind
  readonly code: string

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = new.target.name
    this.code = code
  }
}

/** Règle métier non respectée (ex. proposition déjà traitée). */
export class DomainError extends AppError {
  readonly kind = 'domain'
}

/** Entrée invalide : le détail par champ est sûr à exposer. */
export class ValidationError extends AppError {
  readonly kind = 'validation'
  readonly issues: readonly FieldIssue[]

  constructor(message: string, issues: readonly FieldIssue[] = []) {
    super('VALIDATION_FAILED', message)
    this.issues = issues
  }
}

/** Ressource absente ou appartenant à un autre compte (indiscernable volontairement). */
export class NotFoundError extends AppError {
  readonly kind = 'not_found'

  constructor(resource: string) {
    super(`${resource.toUpperCase()}_NOT_FOUND`, 'Élément introuvable.')
  }
}

export class UnauthenticatedError extends AppError {
  readonly kind = 'unauthenticated'

  constructor() {
    super('UNAUTHENTICATED', 'Une connexion est nécessaire.')
  }
}

export class ForbiddenError extends AppError {
  readonly kind = 'forbidden'
}

/** Action impossible sans un consentement explicite et à jour. */
export class ConsentRequiredError extends AppError {
  readonly kind = 'consent_required'
  readonly consentType: string

  constructor(consentType: string) {
    super('CONSENT_REQUIRED', 'Cette action nécessite votre accord préalable.')
    this.consentType = consentType
  }
}

export class RateLimitedError extends AppError {
  readonly kind = 'rate_limited'
  readonly retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super('RATE_LIMITED', 'Trop de messages en peu de temps. Merci de patienter un instant.')
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/** Défaillance technique : le message exposé reste générique, la cause est conservée pour le diagnostic. */
export class TechnicalError extends AppError {
  readonly kind = 'technical'

  constructor(code: string, options?: { cause?: unknown; message?: string }) {
    super(code, options?.message ?? 'Une erreur technique est survenue.', { cause: options?.cause })
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError
}

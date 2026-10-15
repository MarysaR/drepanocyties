/**
 * Journalisation serveur minimale : uniquement des métadonnées techniques
 * (type, code, route), jamais de contenu personnel ni de corps de requête.
 */
import type { AppError } from '../../errors/AppError'

export interface Logger {
  info(event: string, metadata?: Record<string, string | number | boolean>): void
  warn(event: string, metadata?: Record<string, string | number | boolean>): void
  failure(event: string, error: AppError, metadata?: Record<string, string | number | boolean>): void
}

function describeCause(cause: unknown): string | undefined {
  if (cause instanceof Error) return `${cause.name}${hasCode(cause) ? `:${cause.code}` : ''}`
  return undefined
}

function hasCode(error: Error): error is Error & { code: string } {
  return typeof (error as { code?: unknown }).code === 'string'
}

export const serverLogger: Logger = {
  info: (event, metadata) => console.info(JSON.stringify({ level: 'info', event, ...metadata })),
  warn: (event, metadata) => console.warn(JSON.stringify({ level: 'warn', event, ...metadata })),
  failure: (event, error, metadata) => console.error(JSON.stringify({
    level: 'error',
    event,
    kind: error.kind,
    code: error.code,
    cause: describeCause(error.cause),
    ...metadata,
  })),
}

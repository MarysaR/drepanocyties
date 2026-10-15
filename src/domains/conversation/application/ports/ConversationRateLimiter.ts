/**
 * Limitation du nombre d'appels au modèle par personne.
 */
import type { UserId } from '@shared/domain/UserId'

export type RateLimitDecision = { readonly allowed: true } | { readonly allowed: false; readonly retryAfterSeconds: number }

export interface ConversationRateLimiter {
  consume(userId: UserId): RateLimitDecision
}

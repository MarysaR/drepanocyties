/**
 * Limiteur à fenêtres glissantes (minute et jour) par personne, en mémoire du processus.
 * Suffisant pour une instance unique ; un stockage partagé sera nécessaire à plusieurs instances.
 */
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import type { ConversationRateLimiter, RateLimitDecision } from '../../application/ports/ConversationRateLimiter'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

export interface RateLimits {
  readonly perMinute: number
  readonly perDay: number
}

export class InMemoryConversationRateLimiter implements ConversationRateLimiter {
  private readonly calls = new Map<UserId, number[]>()

  constructor(private readonly limits: RateLimits, private readonly clock: Clock) {}

  consume(userId: UserId): RateLimitDecision {
    const now = this.clock.now().getTime()
    const recent = (this.calls.get(userId) ?? []).filter(time => now - time < DAY)
    const lastMinute = recent.filter(time => now - time < MINUTE)

    if (lastMinute.length >= this.limits.perMinute) return this.refuse(userId, recent, lastMinute[0]! + MINUTE - now)
    if (recent.length >= this.limits.perDay) return this.refuse(userId, recent, recent[0]! + DAY - now)

    recent.push(now)
    this.calls.set(userId, recent)
    return { allowed: true }
  }

  private refuse(userId: UserId, recent: number[], waitMilliseconds: number): RateLimitDecision {
    this.calls.set(userId, recent)
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMilliseconds / 1000)) }
  }
}

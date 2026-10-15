/**
 * Double de test : décisions de consentement en mémoire.
 */
import type { ConsentRepository } from '@domains/consent/application/ports/ConsentRepository'
import type { ConsentDecision } from '@domains/consent/domain/entities/ConsentDecision'
import type { ConsentType } from '@domains/consent/domain/value-objects/ConsentType'
import type { UserId } from '@shared/domain/UserId'

export class InMemoryConsentRepository implements ConsentRepository {
  readonly decisions: Array<ConsentDecision & { userId: UserId }> = []

  async latestDecision(userId: UserId, type: ConsentType): Promise<ConsentDecision | undefined> {
    return this.decisions.filter(d => d.userId === userId && d.type === type).at(-1)
  }

  async record(userId: UserId, decision: ConsentDecision): Promise<void> {
    this.decisions.push({ ...decision, userId })
  }
}

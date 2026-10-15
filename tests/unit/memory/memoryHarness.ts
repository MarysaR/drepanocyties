/**
 * Assemble les cas d'utilisation de la mémoire avec des doubles en mémoire.
 */
import { AcceptMemoryProposalUseCase } from '@domains/memory/application/use-cases/AcceptMemoryProposalUseCase'
import { CorrectMemoryUseCase } from '@domains/memory/application/use-cases/CorrectMemoryUseCase'
import { CreateMemoryUseCase } from '@domains/memory/application/use-cases/CreateMemoryUseCase'
import { DeleteMemoryUseCase } from '@domains/memory/application/use-cases/DeleteMemoryUseCase'
import { DiscardPendingProposalsUseCase } from '@domains/memory/application/use-cases/DiscardPendingProposalsUseCase'
import { GetAuthorizedMemoriesUseCase } from '@domains/memory/application/use-cases/GetAuthorizedMemoriesUseCase'
import { ListMemoriesUseCase } from '@domains/memory/application/use-cases/ListMemoriesUseCase'
import { RecordTwinMemorySuggestionsUseCase } from '@domains/memory/application/use-cases/RecordTwinMemorySuggestionsUseCase'
import { RejectMemoryProposalUseCase } from '@domains/memory/application/use-cases/RejectMemoryProposalUseCase'
import type { UserId } from '@shared/domain/UserId'
import { InMemoryMemoryStore } from '../../support/InMemoryMemoryStore'
import { FixedClock, readableFingerprinter } from '../../support/fixtures'

export interface PersonMessageFixture {
  readonly userId: UserId
  readonly id: string
  readonly content: string
}

export function createMemoryHarness() {
  const clock = new FixedClock()
  const store = new InMemoryMemoryStore(() => clock.now())
  const memoryConsent = new Set<UserId>()
  const personMessages: PersonMessageFixture[] = []

  const consentReader = { isMemoryAllowed: async (userId: UserId) => memoryConsent.has(userId) }
  const messageReader = {
    findPersonMessage: async (userId: UserId, messageId: string) =>
      personMessages.find(m => m.userId === userId && m.id === messageId),
  }

  return {
    store,
    clock,
    grantMemoryConsent: (userId: UserId) => memoryConsent.add(userId),
    revokeMemoryConsent: (userId: UserId) => memoryConsent.delete(userId),
    addPersonMessage: (message: PersonMessageFixture) => personMessages.push(message),
    recordSuggestions: new RecordTwinMemorySuggestionsUseCase(store, consentReader, readableFingerprinter),
    accept: new AcceptMemoryProposalUseCase(store, consentReader, readableFingerprinter, clock),
    reject: new RejectMemoryProposalUseCase(store, readableFingerprinter),
    create: new CreateMemoryUseCase(store, consentReader, messageReader, readableFingerprinter, clock),
    correct: new CorrectMemoryUseCase(store, readableFingerprinter),
    remove: new DeleteMemoryUseCase(store, readableFingerprinter),
    list: new ListMemoriesUseCase(store, consentReader),
    authorized: new GetAuthorizedMemoriesUseCase(store, consentReader),
    discardPending: new DiscardPendingProposalsUseCase(store),
  }
}

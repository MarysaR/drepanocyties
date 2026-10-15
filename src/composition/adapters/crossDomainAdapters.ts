/**
 * Adaptateurs entre domaines : chacun implémente le contrat attendu par un domaine
 * en s'appuyant uniquement sur les cas d'utilisation publics d'un autre.
 */
import type { CheckConsentUseCase } from '@domains/consent/application/use-cases/CheckConsentUseCase'
import type { GetConsentStatesUseCase } from '@domains/consent/application/use-cases/GetConsentStatesUseCase'
import type { ConsentRevocationListener } from '@domains/consent/application/ports/ConsentRevocationListener'
import type { ConversationRepository } from '@domains/conversation/application/ports/ConversationRepository'
import type { ConversationConsentReader, TwinMemoryGateway, TwinProfileReader } from '@domains/conversation/application/ports/ConversationCollaborators'
import type { DashboardContextReader } from '@domains/dashboard/application/ports/DashboardReaders'
import type { MemoryConsentReader } from '@domains/memory/application/ports/MemoryConsentReader'
import type { PersonMessageReader } from '@domains/memory/application/ports/PersonMessageReader'
import type { DiscardPendingProposalsUseCase } from '@domains/memory/application/use-cases/DiscardPendingProposalsUseCase'
import type { GetAuthorizedMemoriesUseCase } from '@domains/memory/application/use-cases/GetAuthorizedMemoriesUseCase'
import type { RecordTwinMemorySuggestionsUseCase } from '@domains/memory/application/use-cases/RecordTwinMemorySuggestionsUseCase'
import type { GetProfileUseCase } from '@domains/profile/application/use-cases/GetProfileUseCase'

export function consentReaderFor(checkConsent: CheckConsentUseCase): ConversationConsentReader & MemoryConsentReader {
  return {
    isAiProcessingAllowed: userId => checkConsent.execute(userId, 'AI_PROCESSING'),
    isMemoryAllowed: userId => checkConsent.execute(userId, 'PERSISTENT_MEMORY'),
  }
}

export function twinMemoryGatewayFor(
  authorizedMemories: GetAuthorizedMemoriesUseCase,
  recordSuggestions: RecordTwinMemorySuggestionsUseCase,
): TwinMemoryGateway {
  return {
    authorizedMemories: userId => authorizedMemories.execute(userId),
    recordSuggestions: async (userId, input) =>
      (await recordSuggestions.execute(userId, input)).map(({ id, content }) => ({ id, content })),
  }
}

export function twinProfileReaderFor(getProfile: GetProfileUseCase): TwinProfileReader {
  return { twinProfile: userId => getProfile.execute(userId) }
}

export function personMessageReaderFor(conversations: ConversationRepository): PersonMessageReader {
  return {
    findPersonMessage: async (userId, messageId) => {
      const message = await conversations.findPersonMessage(userId, messageId)
      return message ? { id: message.id, content: message.content } : undefined
    },
  }
}

export function memoryConsentRevocationListener(discardPending: DiscardPendingProposalsUseCase): ConsentRevocationListener {
  return {
    onConsentRevoked: async (userId, type) => {
      if (type === 'PERSISTENT_MEMORY') await discardPending.execute(userId)
    },
  }
}

export function dashboardContextReaderFor(getProfile: GetProfileUseCase, getConsentStates: GetConsentStatesUseCase): DashboardContextReader {
  return {
    preferredName: async userId => (await getProfile.execute(userId)).preferredName,
    consentStatuses: async (userId) => {
      const states = await getConsentStates.execute(userId)
      const statusOf = (type: string) => states.find(state => state.type === type)?.status ?? 'not_decided'
      return { aiProcessing: statusOf('AI_PROCESSING'), persistentMemory: statusOf('PERSISTENT_MEMORY') }
    },
  }
}

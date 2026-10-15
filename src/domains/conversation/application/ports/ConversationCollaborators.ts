/**
 * Contrats attendus des autres domaines (consentement, mémoire, profil),
 * implémentés par des adaptateurs dans la couche de composition.
 */
import type { UserId } from '@shared/domain/UserId'
import type { TwinReplyLength } from '../../domain/services/TwinInstructionsComposer'

export interface ConversationConsentReader {
  isAiProcessingAllowed(userId: UserId): Promise<boolean>
  isMemoryAllowed(userId: UserId): Promise<boolean>
}

export interface SuggestedMemory {
  readonly id: string
  readonly content: string
}

export interface TwinMemoryGateway {
  authorizedMemories(userId: UserId): Promise<string[]>
  recordSuggestions(userId: UserId, input: { sourceMessageId: string; suggestions: readonly string[] }): Promise<SuggestedMemory[]>
}

export interface TwinProfileReader {
  twinProfile(userId: UserId): Promise<{ preferredName: string | null; aboutMe: string | null; replyLength: TwinReplyLength }>
}

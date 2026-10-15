/**
 * Racine de composition serveur : instancie l'infrastructure et câble
 * les cas d'utilisation de chaque domaine. Seul endroit qui connaît toutes les implémentations.
 */
import { CheckConsentUseCase } from '@domains/consent/application/use-cases/CheckConsentUseCase'
import { GetConsentStatesUseCase } from '@domains/consent/application/use-cases/GetConsentStatesUseCase'
import { RecordConsentDecisionUseCase } from '@domains/consent/application/use-cases/RecordConsentDecisionUseCase'
import { PrismaConsentRepository } from '@domains/consent/infrastructure/repositories/PrismaConsentRepository'
import type { ConversationModel } from '@domains/conversation/application/ports/ConversationModel'
import { DeleteConversationUseCase } from '@domains/conversation/application/use-cases/DeleteConversationUseCase'
import { GetConversationHistoryUseCase } from '@domains/conversation/application/use-cases/GetConversationHistoryUseCase'
import { ListConversationsUseCase } from '@domains/conversation/application/use-cases/ListConversationsUseCase'
import { SendMessageUseCase } from '@domains/conversation/application/use-cases/SendMessageUseCase'
import { StartConversationUseCase } from '@domains/conversation/application/use-cases/StartConversationUseCase'
import { AnthropicConversationModel } from '@domains/conversation/infrastructure/providers/AnthropicConversationModel'
import { InMemoryConversationRateLimiter } from '@domains/conversation/infrastructure/providers/InMemoryConversationRateLimiter'
import { SimulatedConversationModel } from '@domains/conversation/infrastructure/providers/SimulatedConversationModel'
import { PrismaConversationRepository } from '@domains/conversation/infrastructure/repositories/PrismaConversationRepository'
import { GetDashboardOverviewUseCase } from '@domains/dashboard/application/use-cases/GetDashboardOverviewUseCase'
import { PrismaDashboardActivityReader } from '@domains/dashboard/infrastructure/repositories/PrismaDashboardActivityReader'
import { RequireExistingUserUseCase } from '@domains/identity/application/use-cases/RequireExistingUserUseCase'
import { SignInWithExternalIdentityUseCase } from '@domains/identity/application/use-cases/SignInWithExternalIdentityUseCase'
import { PrismaUserRepository } from '@domains/identity/infrastructure/repositories/PrismaUserRepository'
import { CreateJournalEntryUseCase } from '@domains/journal/application/use-cases/CreateJournalEntryUseCase'
import { DeleteJournalEntryUseCase } from '@domains/journal/application/use-cases/DeleteJournalEntryUseCase'
import { ListJournalEntriesUseCase } from '@domains/journal/application/use-cases/ListJournalEntriesUseCase'
import { UpdateJournalEntryUseCase } from '@domains/journal/application/use-cases/UpdateJournalEntryUseCase'
import { PrismaJournalRepository } from '@domains/journal/infrastructure/repositories/PrismaJournalRepository'
import { AcceptMemoryProposalUseCase } from '@domains/memory/application/use-cases/AcceptMemoryProposalUseCase'
import { CorrectMemoryUseCase } from '@domains/memory/application/use-cases/CorrectMemoryUseCase'
import { CreateMemoryUseCase } from '@domains/memory/application/use-cases/CreateMemoryUseCase'
import { DeleteMemoryUseCase } from '@domains/memory/application/use-cases/DeleteMemoryUseCase'
import { DiscardPendingProposalsUseCase } from '@domains/memory/application/use-cases/DiscardPendingProposalsUseCase'
import { GetAuthorizedMemoriesUseCase } from '@domains/memory/application/use-cases/GetAuthorizedMemoriesUseCase'
import { ListMemoriesUseCase } from '@domains/memory/application/use-cases/ListMemoriesUseCase'
import { RecordTwinMemorySuggestionsUseCase } from '@domains/memory/application/use-cases/RecordTwinMemorySuggestionsUseCase'
import { RejectMemoryProposalUseCase } from '@domains/memory/application/use-cases/RejectMemoryProposalUseCase'
import { PrismaMemoryStore } from '@domains/memory/infrastructure/repositories/PrismaMemoryStore'
import { EraseAllPersonalDataUseCase } from '@domains/privacy/application/use-cases/EraseAllPersonalDataUseCase'
import { ExportPersonalDataUseCase } from '@domains/privacy/application/use-cases/ExportPersonalDataUseCase'
import { PrismaPersonalDataStore } from '@domains/privacy/infrastructure/repositories/PrismaPersonalDataStore'
import { GetProfileUseCase } from '@domains/profile/application/use-cases/GetProfileUseCase'
import { UpdateProfileUseCase } from '@domains/profile/application/use-cases/UpdateProfileUseCase'
import { PrismaProfileRepository } from '@domains/profile/infrastructure/repositories/PrismaProfileRepository'
import { systemClock, type Clock } from '@shared/domain/Clock'
import { AesGcmContentCipher } from '@shared/infrastructure/crypto/AesGcmContentCipher'
import { deriveKeys } from '@shared/infrastructure/crypto/deriveKeys'
import { HmacContentFingerprinter } from '@shared/infrastructure/crypto/HmacContentFingerprinter'
import { createPrismaClient, type DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import {
  consentReaderFor,
  dashboardContextReaderFor,
  memoryConsentRevocationListener,
  personMessageReaderFor,
  twinMemoryGatewayFor,
  twinProfileReaderFor,
} from './adapters/crossDomainAdapters'
import { UnconfiguredConversationModel } from './adapters/UnconfiguredConversationModel'
import type { ServerSettings } from './serverSettings'

export interface ContainerOverrides {
  readonly database?: DatabaseClient
  readonly conversationModel?: ConversationModel
  readonly clock?: Clock
}

function selectConversationModel(settings: ServerSettings): ConversationModel {
  if (settings.testMode) return new SimulatedConversationModel()
  if (settings.anthropic) return new AnthropicConversationModel(settings.anthropic)
  return new UnconfiguredConversationModel()
}

export function createServerContainer(settings: ServerSettings, overrides: ContainerOverrides = {}) {
  const database = overrides.database ?? createPrismaClient(settings.databaseUrl)
  const clock = overrides.clock ?? systemClock
  const keys = deriveKeys(settings.dataEncryptionKey)
  const cipher = new AesGcmContentCipher(keys.encryptionKey)
  const fingerprinter = new HmacContentFingerprinter(keys.fingerprintKey)

  const users = new PrismaUserRepository(database)
  const consentRepository = new PrismaConsentRepository(database)
  const profiles = new PrismaProfileRepository(database, cipher)
  const conversations = new PrismaConversationRepository(database, cipher)
  const memoryStore = new PrismaMemoryStore(database, cipher)
  const journal = new PrismaJournalRepository(database, cipher)
  const personalData = new PrismaPersonalDataStore(database, cipher)

  const checkConsent = new CheckConsentUseCase(consentRepository)
  const getConsentStates = new GetConsentStatesUseCase(consentRepository)
  const consentReader = consentReaderFor(checkConsent)
  const getProfile = new GetProfileUseCase(profiles)

  const memory = {
    list: new ListMemoriesUseCase(memoryStore, consentReader),
    create: new CreateMemoryUseCase(memoryStore, consentReader, personMessageReaderFor(conversations), fingerprinter, clock),
    acceptProposal: new AcceptMemoryProposalUseCase(memoryStore, consentReader, fingerprinter, clock),
    rejectProposal: new RejectMemoryProposalUseCase(memoryStore, fingerprinter),
    correct: new CorrectMemoryUseCase(memoryStore, fingerprinter),
    delete: new DeleteMemoryUseCase(memoryStore, fingerprinter),
    authorized: new GetAuthorizedMemoriesUseCase(memoryStore, consentReader),
    recordTwinSuggestions: new RecordTwinMemorySuggestionsUseCase(memoryStore, consentReader, fingerprinter),
    discardPendingProposals: new DiscardPendingProposalsUseCase(memoryStore),
  }

  return {
    settings,
    database,
    identity: {
      signIn: new SignInWithExternalIdentityUseCase(users),
      requireExistingUser: new RequireExistingUserUseCase(users),
    },
    consent: {
      states: getConsentStates,
      check: checkConsent,
      record: new RecordConsentDecisionUseCase(consentRepository, memoryConsentRevocationListener(memory.discardPendingProposals), clock),
    },
    profile: {
      get: getProfile,
      update: new UpdateProfileUseCase(profiles),
    },
    conversation: {
      start: new StartConversationUseCase(conversations),
      list: new ListConversationsUseCase(conversations),
      history: new GetConversationHistoryUseCase(conversations),
      delete: new DeleteConversationUseCase(conversations),
      sendMessage: new SendMessageUseCase({
        conversations,
        model: overrides.conversationModel ?? selectConversationModel(settings),
        rateLimiter: new InMemoryConversationRateLimiter(settings.rateLimits, clock),
        consent: consentReader,
        memory: twinMemoryGatewayFor(memory.authorized, memory.recordTwinSuggestions),
        profile: twinProfileReaderFor(getProfile),
      }),
    },
    memory,
    journal: {
      list: new ListJournalEntriesUseCase(journal),
      create: new CreateJournalEntryUseCase(journal, clock),
      update: new UpdateJournalEntryUseCase(journal, clock),
      delete: new DeleteJournalEntryUseCase(journal),
    },
    dashboard: {
      overview: new GetDashboardOverviewUseCase(
        new PrismaDashboardActivityReader(database, cipher),
        dashboardContextReaderFor(getProfile, getConsentStates),
      ),
    },
    privacy: {
      export: new ExportPersonalDataUseCase(personalData, clock),
      eraseAll: new EraseAllPersonalDataUseCase(personalData),
    },
  }
}

export type ServerContainer = ReturnType<typeof createServerContainer>

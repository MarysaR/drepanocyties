/**
 * Envoie un message au jumeau : vérifie consentement, appartenance et limites,
 * obtient la réponse puis enregistre l'échange de façon atomique.
 */
import type { UserId } from '@shared/domain/UserId'
import { ConsentRequiredError, NotFoundError, RateLimitedError } from '@shared/errors/AppError'
import { catchError } from '@shared/errors/catchError'
import { AiBudgetExhaustedError } from '../../domain/errors'
import { estimateCostMicroUsd, type TokenPrices } from '../../domain/services/AiCostEstimator'
import { deriveConversationTitle } from '../../domain/services/ConversationTitle'
import { HISTORY_MAX_MESSAGES, selectMemoriesForPrompt, selectRecentHistory } from '../../domain/services/PromptBudget'
import { composeTwinInstructions } from '../../domain/services/TwinInstructionsComposer'
import { createMessageContent } from '../../domain/value-objects/MessageContent'
import { toMessageDto, type SendMessageResultDto } from '../dto/ConversationDto'
import type { ConversationConsentReader, SuggestedMemory, TwinMemoryGateway, TwinProfileReader } from '../ports/ConversationCollaborators'
import type { AiUsageLedger } from '../ports/AiUsageLedger'
import type { ConversationModel } from '../ports/ConversationModel'
import type { ConversationRateLimiter } from '../ports/ConversationRateLimiter'
import type { ConversationRepository } from '../ports/ConversationRepository'

export interface AiBudgetSettings {
  /** Plafond cumulé estimé, en micro-dollars. Garde-fou applicatif, pas un plafond de facturation. */
  readonly limitMicroUsd: number
  readonly prices: TokenPrices
}

export interface SendMessageDependencies {
  readonly conversations: ConversationRepository
  readonly model: ConversationModel
  readonly rateLimiter: ConversationRateLimiter
  readonly consent: ConversationConsentReader
  readonly memory: TwinMemoryGateway
  readonly profile: TwinProfileReader
  readonly usageLedger: AiUsageLedger
  readonly budget: AiBudgetSettings
}

export class SendMessageUseCase {
  constructor(private readonly deps: SendMessageDependencies) {}

  async execute(userId: UserId, input: { conversationId: string; content: string }): Promise<SendMessageResultDto> {
    const content = createMessageContent(input.content)
    const { conversations, model, rateLimiter, consent } = this.deps

    if (!(await consent.isAiProcessingAllowed(userId))) throw new ConsentRequiredError('AI_PROCESSING')
    const conversation = await conversations.findById(userId, input.conversationId)
    if (!conversation) throw new NotFoundError('conversation')

    const decision = rateLimiter.consume(userId)
    if (!decision.allowed) throw new RateLimitedError(decision.retryAfterSeconds)
    if ((await this.deps.usageLedger.totals()).costMicroUsd >= this.deps.budget.limitMicroUsd) throw new AiBudgetExhaustedError()

    const canSuggestMemories = await consent.isMemoryAllowed(userId)
    const [memories, profile, recent] = await Promise.all([
      this.deps.memory.authorizedMemories(userId),
      this.deps.profile.twinProfile(userId),
      conversations.recentMessages(userId, conversation.id, HISTORY_MAX_MESSAGES),
    ])

    const reply = await model.generateReply({
      instructions: composeTwinInstructions({ profile, memories: selectMemoriesForPrompt(memories), canSuggestMemories }),
      history: selectRecentHistory([...recent.map(({ author, content }) => ({ author, content })), { author: 'PERSON' as const, content }]),
      canSuggestMemories,
    })

    await this.deps.usageLedger.record({
      model: reply.model,
      usage: reply.usage,
      costMicroUsd: estimateCostMicroUsd(reply.usage, this.deps.budget.prices),
    })

    const { personMessage, twinMessage } = await conversations.saveExchange(userId, conversation.id, {
      personContent: content,
      twinContent: reply.content,
      title: conversation.title ? null : deriveConversationTitle(content),
    })

    const proposals = await this.recordSuggestions(userId, canSuggestMemories, personMessage.id, reply.memorySuggestions)

    return {
      personMessage: toMessageDto(personMessage),
      twinMessage: toMessageDto(twinMessage),
      memoryProposals: proposals.ok ? proposals.value : [],
      memoryProposalsFailed: !proposals.ok,
    }
  }

  private recordSuggestions(userId: UserId, allowed: boolean, sourceMessageId: string, suggestions: readonly string[]) {
    return catchError<SuggestedMemory[]>(() => {
      if (!allowed || suggestions.length === 0) return []
      return this.deps.memory.recordSuggestions(userId, { sourceMessageId, suggestions })
    })
  }
}

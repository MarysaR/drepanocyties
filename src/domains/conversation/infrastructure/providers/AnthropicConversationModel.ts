/**
 * Adaptateur Anthropic du modèle conversationnel. Le jumeau peut suggérer
 * des souvenirs via l'outil propose_memory ; rien n'est enregistré ici.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { BetaMessage, BetaMessageParam, BetaToolUnion } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { DomainError, TechnicalError } from '@shared/errors/AppError'
import type { ConversationModel, TwinReply, TwinReplyRequest } from '../../application/ports/ConversationModel'

export interface AnthropicSettings {
  readonly apiKey: string
  readonly model: string
  readonly maxOutputTokens: number
}

const PROPOSE_MEMORY_TOOL = 'propose_memory'

const proposeMemoryTool: BetaToolUnion = {
  name: PROPOSE_MEMORY_TOOL,
  description: 'Propose à la personne de retenir durablement une information qu’elle vient d’exprimer explicitement. La personne décidera elle-même d’accepter, de modifier ou de refuser.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'L’information à retenir, formulée fidèlement en une phrase courte.' },
    },
    required: ['content'],
    additionalProperties: false,
  },
}

const TOOL_ACKNOWLEDGEMENT = 'Proposition transmise : la personne décidera elle-même. Réponds-lui maintenant.'

export class TwinUnavailableError extends DomainError {
  constructor() {
    super('TWIN_UNAVAILABLE', 'Le jumeau ne peut pas répondre à ce message. Si vous traversez un moment difficile, vous pouvez appeler le 3114, ou le 15 en cas d’urgence médicale.')
  }
}

export class AnthropicConversationModel implements ConversationModel {
  private readonly client: Anthropic

  constructor(private readonly settings: AnthropicSettings) {
    this.client = new Anthropic({ apiKey: settings.apiKey, maxRetries: 2, timeout: 60_000 })
  }

  async generateReply(request: TwinReplyRequest): Promise<TwinReply> {
    const messages: BetaMessageParam[] = mergeConsecutiveTurns(request.history)
    const tools = request.canSuggestMemories ? [proposeMemoryTool] : []

    const first = await this.callModel(request.instructions, messages, tools)
    const suggestions = extractSuggestions(first)
    let text = extractText(first)

    if (first.stop_reason === 'tool_use') {
      const followUp = await this.callModel(request.instructions, [
        ...messages,
        { role: 'assistant', content: first.content },
        { role: 'user', content: toolResultsFor(first) },
      ], tools)
      suggestions.push(...extractSuggestions(followUp))
      text = [text, extractText(followUp)].filter(Boolean).join('\n\n')
    }

    if (!text.trim()) throw new TechnicalError('AI_EMPTY_REPLY')
    return { content: text.trim(), memorySuggestions: suggestions }
  }

  private async callModel(system: string, messages: BetaMessageParam[], tools: BetaToolUnion[]): Promise<BetaMessage> {
    const response = await this.client.beta.messages.create({
      model: this.settings.model,
      max_tokens: this.settings.maxOutputTokens,
      system,
      messages,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      ...(tools.length > 0 ? { tools, tool_choice: { type: 'auto' } } : {}),
    }).catch((error: unknown) => {
      throw new TechnicalError(error instanceof Anthropic.RateLimitError ? 'AI_PROVIDER_RATE_LIMITED' : 'AI_PROVIDER_UNAVAILABLE', { cause: error })
    })
    if (response.stop_reason === 'refusal') throw new TwinUnavailableError()
    return response
  }
}

/** L'API attend des tours alternés : des messages successifs du même auteur sont fusionnés. */
function mergeConsecutiveTurns(history: TwinReplyRequest['history']): BetaMessageParam[] {
  const merged: Array<{ role: 'user' | 'assistant'; content: string }> = []
  for (const message of history) {
    const role = message.author === 'PERSON' ? 'user' : 'assistant'
    const previous = merged.at(-1)
    if (previous?.role === role) previous.content = `${previous.content}\n\n${message.content}`
    else merged.push({ role, content: message.content })
  }
  while (merged[0]?.role === 'assistant') merged.shift()
  return merged
}

function extractText(message: BetaMessage): string {
  return message.content.flatMap(block => (block.type === 'text' ? [block.text] : [])).join('\n').trim()
}

function extractSuggestions(message: BetaMessage): string[] {
  return message.content.flatMap((block) => {
    if (block.type !== 'tool_use' || block.name !== PROPOSE_MEMORY_TOOL) return []
    const input = block.input as { content?: unknown }
    return typeof input.content === 'string' ? [input.content] : []
  })
}

function toolResultsFor(message: BetaMessage) {
  return message.content.flatMap(block => (block.type === 'tool_use'
    ? [{ type: 'tool_result' as const, tool_use_id: block.id, content: TOOL_ACKNOWLEDGEMENT }]
    : []))
}

/**
 * Adaptateur Anthropic du modèle conversationnel. Le modèle configuré est utilisé tel quel :
 * aucun repli silencieux vers un autre modèle ni vers une IA simulée.
 * Le jumeau peut suggérer des souvenirs via l'outil propose_memory ; rien n'est enregistré ici.
 */
import Anthropic from '@anthropic-ai/sdk'
import { DomainError, TechnicalError } from '@shared/errors/AppError'
import type { ConversationModel, TwinReply, TwinReplyRequest } from '../../application/ports/ConversationModel'
import { NO_TOKEN_USAGE, addTokenUsage, type TokenUsage } from '../../domain/value-objects/TokenUsage'

export interface AnthropicSettings {
  readonly apiKey: string
  readonly model: string
  readonly maxOutputTokens: number
  /** Transport HTTP remplaçable, réservé aux tests (aucun appel réel). */
  readonly fetch?: typeof fetch
}

const PROPOSE_MEMORY_TOOL = 'propose_memory'

const proposeMemoryTool: Anthropic.Tool = {
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
    this.client = new Anthropic({ apiKey: settings.apiKey, maxRetries: 1, timeout: 60_000, ...(settings.fetch ? { fetch: settings.fetch } : {}) })
  }

  async generateReply(request: TwinReplyRequest): Promise<TwinReply> {
    const messages = mergeConsecutiveTurns(request.history)
    const tools = request.canSuggestMemories ? [proposeMemoryTool] : []

    const first = await this.callModel(request.instructions, messages, tools)
    const suggestions = extractSuggestions(first)
    let text = extractText(first)
    let usage = usageOf(first)

    // Un second appel n'est nécessaire que si le modèle n'a écrit aucun texte avant d'utiliser l'outil.
    if (first.stop_reason === 'tool_use' && !text) {
      const followUp = await this.callModel(request.instructions, [
        ...messages,
        { role: 'assistant', content: first.content },
        { role: 'user', content: toolResultsFor(first) },
      ], tools)
      suggestions.push(...extractSuggestions(followUp))
      text = extractText(followUp)
      usage = addTokenUsage(usage, usageOf(followUp))
    }

    if (!text) {
      const reason = first.stop_reason === 'max_tokens' ? 'AI_REPLY_TRUNCATED' : 'AI_EMPTY_REPLY'
      throw new TechnicalError(reason, { message: 'Le modèle n’a pas produit de réponse exploitable. Réessayez dans un instant.' })
    }
    return { content: text, memorySuggestions: suggestions, model: first.model, usage }
  }

  private async callModel(system: string, messages: Anthropic.MessageParam[], tools: Anthropic.Tool[]): Promise<Anthropic.Message> {
    const response = await this.client.messages.create({
      model: this.settings.model,
      max_tokens: this.settings.maxOutputTokens,
      // Le prompt système (principes du jumeau, profil, souvenirs) est stable d'un tour à l'autre : il est mis en cache.
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      ...(tools.length > 0 ? { tools, tool_choice: { type: 'auto' as const } } : {}),
    }).catch((error: unknown) => {
      throw describeProviderFailure(error, this.settings.model)
    })
    if (response.stop_reason === 'refusal') throw new TwinUnavailableError()
    return response
  }
}

/** Traduit une défaillance du fournisseur en erreur technique explicite, sans exposer de détail sensible. */
export function describeProviderFailure(error: unknown, model: string): TechnicalError {
  if (error instanceof Anthropic.AuthenticationError) {
    return new TechnicalError('AI_PROVIDER_AUTH_FAILED', { cause: error, message: 'La clé API du fournisseur d’IA est refusée (invalide ou révoquée). Vérifiez le secret NUXT_ANTHROPIC_API_KEY du serveur.' })
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return new TechnicalError('AI_PROVIDER_PERMISSION_DENIED', { cause: error, message: `Le compte du fournisseur d’IA n’est pas autorisé à utiliser le modèle ${model}.` })
  }
  if (error instanceof Anthropic.NotFoundError) {
    return new TechnicalError('AI_MODEL_NOT_AVAILABLE', { cause: error, message: `Le modèle ${model} est introuvable ou indisponible pour ce compte. Aucun autre modèle n’est utilisé à sa place.` })
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new TechnicalError('AI_PROVIDER_RATE_LIMITED', { cause: error, message: 'Le fournisseur d’IA limite temporairement les requêtes. Réessayez dans une minute.' })
  }
  if (error instanceof Anthropic.BadRequestError) {
    const creditsExhausted = /credit balance/i.test(error.message)
    return creditsExhausted
      ? new TechnicalError('AI_PROVIDER_CREDITS_EXHAUSTED', { cause: error, message: 'Le solde de crédits du compte du fournisseur d’IA est insuffisant.' })
      : new TechnicalError('AI_PROVIDER_BAD_REQUEST', { cause: error, message: 'Le fournisseur d’IA a refusé la requête (paramètre non accepté).' })
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new TechnicalError('AI_PROVIDER_UNREACHABLE', { cause: error, message: 'Le fournisseur d’IA est injoignable depuis le serveur. Réessayez dans un instant.' })
  }
  if (error instanceof Anthropic.APIError && error.status === 529) {
    return new TechnicalError('AI_PROVIDER_OVERLOADED', { cause: error, message: 'Le fournisseur d’IA est surchargé. Réessayez dans un instant.' })
  }
  return new TechnicalError('AI_PROVIDER_UNAVAILABLE', { cause: error, message: 'Le fournisseur d’IA est momentanément indisponible. Réessayez dans un instant.' })
}

/** L'API attend des tours alternés : des messages successifs du même auteur sont fusionnés. */
function mergeConsecutiveTurns(history: TwinReplyRequest['history']): Anthropic.MessageParam[] {
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

function extractText(message: Anthropic.Message): string {
  return message.content.flatMap(block => (block.type === 'text' ? [block.text] : [])).join('\n').trim()
}

function extractSuggestions(message: Anthropic.Message): string[] {
  return message.content.flatMap((block) => {
    if (block.type !== 'tool_use' || block.name !== PROPOSE_MEMORY_TOOL) return []
    const input = block.input as { content?: unknown }
    return typeof input.content === 'string' ? [input.content] : []
  })
}

function toolResultsFor(message: Anthropic.Message): Anthropic.ToolResultBlockParam[] {
  return message.content.flatMap(block => (block.type === 'tool_use'
    ? [{ type: 'tool_result' as const, tool_use_id: block.id, content: TOOL_ACKNOWLEDGEMENT }]
    : []))
}

function usageOf(message: Anthropic.Message): TokenUsage {
  return {
    ...NO_TOKEN_USAGE,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: message.usage.cache_creation_input_tokens ?? 0,
  }
}

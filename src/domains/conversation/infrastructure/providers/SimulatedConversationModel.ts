/**
 * Modèle simulé, déterministe, réservé au mode test (E2E) : il ne prétend pas
 * être une IA et n'est jamais utilisé hors de ce mode.
 */
import type { ConversationModel, TwinReply, TwinReplyRequest } from '../../application/ports/ConversationModel'
import { NO_TOKEN_USAGE } from '../../domain/value-objects/TokenUsage'

const SIMULATED_MODEL = 'simulated-test-model'
const MEMORY_MARKER = /je veux que tu retiennes que (.+)/i

export class SimulatedConversationModel implements ConversationModel {
  async generateReply(request: TwinReplyRequest): Promise<TwinReply> {
    const lastMessage = request.history.at(-1)?.content ?? ''
    const memories = extractAuthorizedMemories(request.instructions)

    if (/de quoi te souviens-tu/i.test(lastMessage)) {
      return {
        content: memories.length > 0
          ? `[Réponse simulée] Voici ce que vous m'avez autorisé à retenir : ${memories.join(' | ')}`
          : '[Réponse simulée] Je n’ai aucun souvenir autorisé pour le moment.',
        memorySuggestions: [],
        model: SIMULATED_MODEL,
        usage: NO_TOKEN_USAGE,
      }
    }

    const marker = MEMORY_MARKER.exec(lastMessage)
    const suggestion = marker?.[1]?.trim().replace(/[.!]+$/, '')
    return {
      content: '[Réponse simulée] Merci de me confier cela. Je suis là pour vous écouter.',
      memorySuggestions: request.canSuggestMemories && suggestion ? [capitalize(suggestion)] : [],
      model: SIMULATED_MODEL,
      usage: NO_TOKEN_USAGE,
    }
  }
}

function extractAuthorizedMemories(instructions: string): string[] {
  const block = /<souvenirs_autorises>\n([\s\S]*?)\n<\/souvenirs_autorises>/.exec(instructions)?.[1]
  return block ? block.split('\n').map(line => line.replace(/^- /, '')) : []
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

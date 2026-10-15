/**
 * Vérifie la forme exacte des requêtes envoyées au fournisseur et la lecture des réponses,
 * avec un transport HTTP simulé : aucun appel réel n'est effectué ici.
 */
import { describe, expect, it } from 'vitest'
import { AnthropicConversationModel, TwinUnavailableError } from '@domains/conversation/infrastructure/providers/AnthropicConversationModel'
import { TechnicalError } from '@shared/errors/AppError'

interface RecordedCall { url: string; body: Record<string, unknown> }

function messageResponse(content: unknown[], overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content,
    stop_reason: 'end_turn', stop_sequence: null,
    usage: { input_tokens: 800, output_tokens: 120, cache_read_input_tokens: 600, cache_creation_input_tokens: 0 },
    ...overrides,
  }
}

function fakeProvider(responses: Array<{ status?: number; body: unknown }>) {
  const calls: RecordedCall[] = []
  const queue = [...responses]
  const transport: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), body: JSON.parse(String(init?.body)) as Record<string, unknown> })
    const next = queue.shift() ?? { status: 500, body: { type: 'error', error: { type: 'api_error', message: 'inattendu' } } }
    return new Response(JSON.stringify(next.body), { status: next.status ?? 200, headers: { 'content-type': 'application/json' } })
  }
  return { calls, transport }
}

const request = { instructions: 'Tu es le jumeau.', history: [{ author: 'PERSON' as const, content: 'Bonjour' }], canSuggestMemories: false }
const modelWith = (transport: typeof fetch, maxOutputTokens = 2000) =>
  new AnthropicConversationModel({ apiKey: 'test-key-not-real', model: 'claude-sonnet-5-5', maxOutputTokens, fetch: transport })

describe('Adaptateur Anthropic', () => {
  it('envoie exactement le modèle configuré, sans repli ni bêta, avec cache du prompt et sortie plafonnée', async () => {
    const { calls, transport } = fakeProvider([{ body: messageResponse([{ type: 'text', text: 'Je suis là.' }]) }])
    await modelWith(transport, 1500).generateReply(request)

    expect(calls).toHaveLength(1)
    const body = calls[0]!.body
    expect(body.model).toBe('claude-sonnet-5-5')
    expect(body.max_tokens).toBe(1500)
    expect(body.fallbacks).toBeUndefined()
    expect(body.thinking).toEqual({ type: 'adaptive' })
    expect(body.output_config).toEqual({ effort: 'low' })
    expect(body.system).toEqual([{ type: 'text', text: 'Tu es le jumeau.', cache_control: { type: 'ephemeral' } }])
    expect(body.tools).toBeUndefined()
    expect(calls[0]!.url).not.toContain('beta')
  })

  it('retourne la réponse, le modèle réellement servi et la consommation', async () => {
    const { transport } = fakeProvider([{ body: messageResponse([{ type: 'text', text: 'Je suis là.' }]) }])
    expect(await modelWith(transport).generateReply(request)).toEqual({
      content: 'Je suis là.',
      memorySuggestions: [],
      model: 'claude-sonnet-5-5',
      usage: { inputTokens: 800, outputTokens: 120, cacheReadTokens: 600, cacheWriteTokens: 0 },
    })
  })

  it('ne déclare l’outil de proposition que si la mémoire est autorisée', async () => {
    const { calls, transport } = fakeProvider([{ body: messageResponse([{ type: 'text', text: 'Je suis là.' }]) }])
    await modelWith(transport).generateReply({ ...request, canSuggestMemories: true })
    expect((calls[0]!.body.tools as Array<{ name: string }>).map(tool => tool.name)).toEqual(['propose_memory'])
  })

  it('évite un second appel lorsque le modèle écrit du texte en plus de sa proposition', async () => {
    const { calls, transport } = fakeProvider([{ body: messageResponse([
      { type: 'text', text: 'C’est noté, merci de me le dire.' },
      { type: 'tool_use', id: 'toolu_1', name: 'propose_memory', input: { content: 'Aime la mer.' }, caller: { type: 'direct' } },
    ], { stop_reason: 'tool_use' }) }])
    const reply = await modelWith(transport).generateReply({ ...request, canSuggestMemories: true })
    expect(calls).toHaveLength(1)
    expect(reply.memorySuggestions).toEqual(['Aime la mer.'])
  })

  it('effectue un second appel si le modèle n’a écrit aucun texte, et additionne la consommation', async () => {
    const { calls, transport } = fakeProvider([
      { body: messageResponse([{ type: 'tool_use', id: 'toolu_1', name: 'propose_memory', input: { content: 'Aime la mer.' }, caller: { type: 'direct' } }], { stop_reason: 'tool_use' }) },
      { body: messageResponse([{ type: 'text', text: 'Merci de me le confier.' }]) },
    ])
    const reply = await modelWith(transport).generateReply({ ...request, canSuggestMemories: true })
    expect(calls).toHaveLength(2)
    expect(reply.content).toBe('Merci de me le confier.')
    expect(reply.usage.inputTokens).toBe(1600)
  })

  it('signale un refus du modèle au lieu de basculer sur une autre IA', async () => {
    const { calls, transport } = fakeProvider([{ body: messageResponse([], { stop_reason: 'refusal' }) }])
    await expect(modelWith(transport).generateReply(request)).rejects.toBeInstanceOf(TwinUnavailableError)
    expect(calls).toHaveLength(1)
  })

  it('signale une réponse tronquée sans texte exploitable', async () => {
    const { transport } = fakeProvider([{ body: messageResponse([], { stop_reason: 'max_tokens' }) }])
    await expect(modelWith(transport).generateReply(request)).rejects.toMatchObject({ code: 'AI_REPLY_TRUNCATED' })
  })

  describe('diagnostic des défaillances du fournisseur', () => {
    const failure = (status: number, type: string, message: string) => fakeProvider([
      { status, body: { type: 'error', error: { type, message } } },
      { status, body: { type: 'error', error: { type, message } } },
    ])

    it.each([
      [401, 'authentication_error', 'invalid x-api-key', 'AI_PROVIDER_AUTH_FAILED'],
      [403, 'permission_error', 'forbidden', 'AI_PROVIDER_PERMISSION_DENIED'],
      [404, 'not_found_error', 'model: claude-sonnet-5-5', 'AI_MODEL_NOT_AVAILABLE'],
      [400, 'invalid_request_error', 'Your credit balance is too low to access the Anthropic API.', 'AI_PROVIDER_CREDITS_EXHAUSTED'],
      [400, 'invalid_request_error', 'max_tokens: invalid', 'AI_PROVIDER_BAD_REQUEST'],
      [429, 'rate_limit_error', 'slow down', 'AI_PROVIDER_RATE_LIMITED'],
      [529, 'overloaded_error', 'overloaded', 'AI_PROVIDER_OVERLOADED'],
    ])('HTTP %i (%s) devient le code %s', async (status, type, message, expectedCode) => {
      const { transport } = failure(status, type, message)
      const error = await modelWith(transport).generateReply(request).catch((caught: unknown) => caught)
      expect(error).toBeInstanceOf(TechnicalError)
      expect(error).toMatchObject({ code: expectedCode })
    })

    it('nomme le modèle indisponible dans le message, sans jamais le remplacer', async () => {
      const { transport, calls } = failure(404, 'not_found_error', 'model: claude-sonnet-5-5')
      const error = await modelWith(transport).generateReply(request).catch((caught: unknown) => caught) as TechnicalError
      expect(error.message).toContain('claude-sonnet-5-5')
      expect(error.message).toMatch(/Aucun autre modèle/)
      expect(new Set(calls.map(call => call.body.model))).toEqual(new Set(['claude-sonnet-5-5']))
    })

    it('n’expose jamais la clé API ni le message brut du fournisseur', async () => {
      const { transport } = failure(401, 'authentication_error', 'invalid x-api-key test-key-not-real')
      const error = await modelWith(transport).generateReply(request).catch((caught: unknown) => caught) as TechnicalError
      expect(error.message).not.toContain('test-key-not-real')
      expect(error.message).not.toContain('invalid x-api-key')
    })
  })
})

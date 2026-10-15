/**
 * Limites de taille de ce qui est transmis au modèle (historique et souvenirs),
 * pour maîtriser le coût de chaque appel sans perdre le fil récent de la conversation.
 */
export const HISTORY_MAX_MESSAGES = 30
export const HISTORY_MAX_CHARACTERS = 16_000
export const MEMORIES_MAX_COUNT = 40
export const MEMORIES_MAX_CHARACTERS = 4_000

/** Garde les messages les plus récents dans la limite fixée ; le dernier est toujours conservé. */
export function selectRecentHistory<T extends { readonly content: string }>(
  messages: readonly T[],
  limits: { maxMessages: number; maxCharacters: number } = { maxMessages: HISTORY_MAX_MESSAGES, maxCharacters: HISTORY_MAX_CHARACTERS },
): T[] {
  const selected: T[] = []
  let characters = 0
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]!
    const isNewest = selected.length === 0
    if (!isNewest && (selected.length >= limits.maxMessages || characters + message.content.length > limits.maxCharacters)) break
    selected.unshift(message)
    characters += message.content.length
  }
  return selected
}

/** Garde les souvenirs les plus récents (en fin de liste) dans la limite fixée. */
export function selectMemoriesForPrompt(memories: readonly string[]): string[] {
  const selected: string[] = []
  let characters = 0
  for (let index = memories.length - 1; index >= 0; index--) {
    const memory = memories[index]!
    if (selected.length >= MEMORIES_MAX_COUNT || characters + memory.length > MEMORIES_MAX_CHARACTERS) break
    selected.unshift(memory)
    characters += memory.length
  }
  return selected
}

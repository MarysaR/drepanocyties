/**
 * Titre d'une conversation, dérivé du premier message de la personne.
 */
const TITLE_MAX_LENGTH = 60

export function deriveConversationTitle(firstMessage: string): string {
  const singleLine = firstMessage.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= TITLE_MAX_LENGTH) return singleLine
  const cut = singleLine.slice(0, TITLE_MAX_LENGTH)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

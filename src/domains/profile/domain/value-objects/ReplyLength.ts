/**
 * Longueur de réponse préférée pour le jumeau.
 */
export const replyLengths = ['SHORT', 'BALANCED', 'DETAILED'] as const

export type ReplyLength = (typeof replyLengths)[number]

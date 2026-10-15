/**
 * Proposition de souvenir formulée par le jumeau, en attente
 * d'une décision explicite de la personne. Elle n'est jamais réutilisée telle quelle.
 */
export interface MemoryProposal {
  readonly id: string
  readonly content: string
  readonly sourceMessageId: string | null
  readonly createdAt: Date
}

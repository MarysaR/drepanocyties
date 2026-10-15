/**
 * Conversation entre une personne et son jumeau.
 */
export interface Conversation {
  readonly id: string
  readonly title: string | null
  readonly createdAt: Date
  readonly lastActivityAt: Date
}

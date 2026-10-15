/**
 * Souvenir permanent : uniquement des informations que la personne
 * a explicitement acceptées ou rédigées elle-même.
 */
export const memoryOrigins = ['TWIN_PROPOSAL', 'PERSON_MESSAGE', 'WRITTEN_BY_PERSON'] as const

export type MemoryOrigin = (typeof memoryOrigins)[number]

export interface Memory {
  readonly id: string
  readonly content: string
  readonly origin: MemoryOrigin
  readonly sourceMessageId: string | null
  readonly consentedAt: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}

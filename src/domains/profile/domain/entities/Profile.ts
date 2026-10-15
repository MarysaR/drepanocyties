/**
 * Profil personnel : la manière dont la personne souhaite être appelée
 * et ce qu'elle choisit de partager, sans aucun champ médical imposé.
 */
import type { UserId } from '@shared/domain/UserId'
import type { ReplyLength } from '../value-objects/ReplyLength'

export interface Profile {
  readonly userId: UserId
  readonly preferredName: string | null
  readonly aboutMe: string | null
  readonly replyLength: ReplyLength
}

export function defaultProfile(userId: UserId): Profile {
  return { userId, preferredName: null, aboutMe: null, replyLength: 'BALANCED' }
}
